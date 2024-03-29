let FileDraco = {
  readFile (name, buffer, rhino3dm) {
    let mesh = rhino3dm.DracoCompression.decompressByteArray(buffer)
    let doc = new rhino3dm.File3dm()
    let layer = new rhino3dm.Layer()
    layer.name = 'Default'
    doc.layers().add(layer)
    let attrs = new rhino3dm.ObjectAttributes()
    attrs.layersIndex = 0
    doc.objects().addMesh(mesh, attrs)
    return doc
  }
}

export default FileDraco
