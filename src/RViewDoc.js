import * as THREE from 'three'
import FileObj from './FileObj'
import FileDraco from './FileDraco'
import FilePly from './FilePly'
import SceneUtilities from './SceneUtilities'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

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
  syncCamera = null
  clippingPlanes = []
  #threeObjectsByRootLayer = null
  name = ''

  constructor (rhinoDoc, name) {
    this.rhinoDoc = rhinoDoc
    this.name = name
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
    this.buildSceneHelper()
  }

  buildSceneHelper () {
    const doc = this.rhinoDoc
    let objects = doc.objects()
    for (let i = 0; i < objects.count; i++) {
      let modelObject = objects.get(i)
      if (modelObject == null) {
        continue
      }
      let geometry = modelObject.geometry()
      let attr = modelObject.attributes()
      if (attr.isInstanceDefinitionObject) {
        continue
      }
      let layer = doc.layers().get(attr.layerIndex)
      let objectsToAdd = SceneUtilities.createThreeGeometry(geometry, attr, doc)

      objectsToAdd.forEach((obj) => {
        let threeGeometry = obj[0]
        let bbox = obj[1]
        threeGeometry.fullLayerPath = layer.fullPath
        if (bbox) {
          let minPoint = new THREE.Vector3(bbox.min[0], bbox.min[1], bbox.min[2])
          let maxPoint = new THREE.Vector3(bbox.max[0], bbox.max[1], bbox.max[2])
          threeGeometry.boundingBox = new THREE.Box3(minPoint, maxPoint)
          bbox.delete()
        }
        switch (threeGeometry.constructor) {
          case CSS2DObject: // handling CSS2D lables type
            this.three.foreground.add(threeGeometry)
            break
          case THREE.Plane: // handling clipping planes
            this.clippingPlanes.push(threeGeometry)
            break
          default:
            this.three.middleground.add(threeGeometry)
            break
        }
      })
      modelObject.delete()
      geometry.delete()
      attr.delete()
    }
    objects.delete()
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
      const doc = new RViewDoc(rhinoDoc, name)
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

  getSceneObjectDictionary () {
    if (this.#threeObjectsByRootLayer == null) {
      let dict = {}
      this.three.foreground.children.forEach((item) => {
        let rootLayer = item.fullLayerPath.split('::')[0]
        if (!dict[rootLayer]) {
          dict[rootLayer] = []
        }
        dict[rootLayer].push(item)
      })
      this.three.middleground.children.forEach((item) => {
        let rootLayer = item.fullLayerPath.split('::')[0]
        if (!dict[rootLayer]) {
          dict[rootLayer] = []
        }
        dict[rootLayer].push(item)
      })
      this.#threeObjectsByRootLayer = dict
    }
    return this.#threeObjectsByRootLayer
  }

  getSceneObjectsOnLayer (rootLayerName) {
    const dict = this.getSceneObjectDictionary()
    return dict[rootLayerName]
  }
}
