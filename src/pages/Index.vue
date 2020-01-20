<template>
  <q-page id='cvs' class="flex flex-center">
    <q-card flat v-if="!docExists">
      <q-img alt="rview" src="statics/logo.png"/>
      <q-card-section>
        <div class="text-h6">rview WIP</div>
      </q-card-section>
    </q-card>
    <q-page-sticky position="bottom-left" :offset="[18, 18]" v-if="docExists">
      <q-fab color="primary" icon="keyboard_arrow_up" direction="up">
        <q-fab-action color="primary" icon="pan_tool" :disable="true">
          <q-tooltip transition-show="flip-right" transition-hide="flip-left">
            (TODO) implement pan
          </q-tooltip>
        </q-fab-action>
        <q-fab-action color="primary" icon="zoom_out_map" @click="zoomExtents()">
          <q-tooltip transition-show="flip-right" transition-hide="flip-left">
            Zoom Extents
          </q-tooltip>
        </q-fab-action>
      </q-fab>
    </q-page-sticky>
  </q-page>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import RhinoApp from '../RhinoApp.js'

let _pipeline = {
  renderer: null,
  camera: null,
  controls: null,
  initialize: function () {
    if (this.renderer != null) {
      return
    }
    THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1)
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    let canvas = document.getElementById('cvs')
    // canvas.insertBefore(canvas.children[0], _pipeline.renderer.domElement)
    canvas.appendChild(this.renderer.domElement)
    window.addEventListener('resize', () => animate(true), false)

    this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1000)
    // this.camera = new THREE.OrthographicCamera(-20, 20, -20, 20)
    this.camera.position.z = 40
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    // this.controls.mouseButtons.LEFT = THREE.MOUSE.PAN
  },
  setToPerspectiveCamera: function () {
    let vm = RhinoApp.viewModel()
    if (vm.perspectiveCamera) {
      return
    }
    vm.perspectiveCamera = true
  },
  setToParallelCamera: function () {
    let vm = RhinoApp.viewModel()
    if (!vm.perspectiveCamera) {
      return
    }
    vm.perspectiveCamera = false
  },
  zoomExtents: function () {
    let rhino3dm = RhinoApp.getRhino3dm()
    let bbox = RhinoApp.visibleObjectsBoundingBox()
    let viewport = new rhino3dm.ViewportInfo()
    viewport.isPerspectiveProjection = RhinoApp.viewModel().perspectiveCamera
    let size = new THREE.Vector2(0, 0)
    _pipeline.renderer.getSize(size)
    viewport.screenPort = [0, 0, size.x, size.y]
    viewport.dollyExtents(bbox, 0)
    bbox.delete()
    let location = viewport.cameraLocation
    _pipeline.camera.position.x = location[0]
    _pipeline.camera.position.y = location[1]
    _pipeline.camera.position.z = location[2]
    viewport.delete()
  }
}

let animate = function (windowResize = false) {
  if (windowResize) {
    _pipeline.camera.aspect = window.innerWidth / window.innerHeight
    _pipeline.camera.updateProjectionMatrix()
    _pipeline.renderer.setSize(window.innerWidth, window.innerHeight)
  }
  requestAnimationFrame(animate)
  _pipeline.controls.update()
  let model = RhinoApp.getActiveDoc()
  _pipeline.renderer.render(model.threeScene, _pipeline.camera)
}

function createScene () {
  _pipeline.initialize()
  let model = RhinoApp.getActiveDoc()
  if (model.threeScene) {
    model.threeScene.dispose()
  }
  model.threeScene = new THREE.Scene()
  model.threeScene.background = new THREE.Color(0.9, 0.9, 0.9)
  //  add a couple lights
  let light = new THREE.DirectionalLight(0xffffff)
  light.position.set(0, 0, 1)
  model.threeScene.add(light)
  let light2 = new THREE.DirectionalLight(0x666666)
  light2.position.set(0.2, 0.2, -1)
  model.threeScene.add(light2)
}

