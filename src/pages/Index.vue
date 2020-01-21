<template>
  <q-page id='cvs' class="flex flex-center">
    <q-card flat v-if="!viewmodel.docExists">
      <q-img alt="rview" src="statics/logo.png"/>
      <q-card-section>
        <div class="text-h6">rview WIP</div>
      </q-card-section>
    </q-card>
    <q-page-sticky position="bottom-left" :offset="[10, 10]" v-if="viewmodel.docExists">
      <q-fab v-model="expandSticky" color="primary" icon="keyboard_arrow_up" direction="up">
        <q-fab-action
          :color="panMode ? 'secondary' : 'primary'"
          icon="pan_tool"
          @click="togglePan()">
          <q-tooltip transition-show="flip-right" transition-hide="flip-left">
            Pan
          </q-tooltip>
        </q-fab-action>
        <q-fab-action color="primary" icon="zoom_out_map" @click="zoomExtents()">
          <q-tooltip transition-show="flip-right" transition-hide="flip-left">
            Zoom Extents
          </q-tooltip>
        </q-fab-action>
      </q-fab>
    </q-page-sticky>
    <q-page-sticky position="bottom-right" :offset="[10, 10]" v-if="panMode">
      <q-btn outline rounded color="primary" label="Pan Mode" icon-right="close" @click="togglePan()"/>
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
    this.camera.position.z = 40
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.screenSpacePanning = true
  },
  toPerspectiveCamera: function () {
    let vm = RhinoApp.viewModel()
    vm.perspectiveCamera = true
    this.zoomExtents(true)
  },
  toParallelCamera: function () {
    let vm = RhinoApp.viewModel()
    vm.perspectiveCamera = false
    this.zoomExtents(true)
  },
  zoomExtents: function (createNewCamera) {
    let rhino3dm = RhinoApp.getRhino3dm()
    let b = RhinoApp.visibleObjectsBoundingBox2()
    let bbox = new rhino3dm.BoundingBox(b.min.x, b.min.y, b.min.z, b.max.x, b.max.y, b.max.z)
    let viewport = new rhino3dm.ViewportInfo()
    viewport.isPerspectiveProjection = RhinoApp.viewModel().perspectiveCamera
    let size = new THREE.Vector2(0, 0)
    _pipeline.renderer.getSize(size)
    viewport.screenPort = [0, 0, size.x, size.y]
    let border = 0.0
    if (RhinoApp.viewModel().perspectiveCamera) {
      viewport.setCameraLocation([40, -40, 40])
    } else {
      border = (bbox.max[0] - bbox.min[0]) * 0.05
    }
    let width = bbox.max[0] - bbox.min[0]
    let height = width * size.y / size.x
    viewport.setFrustum(-width / 2.0, width / 2.0, -height / 2.0, height / 2.0, 0.1, 1000)
    viewport.dollyExtents(bbox, border)
    bbox.delete()

    if (createNewCamera) {
      RhinoApp.getActiveDoc().threeScene.remove(this.camera)
      let fr = viewport.getFrustum()
      if (fr.near > 0.1) {
        fr.near = 0.1
      }
      if (fr.far < 1000) {
        fr.far = 1000
      }
      viewport.setFrustum(fr.left, fr.right, fr.bottom, fr.top, fr.near, fr.far)
      if (RhinoApp.viewModel().perspectiveCamera) {
        this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1000)
      } else {
        fr = viewport.getFrustum()
        this.camera = new THREE.OrthographicCamera(fr.left, fr.right, fr.top, fr.bottom, fr.near, fr.far)
        this.camera.up.set(viewport.cameraUp[0], viewport.cameraUp[1], viewport.cameraUp[2])
      }
      this.controls.object = this.camera

      let light = new THREE.DirectionalLight(0xd9d9d9)
      light.position.set(0, 0, 1)
      this.camera.add(light)
      RhinoApp.getActiveDoc().threeScene.add(this.camera)
    }

    let location = viewport.cameraLocation
    this.camera.position.x = location[0]
    this.camera.position.y = location[1]
    this.camera.position.z = location[2]
    this.camera.updateProjectionMatrix()
    this.controls.target.set(0, 0, 0)
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
      objectsToAdd.push([threeMesh, geometry.getBoundingBox()])
    }
    if (geometry instanceof rhino3dm.Brep) {
      let faces = geometry.faces()
      for (let faceIndex = 0; faceIndex < faces.count; faceIndex++) {
        let face = faces.get(faceIndex)
        let mesh = face.getMesh(rhino3dm.MeshType.Any)
        if (mesh) {
          let threeMesh = meshToThreejs(mesh, color)
          objectsToAdd.push([threeMesh, mesh.getBoundingBox()])
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
      objectsToAdd.push([polyline, geometry.getBoundingBox()])
    }
    if (geometry instanceof rhino3dm.Point) {
      let pointMaterial = new THREE.PointsMaterial({ color: color })
      let pointGeometry = new THREE.Geometry()
      let pt = geometry.location
      pointGeometry.vertices.push(new THREE.Vector3(pt[0], pt[1], pt[2]))
      objectsToAdd.push([new THREE.Points(pointGeometry, pointMaterial), geometry.getBoundingBox()])
    }

    objectsToAdd.forEach((obj) => {
      let threeGeometry = obj[0]
      let bbox = obj[1]
      let minPoint = new THREE.Vector3(bbox.min[0], bbox.min[1], bbox.min[2])
      let maxPoint = new THREE.Vector3(bbox.max[0], bbox.max[1], bbox.max[2])
      threeGeometry.boundingBox = new THREE.Box3(minPoint, maxPoint)
      bbox.delete()
      model.threeScene.add(threeGeometry)
      model.threeObjectsOnLayer[rootLayer].push(threeGeometry)
      // let box = new THREE.BoxHelper(threeGeometry, 0x000000)
      // model.threeScene.add(box)
      // model.threeObjectsOnLayer[rootLayer].push(box)
    })

    modelObject.delete()
    geometry.delete()
    attr.delete()
  }
  objects.delete()
  RhinoApp.updateVisibility()
  _pipeline.zoomExtents(true)
  animate()
}

export default {
  data () {
    let vm = RhinoApp.viewModel()
    return {
      expandSticky: false,
      panMode: false,
      viewmodel: vm
    }
  },
  created () {
    RhinoApp.addActiveDocChangedEventWatcher(onActiveDocChanged)
    this.viewmodel.onChangeCamera = this.updateCameraProjection
  },
  methods: {
    updateCameraProjection () {
      if (this.viewmodel.perspectiveCamera) {
        _pipeline.toPerspectiveCamera()
      } else {
        _pipeline.toParallelCamera()
      }
      this.setLeftButtonMode()
    },
    zoomExtents () {
      _pipeline.zoomExtents(true)
    },
    togglePan () {
      this.panMode = !this.panMode
      this.setLeftButtonMode()
    },
    setLeftButtonMode () {
      if (this.panMode || !this.viewmodel.perspectiveCamera) {
        _pipeline.controls.mouseButtons.LEFT = THREE.MOUSE.PAN
        _pipeline.controls.touches.ONE = THREE.TOUCH.PAN
      } else {
        _pipeline.controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE
        _pipeline.controls.touches.ONE = THREE.TOUCH.ROTATE
      }
    }
  }
}
</script>
