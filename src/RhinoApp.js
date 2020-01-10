let _rhino3dm = null
let _activeDoc = null
let _activeDocEventWatcher = null
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
      for (let i = 0; i < count; i++) {
        let layer = layers.get(i)
        let node = {
          label: layer.name
        }
        _viewmodel.layers[0].children.push(node)
        layer.delete()
      }
      layers.delete()
    }

    if (_activeDocEventWatcher) {
      _activeDocEventWatcher()
    }
  },
  getActiveDoc () {
    return _activeDoc
  },
  setActiveDocChangedEventWatcher (eventWatcher) {
    _activeDocEventWatcher = eventWatcher
  }
}

export default RhinoApp
