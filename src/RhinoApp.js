let _rhino3dm = null

let _activeDocEventWatchers = []
let _viewmodel = {
  docExists: false,
  filename: 'rview WIP',
  expanded: ['Layers'],
  layers: [],
  perspectiveCamera: true,
  onChangeCamera: function () {}
}
let _model = {
  rhinoDoc: null,
  threeScene: null,
  threeObjectsOnLayer: {}
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
  },
  setActiveDoc (name, byteArray) {
    console.log('setActiveDoc (' + name + ')')
    let doc = _rhino3dm.File3dm.fromByteArray(byteArray)
    if (_model.rhinoDoc) {
      _model.rhinoDoc.delete()
    }
    if (_model.threeScene) {
      _model.threeScene.dispose()
      _model.threeScene = null
    }
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
  visibleObjectsBoundingBox () {
    let bbox = new _rhino3dm.BoundingBox(1, 1, 1, -1, -1, -1)
    let doc = RhinoApp.getActiveDoc().rhinoDoc
    let objects = doc.objects()
    for (let i = 0; i < objects.count; i++) {
      let modelObject = objects.get(i)
      if (modelObject == null) {
        continue
      }
      let geometry = modelObject.geometry()
      let attr = modelObject.attributes()
      let layer = doc.layers().get(attr.layerIndex)
      let rootLayer = layer.fullPath.split('::')[0]
      if (!_viewmodel.layers[rootLayer] || !_viewmodel.layers[rootLayer].visible) {
        continue
      }
      let geometryBbox = geometry.getBoundingBox()
      bbox = bbox.union(geometryBbox, bbox)
      geometryBbox.delete()
      layer.delete()
      attr.delete()
      geometry.delete()
      modelObject.delete()
    }
    objects.delete()
    return bbox
  }
}

export default RhinoApp
