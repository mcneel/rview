import FileObj from './FileObj'
import FileDraco from './FileDraco'
import FilePly from './FilePly'

export default class RViewDoc {
  rhinoDoc = null
  three = {
    background: null,
    middleground: null,
    foreground: null
  }
  threeObjectsOnLayer = {}
  threeGrid = null
  cameraLight = null

  static create (name, contents, rhino3dm) {
    let rhinoDoc = null
    if (name.endsWith('.obj')) {
      rhinoDoc = FileObj.readFile(name, contents, rhino3dm)
    } else if (name.endsWith('.drc')) {
      rhinoDoc = FileDraco.readFile(name, contents, rhino3dm)
    } else if (name.endsWith('.ply')) {
      rhinoDoc = FilePly.readFile(name, contents, rhino3dm)
    } else {
      rhinoDoc = rhino3dm.File3dm.fromByteArray(contents)
    }

    if (rhinoDoc != null) {
      const doc = new RViewDoc()
      doc.rhinoDoc = rhinoDoc
      return doc
    }
    return null
  }

  dispose () {
    if (this.rhinoDoc != null) this.rhinoDoc.delete()
    this.rhinoDoc = null

    if (this.three.middleground) {
      this.three.middleground.dispose()
      this.three.middleground = null
    }
    if (this.three.foreground) {
      this.three.foreground.dispose()
      this.three.foreground = null
    }
  }
}
