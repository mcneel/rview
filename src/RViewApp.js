import DisplayPipeline from './DisplayPipeline'
import RViewDoc from './RViewDoc'
import DisplayMode from './DisplayMode'

let _cachedDoc = null
let _modes = DisplayMode.defaultModes()

class RViewApp {
  #rhino3dm = null // rhino3dm.js wasm library (needs to be loaded async)
  #displayPipeline = null
  #glElementId = '' // parent DOM element id for WebGL control
  #document1 = null // main document we are viewing
  #document2 = null // 2nd document for comparison with main doc

  constructor () {
    this.#rhino3dm = null // rhino3dm.js wasm library (needs to be loaded async)
    this.#displayPipeline = null
    this.#glElementId = '' // parent DOM element id for WebGL control
    this.#document1 = null // main document we are viewing
    this.#document2 = null // 2nd document for comparison with main doc
    this._viewmodel = {
      model1: { exists: false, name: '', displayAttrs: { wires: true, shading: true } },
      model2: { exists: false, name: '', displayAttrs: { wires: true, shading: true } },
      expanded: ['Layers'],
      layers: [],
      perspectiveCamera: true,
      showGrid: true,
      comparePosition: 50,
      compareMode: 0
    }
  }

  /**
   * Called by top level App.vue to initialize rhino3dm wasm library. Web
   * assemblies must be loaded async. This function shows a wait spinner that
   * blocks UI untli the wasm is loaded
   * @param {rhino3dm} rh3dm rhino3dm wasm to load
   * @param {function} startwait function to call to show wait UI
   * @param {function} endwait function to end wait UI
   */
  init (rh3dm, startwait, endwait) {
    if (this.#rhino3dm == null) {
      let rhino3dmPromise = rh3dm()
      console.log('start loading rhino3dm')
      startwait()
      rhino3dmPromise.then(r => {
        this.#rhino3dm = r
        endwait()
        console.log('rhino3dm loaded')
        if (_cachedDoc != null) {
          let name = _cachedDoc[0]
          let byteArray = _cachedDoc[1]
          _cachedDoc = null
          this.openFile(name, byteArray, true)
        }
      })
    }
  }

  applicationTitle () {
    return 'rview WIP'
  }

  /**
   * Set the DOM element that this app will draw WebGL content into
   * @param {str} elementId id of the parent element for drawing
   */
  registerWebGlElement (elementId) {
    this.#glElementId = elementId
  }

