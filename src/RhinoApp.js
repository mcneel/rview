let _rhino3dm = null
let _activeDoc = null
let _activeDocEventWatchers = []
let _viewmodel = {
  docExists: false,
  filename: '',
  expanded: ['Layers'],
  layers: [{
    label: 'Layers',
    header: 'root',
    children: []
  }]
}

function addToDictionary (dictionary, chunks) {
  chunks.forEach((chunk) => {
    if (!dictionary.hasOwnProperty(chunk)) {
      dictionary[chunk] = {}
    }
    dictionary = dictionary[chunk]
  })
}

function createNodes (dictionary) {
  let nodes = []
  let names = Object.getOwnPropertyNames(dictionary)
  names.forEach((name) => {
    let node = {
      label: name
    }
    let childNodes = createNodes(dictionary[name])
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
  setActiveDoc (name, byteArray) {
    let doc = _rhino3dm.File3dm.fromByteArray(byteArray)
    if (_activeDoc) {
      _activeDoc.delete()
    }
    _activeDoc = doc
    _viewmodel.docExists = (doc != null)
    _viewmodel.filename = name
    _viewmodel.layers[0].children.length = 0
    if (doc) {
      let layers = doc.layers()
      let count = layers.count()
      let topLayers = {}
      for (let i = 0; i < count; i++) {
        let layer = layers.get(i)
        let fullpath = layer.fullPath
        layer.delete()
        let chunks = fullpath.split('::')
        addToDictionary(topLayers, chunks)
      }

      _viewmodel.layers[0].children = createNodes(topLayers)

      layers.delete()
    }

    _activeDocEventWatchers.forEach((ew) => { ew() })
  },
  getActiveDoc () {
    return _activeDoc
  },
  addActiveDocChangedEventWatcher (eventWatcher) {
    _activeDocEventWatchers.push(eventWatcher)
  }
}

export default RhinoApp
