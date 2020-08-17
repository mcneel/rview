import * as THREE from 'three'
import SceneUtilities from './SceneUtilities'
import DisplayMode from './DisplayMode'
import DisplayPipeline from './DisplayPipeline'
import RViewDoc from './RViewDoc'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

let _cachedDoc = null
let _activeDocEventWatchers = []
let _viewmodel = {
  docExists: false,
  title: 'rview WIP',
  expanded: ['Layers'],
  layers: [],
  perspectiveCamera: true,
  currentMaterialStyle: 'Basic',
  materialOptions: ['Basic', 'PBR: Carbon Fiber', 'PBR: Chipped Paint Metal',
    'PBR: Scuffed Plastic', 'PBR: Streaked Metal'],
  displayMode: null
}

let _displayModes = DisplayMode.defaultModes()

function addToDictionary (node, chunks, layer) {
  chunks.forEach((chunk) => {
    if (!node.layers.hasOwnProperty(chunk)) {
      node.layers[chunk] = {
        visible: true,
        layers: {}
      }
    }
    node = node.layers[chunk]
  })
  node.visible = layer.visible
}

function createNodes (dictionary) {
  let nodes = []
  let names = Object.getOwnPropertyNames(dictionary.layers)
  names.forEach((name) => {
    let node = {
      label: name,
      visible: dictionary.layers[name].visible
    }
    let childNodes = createNodes(dictionary.layers[name])
    if (childNodes.length > 0) {
      node.children = childNodes
    }
    nodes.push(node)
  })
  return nodes
}

export default class RViewApp {
  static #rhino3dm = null // rhino3dm.js wasm library (needs to be loaded async)
  static #redrawEnabled = false
  static #displayPipeline = null
  static #glElementId = '' // parent DOM element id for WebGL control
  static #activeDoc = null // document we are viewing. May contain data from more than one file

  /**
   * Called by top level App.vue to initialize rhino3dm wasm library. Web
   * assemblies must be loaded async. This function shows a wait spinner that
   * blocks UI untli the wasm is loaded
   * @param {rhino3dm} rh3dm rhino3dm wasm to load
   * @param {function} startwait function to call to show wait UI
   * @param {function} endwait function to end wait UI
   */
  static init (rh3dm, startwait, endwait) {
    RViewApp.setActiveDisplayMode('Shaded', false)
    if (RViewApp.#rhino3dm == null) {
      let rhino3dmPromise = rh3dm()
      console.log('start loading rhino3dm')
      startwait()
      rhino3dmPromise.then(r => {
        RViewApp.#rhino3dm = r
        endwait()
        console.log('rhino3dm loaded')
        if (_cachedDoc != null) {
          let name = _cachedDoc[0]
          let byteArray = _cachedDoc[1]
          _cachedDoc = null
          RViewApp.openFile(name, byteArray)
        }
      })
    }
  }

  /**
   * Set the DOM element that this app will draw WebGL content into
   * @param {str} elementId id of the parent element for drawing
   */
  static registerWebGlElement (elementId) {
    RViewApp.#glElementId = elementId
  }

