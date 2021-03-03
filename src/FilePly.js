import RhinoApp from './RhinoApp.js'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader'

let FilePly = {
  readFile (name, contents) {
    let rhino3dm = RhinoApp.getRhino3dm()
    let loader = new PLYLoader()
    let geometry = loader.parse(contents)
    console.log(geometry)
    let doc = new rhino3dm.File3dm()
    let layer = new rhino3dm.Layer()
    layer.name = 'Default'
    doc.layers().add(layer)
    let attrs = new rhino3dm.ObjectAttributes()
    attrs.layersIndex = 0
    let mesh = rhino3dm.Mesh.createFromThreejsJSON(geometry.toJSON())
    doc.objects().addMesh(mesh, attrs)
    return doc
  }
}

export default FilePly
