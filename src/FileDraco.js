import RhinoApp from './RhinoApp.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

let FileDraco = {
  readFile (name, buffer) {
    // let rhino3dm = RhinoApp.getRhino3dm()
    let dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderConfig({ type: 'js' })
    dracoLoader.setDecoderPath('./statics/')
    dracoLoader.preload()

    let taskConfig = {
      attributeIDs: dracoLoader.defaultAttributeIDs,
      attributeTypes: dracoLoader.defaultAttributeTypes,
      useUniqueIDs: false
    }
    dracoLoader.decodeGeometry(buffer, taskConfig)
      .then((geometry) => {
        let rhino3dm = RhinoApp.getRhino3dm()
        let doc = new rhino3dm.File3dm()
        let layer = new rhino3dm.Layer()
        layer.name = 'Default'
        doc.layers().add(layer)
        let attrs = new rhino3dm.ObjectAttributes()
        attrs.layersIndex = 0
        let json = geometry.toJSON()
        let mesh = rhino3dm.Mesh.createFromThreejsJSON(json)
        doc.objects().addMesh(mesh, attrs)
        RhinoApp.setActiveDoc(name, doc)
      })
      .catch(dracoLoader.onError)
  }
}

export default FileDraco
