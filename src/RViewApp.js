import DisplayPipeline from './DisplayPipeline'
import RViewDoc from './RViewDoc'
import DisplayMode from './DisplayMode'

let _cachedDoc = null
let _viewmodel = {
  model1: { exists: false, name: '', displayAttrs: { wires: true, shading: true } },
  model2: { exists: false, name: '', displayAttrs: { wires: true, shading: true } },
  expanded: ['Layers'],
  layers: [],
  perspectiveCamera: true,
  showGrid: true,
  comparePosition: 50,
  compareMode: 0
}
let _modes = DisplayMode.defaultModes()

export default class RViewApp {
  static #rhino3dm = null // rhino3dm.js wasm library (needs to be loaded async)
  static #displayPipeline = null
  static #glElementId = '' // parent DOM element id for WebGL control
  static #document1 = null // main document we are viewing
  static #document2 = null // 2nd document for comparison with main doc

  /**
   * Called by top level App.vue to initialize rhino3dm wasm library. Web
   * assemblies must be loaded async. This function shows a wait spinner that
   * blocks UI untli the wasm is loaded
   * @param {rhino3dm} rh3dm rhino3dm wasm to load
   * @param {function} startwait function to call to show wait UI
   * @param {function} endwait function to end wait UI
   */
  static init (rh3dm, startwait, endwait) {
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
          RViewApp.openFile(name, byteArray, true)
        }
      })
    }
  }

  static applicationTitle () {
    return 'rview WIP'
  }

  /**
   * Set the DOM element that this app will draw WebGL content into
   * @param {str} elementId id of the parent element for drawing
   */
  static registerWebGlElement (elementId) {
    RViewApp.#glElementId = elementId
  }

  static closeModel (model1) {
    if (model1 && RViewApp.#document1 != null) {
      RViewApp.#document1.dispose()
      RViewApp.#document1 = null
      _viewmodel.model1.exists = false
      _viewmodel.model1.name = ''
    }
    if (!model1 && RViewApp.#document2 != null) {
      RViewApp.#document2.dispose()
      RViewApp.#document2 = null
      _viewmodel.model2.exists = false
      _viewmodel.model2.name = ''
    }

    if (RViewApp.#displayPipeline != null && RViewApp.#document1 == null && RViewApp.#document2 == null) {
      RViewApp.#displayPipeline.dispose()
      RViewApp.#displayPipeline = null
    }
  }

  /**
   * Open a single file and make it the active document. This closes the
   * existing active document
   * @param {str} name name of file being opening
   * @param {str|ArrayBuffer} contents content of file
   * @param {boolean} model1 open the file as 1st model
   * @returns true if a document is successfully opened
   */
  static openFile (name, contents, model1) {
    // if rhino3dm is not available yet, store file in a variable that will
    // be used to call back into this function once the module is loaded
    if (RViewApp.#rhino3dm == null) {
      _cachedDoc = [name, contents]
      return false
    }

    const doc = RViewDoc.create(name, contents, RViewApp.#rhino3dm)
    if (doc == null) {
      alert('Invalid document')
      return false
    }

    RViewApp.closeModel(model1)

    if (model1) {
      RViewApp.#document1 = doc
      _viewmodel.model1.exists = true
      _viewmodel.model1.name = RViewApp.#document1.name
    } else {
      RViewApp.#document2 = doc
      _viewmodel.model2.exists = true
      _viewmodel.model2.name = RViewApp.#document2.name
    }

    // rebuild layers
    _viewmodel.layers = []
    if (RViewApp.#document1 != null) {
      let compareList = []
      for (let i = 0; i < RViewApp.#document1.layers.length; i++) {
        let addToList = true
        for (let j = 0; j < _viewmodel.layers.length; j++) {
          if (_viewmodel.layers[j].label === RViewApp.#document1.layers[i].label) {
            addToList = false
            break
          }
        }
        if (addToList) compareList.push(RViewApp.#document1.layers[i])
      }
      _viewmodel.layers = _viewmodel.layers.concat(compareList)
    }
    if (RViewApp.#document2 != null) {
      let compareList = []
      for (let i = 0; i < RViewApp.#document2.layers.length; i++) {
        let addToList = true
        for (let j = 0; j < _viewmodel.layers.length; j++) {
          if (_viewmodel.layers[j].label === RViewApp.#document2.layers[i].label) {
            addToList = false
            break
          }
        }
        if (addToList) compareList.push(RViewApp.#document2.layers[i])
      }
      _viewmodel.layers = _viewmodel.layers.concat(compareList)
    }

    let labelDiv = document.getElementById('labels')
    if (labelDiv != null) labelDiv.innerHTML = ''

    if (RViewApp.#document1 != null || RViewApp.#document2 != null) {
      RViewApp.updateVisibility()
      RViewApp.getDisplayPipeline().zoomExtents(true)
      // Make sure the render loop is running
      requestAnimationFrame(() => RViewApp.renderLoop())
    }
    return true
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
      RViewApp.getSceneObjectsOnLayer(layer.label, true, false).forEach((obj) => {
        obj.visible = layer.visible
        if (obj.visible && obj.type === 'Mesh') {
          obj.visible = _viewmodel.model1.displayAttrs.shading
        }
        if (obj.visible && obj.userData['surfaceWires']) {
          obj.visible = _viewmodel.model1.displayAttrs.wires
        }
      })
      RViewApp.getSceneObjectsOnLayer(layer.label, false, true).forEach((obj) => {
        obj.visible = layer.visible
        if (obj.visible && obj.type === 'Mesh') {
          obj.visible = _viewmodel.model2.displayAttrs.shading
        }
        if (obj.visible && obj.userData['surfaceWires']) {
          obj.visible = _viewmodel.model2.displayAttrs.wires
        }
      })
    })

    if (RViewApp.#displayPipeline != null) RViewApp.#displayPipeline.setDirtyFlag()
  }

  static getActiveModel () {
    return RViewApp.#document1
  }

  static getSceneObjectsOnLayer (rootLayerName, forModel1, forModel2) {
    let objects = []
    if (RViewApp.#document1 != null && forModel1) {
      const activeDocObjects = RViewApp.#document1.getSceneObjectsOnLayer(rootLayerName)
      if (activeDocObjects != null) objects = objects.concat(activeDocObjects)
    }
    if (RViewApp.#document2 != null && forModel2) {
      const compareDocObjects = RViewApp.#document2.getSceneObjectsOnLayer(rootLayerName)
      if (compareDocObjects != null) objects = objects.concat(compareDocObjects)
    }
    return objects
  }

  static visibleObjectsBoundingBox () {
    let bbox = null
    _viewmodel.layers.forEach((layer) => {
      if (!layer.visible) {
        return
      }
      let objects = RViewApp.getSceneObjectsOnLayer(layer.label, true, true)
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

  /**
   * Private method called by the browser's animation redraw system. This
   * method is used to constantly redraw the WebGL viewport
   */
  static renderLoop () {
    // constantly requeue a redraw
    requestAnimationFrame(() => RViewApp.renderLoop())
    // don't draw if there is no pipeline to draw
    if (RViewApp.#displayPipeline == null) return
    if (RViewApp.#document1 == null && RViewApp.#document2 == null) return

    RViewApp.#displayPipeline.drawFrameBuffer(
      _viewmodel.showGrid,
      _modes[0],
      RViewApp.#document1,
      RViewApp.#document2,
      _viewmodel.compareMode,
      _viewmodel.comparePosition)
  }
}
