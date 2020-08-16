import RViewApp from './RViewApp.js'
import { OBJLoader2 } from 'three/examples/jsm/loaders/OBJLoader2'

let FileObj = {
  readFile (name, contents) {
    let rhino3dm = RViewApp.getRhino3dm()
    let objLoader = new OBJLoader2()
    let threeObj = objLoader.parse(contents)
    let doc = new rhino3dm.File3dm()
    let layer = new rhino3dm.Layer()
    layer.name = 'Default'
    doc.layers().add(layer)
    let attrs = new rhino3dm.ObjectAttributes()
    attrs.layersIndex = 0
    threeObj.children.forEach((obj) => {
      if (obj.type === 'Mesh') {
        let mesh = rhino3dm.Mesh.createFromThreejsJSON(obj.geometry.toJSON())
        if (obj.material.color) {
          attrs.colorSource = rhino3dm.ObjectColorSource.ColorFromObject
          attrs.objectColor = {
            r: obj.material.color.r * 255,
            g: obj.material.color.g * 255,
            b: obj.material.color.b * 255,
            a: 255
          }
        } else {
          attrs.colorSource = rhino3dm.ObjectColorSource.ColorFromLayer
        }
        doc.objects().addMesh(mesh, attrs)
      }
    })
    return doc
  }
}

export default FileObj