function meshToThreejs (mesh, diffuse) {
  let loader = new THREE.BufferGeometryLoader()
  var geometry = loader.parse(mesh.toThreejsJSON())
  if (diffuse.r === 0 && diffuse.g === 0 && diffuse.b === 0) {
    diffuse.r = 255
    diffuse.g = 255
    diffuse.b = 255
  }
  let diffusecolor = new THREE.Color(diffuse.r / 255.0, diffuse.g / 255.0, diffuse.b / 255.0)
  let material = new THREE.MeshPhongMaterial({
    color: diffusecolor,
    side: THREE.DoubleSide
  })
  return new THREE.Mesh(geometry, material)
}
function onActiveDocChanged () {
  console.log('Building Scene')
  createScene()
  let rhino3dm = RhinoApp.getRhino3dm()
  let model = RhinoApp.getActiveDoc()
  let doc = model.rhinoDoc

  let objects = doc.objects()
  for (let i = 0; i < objects.count; i++) {
    let modelObject = objects.get(i)
    if (modelObject == null) {
      continue
    }
    let geometry = modelObject.geometry()
    let attr = modelObject.attributes()
    let layer = doc.layers().get(attr.layerIndex)
    let rootLayer = layer.fullPath.split('::')[0]
    if (!model.threeObjectsOnLayer[rootLayer]) {
      model.threeObjectsOnLayer[rootLayer] = []
    }
    let color = attr.drawColor(doc)
    let objectsToAdd = []
    if (geometry instanceof rhino3dm.Mesh) {
      let threeMesh = meshToThreejs(geometry, color)
      objectsToAdd.push(threeMesh)
    }
    if (geometry instanceof rhino3dm.Brep) {
      let faces = geometry.faces()
      for (let faceIndex = 0; faceIndex < faces.count; faceIndex++) {
        let face = faces.get(faceIndex)
        let mesh = face.getMesh(rhino3dm.MeshType.Any)
        if (mesh) {
          let threeMesh = meshToThreejs(mesh, color)
          objectsToAdd.push(threeMesh)
          mesh.delete()
        }
        face.delete()
      }
      faces.delete()
    }
    if (geometry instanceof rhino3dm.Curve) {
      let pointCount = 21
      if (geometry instanceof rhino3dm.LineCurve) {
        pointCount = 2
      } else if (geometry instanceof rhino3dm.PolylineCurve) {
        pointCount = geometry.pointCount
      }
      let points = new THREE.BufferGeometry()
      let verts = new Float32Array(pointCount * 3)
      let domain = geometry.domain
      let divisions = pointCount - 1.0
      for (let j = 0; j < pointCount; j++) {
        let t = domain[0] + (j / divisions) * (domain[1] - domain[0])
        let point = geometry.pointAt(t)
        verts[j * 3] = point[0]
        verts[j * 3 + 1] = point[1]
        verts[j * 3 + 2] = point[2]
      }
      points.setAttribute('position', new THREE.BufferAttribute(verts, 3))
      let threecolor = new THREE.Color(color.r / 255.0, color.g / 255.0, color.b / 255.0)
      let wireMaterial = new THREE.LineBasicMaterial({ color: threecolor })
      let polyline = new THREE.Line(points, wireMaterial)
      objectsToAdd.push(polyline)
    }
    if (geometry instanceof rhino3dm.Point) {
      let pointMaterial = new THREE.PointsMaterial({ color: color })
      let pointGeometry = new THREE.Geometry()
      let pt = geometry.location
      pointGeometry.vertices.push(new THREE.Vector3(pt[0], pt[1], pt[2]))
      objectsToAdd.push(new THREE.Points(pointGeometry, pointMaterial))
    }

    objectsToAdd.forEach((obj) => {
      model.threeScene.add(obj)
      model.threeObjectsOnLayer[rootLayer].push(obj)
    })

    modelObject.delete()
    geometry.delete()
    attr.delete()
  }
  objects.delete()
  RhinoApp.updateVisibility()
  _pipeline.zoomExtents()
  animate()
}

export default {
  data () {
    return RhinoApp.viewModel()
  },
  created () {
    RhinoApp.addActiveDocChangedEventWatcher(onActiveDocChanged)
    this.onChangeCamera = this.updateCameraProjection
  },
  methods: {
    updateCameraProjection () {
      if (this.perspectiveCamera) {
        _pipeline.SetToPerspectiveCamera()
      } else {
        _pipeline.SetToParallelCamera()
      }
    },
    zoomExtents () {
      _pipeline.zoomExtents()
    }
  }
}
</script>
