import * as THREE from 'three'
import FileObj from './FileObj'
import FileDraco from './FileDraco'
import FilePly from './FilePly'
import SceneUtilities from './SceneUtilities'
import DisplayMode from './DisplayMode'
import DisplayPipeline from './DisplayPipeline'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

let _glElementId = ''
let _dp = null
let _redrawEnabled = false
let _rhino3dm = null
let _cachedDoc = null
let _activeDocEventWatchers = []
let _viewmodel = {
  docExists: false,
  filename: 'rview WIP',
  expanded: ['Layers'],
  layers: [],
  perspectiveCamera: true,
  currentMaterialStyle: 'Basic',
  materialOptions: ['Basic', 'PBR: Carbon Fiber', 'PBR: Chipped Paint Metal',
    'PBR: Scuffed Plastic', 'PBR: Streaked Metal'],
  displayMode: null
}

let _model = {
  rhinoDoc: null,
  three: {
    background: null,
    middleground: null,
    foreground: null
  },
  threeObjectsOnLayer: {},
  threeGrid: null,
  cameraLight: null,
  displayModes: null
}

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
  static #redrawEnabled = false

  static init (rh3dm, startwait, endwait) {
    _model.displayModes = DisplayMode.defaultModes()
    this.setActiveDisplayMode('Shaded', false)
    if (_rhino3dm == null) {
      let rhino3dmPromise = rh3dm()
      console.log('start loading rhino3dm')
      startwait()
      rhino3dmPromise.then(r => {
        _rhino3dm = r
        endwait()
        console.log('rhino3dm loaded')
        if (_cachedDoc != null) {
          let name = _cachedDoc[0]
          let byteArray = _cachedDoc[1]
          _cachedDoc = null
          this.openFile(name, byteArray)
        }
      })
    }
  }
  static enableRedraw (on) {
    _redrawEnabled = on
    if (on && _dp != null) {
      _dp.animate()
    }
  }
  static redrawEnabled () {
    return _redrawEnabled
  }
  static registerWebGlElement (elementId) {
    _glElementId = elementId
  }
  static createScene () {
    this.getDisplayPipeline()
    this.disposeMiddleground()
    this.disposeForeground()
    let labelDiv = document.getElementById('labels')
    labelDiv.innerHTML = ''
    let model = this.getActiveModel()
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
    if (_dp == null) {
      if (_glElementId === '') throw new Error('no WebGl element defined')
      _dp = new DisplayPipeline(document.getElementById(_glElementId))
    }
    return _dp
  }
  static getRhino3dm () {
    return _rhino3dm
  }
  static viewModel () {
    return _viewmodel
  }
  static updateVisibility () {
    _viewmodel.layers.forEach((layer) => {
      let objects = _model.threeObjectsOnLayer[layer.label]
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
    if (_model.threeGrid) {
      _model.threeGrid.visible = _viewmodel.displayMode.showGrid
    }
  }
  static setActiveDisplayMode (name, performRegen = true) {
    for (let i = 0; i < _model.displayModes.length; i++) {
      if (_model.displayModes[i].name === name) {
        _viewmodel.displayMode = _model.displayModes[i]
        break
      }
    }

    this.applyMaterial2(name === 'Rendered')

    if (performRegen) {
      this.regen()
    }
    const useSSAO = this.viewModel().displayMode.name === 'Arctic'
    if (_dp != null) {
      _dp.enableSSAO(useSSAO)
    }
  }

  static updateColors () {
    const dm = _viewmodel.displayMode
    _model.cameraLight.color = new THREE.Color(dm.lightColor)
    if (_dp == null) return
    if (dm.backgroundStyle === DisplayMode.backgroundModes[0]) {
      _dp.setBackground(_model.three.background, dm.backgroundColor)
    } else if (dm.backgroundStyle === DisplayMode.backgroundModes[1]) {
      _dp.setBackground(_model.three.background, dm.backgroundGradientTop, dm.backgroundGradientBottom)
    } else {
      _dp.setBackground(_model.three.background, null, null, dm.backgroundStyle)
    }
  }
  static updateMaterial () {
    /*
    if (_viewmodel.currentMaterialStyle !== _viewmodel.materialOptions[0]) {
      let name = _viewmodel.currentMaterialStyle.substr('PBR: '.length).toLowerCase()
      name = name.replace(/ /g, '-')
      SceneUtilities.createPBRMaterial(name, this.applyMaterial)
    } else {
      this.applyMaterial(null)
    }
    */
  }
  static regen () {
    this.updateVisibility()
    this.updateColors()
    this.updateMaterial()
  }
  static applyMaterial (material) {
    _viewmodel.layers.forEach((layer) => {
      let objects = _model.threeObjectsOnLayer[layer.label]
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
      let objects = _model.threeObjectsOnLayer[layer.label]
      if (objects != null) {
        objects.forEach((obj) => {
          if (obj.type === 'Mesh' && obj.userData['diffuse']) {
            if (obj.material) {
              obj.material.dispose()
              obj.material = null
            }

            if (useRenderMaterial) {
              let id = obj.userData['materialId']
              let materials = _model.rhinoDoc.materials()
              let material = materials.findId(id)
              obj.material = SceneUtilities.createThreeMaterial(material, _model.rhinoDoc)
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
  static openFile (name, contents) {
    if (_rhino3dm == null) {
      _cachedDoc = [name, contents]
      return
    }

    if (name.endsWith('.obj')) {
      let doc = FileObj.readFile(name, contents)
      doc ? this.setActiveDoc(name, doc) : alert('Invalid document.')
    } else if (name.endsWith('.drc')) {
      FileDraco.readFile(name, contents)
    } else if (name.endsWith('.ply')) {
      let doc = FilePly.readFile(name, contents)
      doc ? this.setActiveDoc(name, doc) : alert('Invalid document.')
    } else {
      let doc = _rhino3dm.File3dm.fromByteArray(contents)
      doc ? this.setActiveDoc(name, doc) : alert('Invalid document.')
    }
  }
  static setActiveDoc (name, doc) {
    console.log('setActiveDoc (' + name + ')')

    if (_model.rhinoDoc) {
      _model.rhinoDoc.delete()
    }
    this.disposeMiddleground()
    this.disposeForeground()
    _model.threeObjectsOnLayer = {}
    _model.rhinoDoc = doc
    _viewmodel.docExists = (doc != null)
    _viewmodel.filename = name
    _viewmodel.layers.length = 0
    if (doc) {
      let layers = doc.layers()
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
    this.onActiveDocChanged()
    this.regen()
  }
  static getActiveModel () {
    return _model
  }
  static addActiveDocChangedEventWatcher (eventWatcher) {
    _activeDocEventWatchers.push(eventWatcher)
  }
  static disposeMiddleground () {
    if (_model.three.middleground) {
      _model.three.middleground.dispose()
      _model.three.middleground = null
    }
  }
  static disposeForeground () {
    if (_model.three.foreground) {
      _model.three.foreground.dispose()
      _model.three.foreground = null
    }
  }
  static visibleObjectsBoundingBox () {
    let bbox = null
    _viewmodel.layers.forEach((layer) => {
      if (!layer.visible) {
        return
      }
      let objects = _model.threeObjectsOnLayer[layer.label]
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
    this.createScene()
    let model = this.getActiveModel()
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
    this.updateVisibility()
    this.getDisplayPipeline().zoomExtents(true)
    RViewApp.#redrawEnabled = true
    RViewApp.enableRedraw(true)
    // start RenderLoop
  }
}
