import * as THREE from 'three'
import FileObj from './FileObj'
import FileDraco from './FileDraco'
import FilePly from './FilePly'

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

export default class RViewDoc {
  rhinoDoc = null
  layers = []
  three = {
    middleground: null,
    foreground: null
  }
  threeObjectsOnLayer = {}
  cameraLight = null
  clippingPlanes = []

  constructor (rhinoDoc) {
    this.rhinoDoc = rhinoDoc
    this.three.middleground = new THREE.Scene()
    this.three.foreground = new THREE.Scene()

    let layers = rhinoDoc.layers()
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
    layers.delete()
    this.layers = createNodes(topLayers)
  }

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
      const doc = new RViewDoc(rhinoDoc)
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