  closeModel (model1) {
    if (model1 && this.#document1 != null) {
      this.#document1.dispose()
      this.#document1 = null
      this._viewmodel.model1.exists = false
      this._viewmodel.model1.name = ''
    }
    if (!model1 && this.#document2 != null) {
      this.#document2.dispose()
      this.#document2 = null
      this._viewmodel.model2.exists = false
      this._viewmodel.model2.name = ''
    }

    if (this.#displayPipeline != null && this.#document1 == null && this.#document2 == null) {
      this.#displayPipeline.dispose()
      this.#displayPipeline = null
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
  openFile (name, contents, model1) {
    // if rhino3dm is not available yet, store file in a variable that will
    // be used to call back into this function once the module is loaded
    if (this.#rhino3dm == null) {
      _cachedDoc = [name, contents]
      return false
    }

    const doc = RViewDoc.create(name, contents, this.#rhino3dm)
    if (doc == null) {
      alert('Invalid document')
      return false
    }

    this.closeModel(model1)

    if (model1) {
      this.#document1 = doc
      this._viewmodel.model1.exists = true
      this._viewmodel.model1.name = this.#document1.name
    } else {
      this.#document2 = doc
      this._viewmodel.model2.exists = true
      this._viewmodel.model2.name = this.#document2.name
    }

    // rebuild layers
    this._viewmodel.layers = []
    if (this.#document1 != null) {
      let compareList = []
      for (let i = 0; i < this.#document1.layers.length; i++) {
        let addToList = true
        for (let j = 0; j < this._viewmodel.layers.length; j++) {
          if (this._viewmodel.layers[j].label === this.#document1.layers[i].label) {
            addToList = false
            break
          }
        }
        if (addToList) compareList.push(this.#document1.layers[i])
      }
      this._viewmodel.layers = this._viewmodel.layers.concat(compareList)
    }
    if (this.#document2 != null) {
      let compareList = []
      for (let i = 0; i < this.#document2.layers.length; i++) {
        let addToList = true
        for (let j = 0; j < this._viewmodel.layers.length; j++) {
          if (this._viewmodel.layers[j].label === this.#document2.layers[i].label) {
            addToList = false
            break
          }
        }
        if (addToList) compareList.push(this.#document2.layers[i])
      }
      this._viewmodel.layers = this._viewmodel.layers.concat(compareList)
    }

    let labelDiv = document.getElementById('labels')
    if (labelDiv != null) labelDiv.innerHTML = ''

    if (this.#document1 != null || this.#document2 != null) {
      this.updateVisibility()
      this.getDisplayPipeline().zoomExtents(true)
      // Make sure the render loop is running
      requestAnimationFrame(() => this.renderLoop())
    }
    return true
  }

  getDisplayPipeline () {
    if (this.#displayPipeline == null) {
      if (this.#glElementId === '') throw new Error('no element defined for WebGL')
      this.#displayPipeline = new DisplayPipeline(document.getElementById(this.#glElementId))
    }
    return this.#displayPipeline
  }

  getRhino3dm () {
    return this.#rhino3dm
  }

  viewModel () {
    return this._viewmodel
  }

  updateVisibility () {
    this._viewmodel.layers.forEach((layer) => {
      this.getSceneObjectsOnLayer(layer.label, true, false).forEach((obj) => {
        obj.visible = layer.visible
        if (obj.visible && obj.type === 'Mesh') {
          obj.visible = this._viewmodel.model1.displayAttrs.shading
        }
        if (obj.visible && obj.userData['surfaceWires']) {
          obj.visible = this._viewmodel.model1.displayAttrs.wires
        }
      })
      this.getSceneObjectsOnLayer(layer.label, false, true).forEach((obj) => {
        obj.visible = layer.visible
        if (obj.visible && obj.type === 'Mesh') {
          obj.visible = this._viewmodel.model2.displayAttrs.shading
        }
        if (obj.visible && obj.userData['surfaceWires']) {
          obj.visible = this._viewmodel.model2.displayAttrs.wires
        }
      })
    })

    if (this.#displayPipeline != null) this.#displayPipeline.setDirtyFlag()
  }

  getActiveModel () {
    return this.#document1
  }

  getSceneObjectsOnLayer (rootLayerName, forModel1, forModel2) {
    let objects = []
    if (this.#document1 != null && forModel1) {
      const activeDocObjects = this.#document1.getSceneObjectsOnLayer(rootLayerName)
      if (activeDocObjects != null) objects = objects.concat(activeDocObjects)
    }
    if (this.#document2 != null && forModel2) {
      const compareDocObjects = this.#document2.getSceneObjectsOnLayer(rootLayerName)
      if (compareDocObjects != null) objects = objects.concat(compareDocObjects)
    }
    return objects
  }

  visibleObjectsBoundingBox () {
    let bbox = null
    this._viewmodel.layers.forEach((layer) => {
      if (!layer.visible) {
        return
      }
      let objects = this.getSceneObjectsOnLayer(layer.label, true, true)
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
  renderLoop () {
    // constantly requeue a redraw
    requestAnimationFrame(() => this.renderLoop())
    // don't draw if there is no pipeline to draw
    if (this.#displayPipeline == null) return
    if (this.#document1 == null && this.#document2 == null) return

    this.#displayPipeline.drawFrameBuffer(
      this._viewmodel.showGrid,
      _modes[0],
      this.#document1,
      this.#document2,
      this._viewmodel.compareMode,
      this._viewmodel.comparePosition)
  }
}

export default (new RViewApp())
