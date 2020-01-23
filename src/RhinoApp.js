import * as THREE from 'three'
import FileObj from './FileObj.js'
import FileDraco from './FileDraco.js'
import FilePly from './FilePly.js'

let _rhino3dm = null
let _cachedDoc = null
let _activeDocEventWatchers = []
let _viewmodel = {
  docExists: false,
  filename: 'rview WIP',
  expanded: ['Layers'],
  layers: [],
  perspectiveCamera: true,
  onChangeCamera: function () {},
  gridVisible: true,
  lightColor: 'rgb(240,240,240)'
}
let _model = {
  rhinoDoc: null,
  three: {
    background: null,
    middleground: null
  },
  threeObjectsOnLayer: {},
  threeGrid: null,
  cameraLight: null
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

let RhinoApp = {
  init (rh3dm, startwait, endwait) {
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
  },
  getRhino3dm () {
    return _rhino3dm
  },
  viewModel () {
    return _viewmodel
  },
  updateVisibility () {
    _viewmodel.layers.forEach((layer) => {
      let objects = _model.threeObjectsOnLayer[layer.label]
      if (objects != null) {
        objects.forEach((obj) => {
          obj.visible = layer.visible
        })
      }
    })
    if (_model.threeGrid) {
      _model.threeGrid.visible = _viewmodel.gridVisible
    }
  },
  updateColors () {
    _model.cameraLight.color = new THREE.Color(_viewmodel.lightColor)
  },
  openFile (name, contents) {
    if (_rhino3dm == null) {
      _cachedDoc = [name, contents]
      return
    }

    if (name.endsWith('.obj')) {
      let doc = FileObj.readFile(name, contents)
      this.setActiveDoc(name, doc)
    } else if (name.endsWith('.drc')) {
      FileDraco.readFile(name, contents)
    } else if (name.endsWith('.ply')) {
      let doc = FilePly.readFile(name, contents)
      this.setActiveDoc(name, doc)
    } else {
      let doc = _rhino3dm.File3dm.fromByteArray(contents)
      this.setActiveDoc(name, doc)
    }
  },
  setActiveDoc (name, doc) {
    console.log('setActiveDoc (' + name + ')')

    if (_model.rhinoDoc) {
      _model.rhinoDoc.delete()
    }
    this.disposeMiddleground()
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
  },
  getActiveDoc () {
    return _model
  },
  addActiveDocChangedEventWatcher (eventWatcher) {
    _activeDocEventWatchers.push(eventWatcher)
  },
  disposeMiddleground () {
    if (_model.three.middleground) {
      _model.three.middleground.dispose()
      _model.three.middleground = null
    }
  },
  visibleObjectsBoundingBox () {
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
}

export default RhinoApp
