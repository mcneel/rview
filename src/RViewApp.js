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

export default class RViewApp {
  static #rhino3dm = null // rhino3dm.js wasm library (needs to be loaded async)
  static #redrawEnabled = false
  static #displayPipeline = null
  static #glElementId = '' // parent DOM element id for WebGL control
  static #activeDoc = null // document we are viewing. May contain data from more than one file
  static #displayModes = DisplayMode.defaultModes()

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
    if (doc) _viewmodel.layers = doc.layers

    _activeDocEventWatchers.forEach((ew) => { ew() })
    RViewApp.onActiveDocChanged()
    RViewApp.updateVisibility()
  }

  static createScene () {
    let labelDiv = document.getElementById('labels')
    if (labelDiv != null) labelDiv.innerHTML = ''
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
  }

  static setActiveDisplayMode (name, performRegen = true) {
    if (RViewApp.#displayModes == null) RViewApp.#displayModes = DisplayMode.defaultModes()

    for (let i = 0; i < RViewApp.#displayModes.length; i++) {
      if (RViewApp.#displayModes[i].name === name) {
        _viewmodel.displayMode = RViewApp.#displayModes[i]
        break
      }
    }

    RViewApp.applyMaterial2(name === 'Rendered')

    if (performRegen) {
      RViewApp.updateVisibility()
    }
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
    console.log('apply materials')
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

    RViewApp.#displayPipeline.drawFrameBuffer(_viewmodel.displayMode)
  }
}
