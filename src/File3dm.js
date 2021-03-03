import RhinoApp from './RhinoApp.js'
import { Rhino3dmLoader } from 'three/examples/jsm/loaders/3DMLoader'

let FilePly = {
  readFile (name, contents) {
    let rhino3dm = RhinoApp.getRhino3dm()
    const loader = new Rhino3dmLoader()
    loader.setLibraryPath('https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/')

    return new Promise((resolve, reject) => {
      loader.parse(contents, function (threeObj) {
        let doc = new rhino3dm.File3dm()
        let defaultLayerIndex = null
        const layers = threeObj.userData.layers

        layers.forEach((l) => {
          let layer = new rhino3dm.Layer()
          layer.name = l.name
          doc.layers().add(layer)
        })

        threeObj.children.forEach((obj) => {
          let attrs = new rhino3dm.ObjectAttributes()
          if (obj.type === 'Mesh') {
            try {
              attrs.layerIndex = obj.userData.attributes.layerIndex
            } catch (error) {
              if (!defaultLayerIndex) {
                let layer = new rhino3dm.Layer()
                layer.name = 'Default'
                doc.layers().add(layer)
                defaultLayerIndex = layers.length
              }
              attrs.layerIndex = defaultLayerIndex
            }
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
        resolve(doc)
      })
    })
  }
}

export default FilePly