  /**
   * Open a single file and make it the active document. This closes the
   * existing active document
   * @param {str} name name of file being opening
   * @param {str|ArrayBuffer} contents content of file
   */
  static openFile (name, contents) {
    // if rhino3dm is not avaiable yet, store file in a variable that will
    // be used to call back into this function once the module is loaded
    if (RViewApp.#rhino3dm == null) {
      _cachedDoc = [name, contents]
      return
    }

    const doc = RViewDoc.create(name, contents, RViewApp.#rhino3dm)
    if (doc != null) {
      _viewmodel.title = name
      RViewApp.setActiveDoc(doc)
    } else {
      alert('Invalid document')
    }
  }

  static setActiveDoc (doc) {
    console.log('setActiveDoc')

    if (RViewApp.#activeDoc != null) {
      RViewApp.#activeDoc.dispose()
    }
    RViewApp.#activeDoc = doc

    _viewmodel.docExists = (doc != null)
    _viewmodel.layers.length = 0

    if (doc) {
      let layers = doc.rhinoDoc.layers()
      let count = layers.count()
      let topLayers = {
        layers: {},
        visible: true
      }
      for (let i = 0; i < count; i++) {
        let layer = layers.get(i)
        let fullpath = layer.fullPath
        let chunks = fullpath.split('::')
        addToDictionary(topLayers, chunks, layer)
        layer.delete()
      }

      _viewmodel.layers = createNodes(topLayers)

      layers.delete()
    }

    _activeDocEventWatchers.forEach((ew) => { ew() })
    RViewApp.onActiveDocChanged()
    RViewApp.regen()
  }

  static createScene () {
    RViewApp.getDisplayPipeline()

    let labelDiv = document.getElementById('labels')
    labelDiv.innerHTML = ''
    let model = RViewApp.getActiveModel()
    model.three.middleground = new THREE.Scene()
    model.three.foreground = new THREE.Scene()

    model.clippingPlanes = []

    if (model.three.background == null) {
      model.three.background = new THREE.Scene()
      model.three.background.background = new THREE.Color(0.75, 0.75, 0.75)
      let grid = SceneUtilities.createGrid()
      model.threeGrid = grid
      model.three.background.add(grid)
    }
  }
  static getDisplayPipeline () {
    if (RViewApp.#displayPipeline == null) {
      if (RViewApp.#glElementId === '') throw new Error('no element defined for WebGL')
      RViewApp.#displayPipeline = new DisplayPipeline(document.getElementById(RViewApp.#glElementId))
    }
    return RViewApp.#displayPipeline
  }
  static getRhino3dm () {
    return RViewApp.#rhino3dm
  }
  static viewModel () {
    return _viewmodel
  }
  static updateVisibility () {
    _viewmodel.layers.forEach((layer) => {
      let objects = RViewApp.#activeDoc.threeObjectsOnLayer[layer.label]
      if (objects != null) {
        objects.forEach((obj) => {
          obj.visible = layer.visible
          if (obj.visible && obj.type === 'Mesh') {
            obj.visible = _viewmodel.displayMode.showSurfaceMeshes
          }
          if (obj.visible && obj.userData['surfaceWires']) {
            obj.visible = _viewmodel.displayMode.showSurfaceWires
          }
        })
      }
    })
    if (RViewApp.#activeDoc.threeGrid) {
      RViewApp.#activeDoc.threeGrid.visible = _viewmodel.displayMode.showGrid
    }
  }

  static setActiveDisplayMode (name, performRegen = true) {
    if (_displayModes == null) _displayModes = DisplayMode.defaultModes()

    for (let i = 0; i < _displayModes.length; i++) {
      if (_displayModes[i].name === name) {
        _viewmodel.displayMode = _displayModes[i]
        break
      }
    }

    RViewApp.applyMaterial2(name === 'Rendered')

    if (performRegen) {
      RViewApp.regen()
    }
    const useSSAO = RViewApp.viewModel().displayMode.name === 'Arctic'
    if (RViewApp.#displayPipeline != null) {
      RViewApp.#displayPipeline.enableSSAO(useSSAO)
    }
  }

  static updateColors () {
    const dm = _viewmodel.displayMode
    RViewApp.#activeDoc.cameraLight.color = new THREE.Color(dm.lightColor)
    if (RViewApp.#displayPipeline == null) return
    if (dm.backgroundStyle === DisplayMode.backgroundModes[0]) {
      RViewApp.#displayPipeline.setBackground(RViewApp.#activeDoc.three.background, dm.backgroundColor)
    } else if (dm.backgroundStyle === DisplayMode.backgroundModes[1]) {
      RViewApp.#displayPipeline.setBackground(RViewApp.#activeDoc.three.background, dm.backgroundGradientTop, dm.backgroundGradientBottom)
    } else {
      RViewApp.#displayPipeline.setBackground(RViewApp.#activeDoc.three.background, null, null, dm.backgroundStyle)
    }
  }
  static updateMaterial () {
    /*
    if (_viewmodel.currentMaterialStyle !== _viewmodel.materialOptions[0]) {
      let name = _viewmodel.currentMaterialStyle.substr('PBR: '.length).toLowerCase()
      name = name.replace(/ /g, '-')
      SceneUtilities.createPBRMaterial(name, RViewApp.applyMaterial)
    } else {
      RViewApp.applyMaterial(null)
    }
    */
  }
  static regen () {
    RViewApp.updateVisibility()
    RViewApp.updateColors()
    RViewApp.updateMaterial()
  }
  static applyMaterial (material) {
    _viewmodel.layers.forEach((layer) => {
      let objects = RViewApp.#activeDoc.threeObjectsOnLayer[layer.label]
      if (objects != null) {
        objects.forEach((obj) => {
          if (obj.type === 'Mesh' && obj.userData['diffuse']) {
            if (obj.material) {
              obj.material.dispose()
              obj.material = null
            }
            if (material == null) {
              let diffuse = obj.userData['diffuse']
              obj.material = new THREE.MeshPhongMaterial({
                color: diffuse,
                side: THREE.DoubleSide
              })
              if (_viewmodel.displayMode.transparency) {
                obj.material.opacity = _viewmodel.displayMode.transparency
                obj.material.transparent = true
              }
            } else {
              obj.material = material
            }
          }
        })
      }
    })
  }
  static applyMaterial2 (useRenderMaterial) {
    _viewmodel.layers.forEach((layer) => {
      let objects = RViewApp.#activeDoc.threeObjectsOnLayer[layer.label]
      if (objects != null) {
        objects.forEach((obj) => {
          if (obj.type === 'Mesh' && obj.userData['diffuse']) {
            if (obj.material) {
              obj.material.dispose()
              obj.material = null
            }

            if (useRenderMaterial) {
              let id = obj.userData['materialId']
              let materials = RViewApp.#activeDoc.rhinoDoc.materials()
              let material = materials.findId(id)
              obj.material = SceneUtilities.createThreeMaterial(material, RViewApp.#activeDoc.rhinoDoc)
              material.delete()
              materials.delete()
            }
            if (obj.material == null) {
              let diffuse = obj.userData['diffuse']
              obj.material = new THREE.MeshPhongMaterial({
                color: diffuse,
                side: THREE.DoubleSide
              })
              if (_viewmodel.displayMode.transparency) {
                obj.material.opacity = _viewmodel.displayMode.transparency
                obj.material.transparent = true
              }
            }
          }
        })
      }
    })
  }
  static getActiveModel () {
    return RViewApp.#activeDoc
  }
  static addActiveDocChangedEventWatcher (eventWatcher) {
    _activeDocEventWatchers.push(eventWatcher)
  }
  static visibleObjectsBoundingBox () {
    let bbox = null
    _viewmodel.layers.forEach((layer) => {
      if (!layer.visible) {
        return
      }
      let objects = RViewApp.#activeDoc.threeObjectsOnLayer[layer.label]
      if (objects == null) {
        return
      }
      objects.forEach((threeObject) => {
        if (threeObject.boundingBox == null) { return }
        if (bbox == null) {
          bbox = threeObject.boundingBox.clone()
        } else {
          bbox.union(threeObject.boundingBox)
        }
      })
    })
    return bbox
  }
  static onActiveDocChanged () {
    console.log('Building Scene')
    RViewApp.#redrawEnabled = false
    RViewApp.createScene()
    let model = RViewApp.getActiveModel()
    let doc = model.rhinoDoc

    let objects = doc.objects()
    for (let i = 0; i < objects.count; i++) {
      let modelObject = objects.get(i)
      if (modelObject == null) {
        continue
      }
      let geometry = modelObject.geometry()
      let attr = modelObject.attributes()
      if (attr.isInstanceDefinitionObject) {
        continue
      }
      let layer = doc.layers().get(attr.layerIndex)
      let rootLayer = layer.fullPath.split('::')[0]
      if (!model.threeObjectsOnLayer[rootLayer]) {
        model.threeObjectsOnLayer[rootLayer] = []
      }
      let objectsToAdd = SceneUtilities.createThreeGeometry(geometry, attr, doc)

      objectsToAdd.forEach((obj) => {
        let threeGeometry = obj[0]
        let bbox = obj[1]
        if (bbox) {
          let minPoint = new THREE.Vector3(bbox.min[0], bbox.min[1], bbox.min[2])
          let maxPoint = new THREE.Vector3(bbox.max[0], bbox.max[1], bbox.max[2])
          threeGeometry.boundingBox = new THREE.Box3(minPoint, maxPoint)
          bbox.delete()
        }
        switch (threeGeometry.constructor) {
          case CSS2DObject: // handling CSS2D lables type
            model.three.foreground.add(threeGeometry)
            model.threeObjectsOnLayer[rootLayer].push(threeGeometry)
            break
          case THREE.Plane: // handling clipping planes
            model.clippingPlanes.push(threeGeometry)
            break
          default:
            model.three.middleground.add(threeGeometry)
            model.threeObjectsOnLayer[rootLayer].push(threeGeometry)
            break
        }
        // let box = new THREE.BoxHelper(threeGeometry, 0x000000)
        // model.three.middleground.add(box)
        // model.threeObjectsOnLayer[rootLayer].push(box)
      })
      modelObject.delete()
      geometry.delete()
      attr.delete()
    }
    objects.delete()
    RViewApp.updateVisibility()
    RViewApp.getDisplayPipeline().zoomExtents(true)
    RViewApp.#redrawEnabled = true
    // Make sure the render loop is running
    requestAnimationFrame(() => RViewApp.renderLoop())
  }

  /**
   * Private method called by the browser's animation redraw system. This
   * method is used to constantly redraw the WebGL viewport
   */
  static renderLoop () {
    // constantly requeue a redraw
    requestAnimationFrame(() => RViewApp.renderLoop())
    // don't draw if drawing is disabled or there is no pipeline to draw
    if (!RViewApp.#redrawEnabled || RViewApp.#displayPipeline == null) return

    RViewApp.#displayPipeline.drawFrameBuffer()
  }
}
