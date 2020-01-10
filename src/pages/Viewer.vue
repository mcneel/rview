<template>
  <!-- eslint-disable -->
  <q-page class="fit row">
    <div id='cvs' class='col q-gutter-xs' ref="myCanvas"/>
  </q-page>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import RhinoApp from '../RhinoApp.js'

let _scene = null
var camera, renderer, controls
function createScene () {
  if (_scene) {
    _scene.dispose()
  }
  _scene = new THREE.Scene()
  _scene.background = new THREE.Color(0.9, 0.9, 0.9)
}
function init () {
  THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1)
  createScene()
  camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1000)
  camera.position.z = 40
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  var canvas = document.getElementById('cvs')
  canvas.appendChild(renderer.domElement)
  controls = new OrbitControls(camera, renderer.domElement)
  window.addEventListener('resize', onWindowResize, false)
  animate()
}
var animate = function () {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(_scene, camera)
}
function onWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  animate()
}
function meshToThreejs (mesh, material) {
  let loader = new THREE.BufferGeometryLoader()
  var geometry = loader.parse(mesh.toThreejsJSON())
  return new THREE.Mesh(geometry, material)
}
function onActiveDocChanged () {
  console.log('activedoc changed')
  createScene()
  let rhino3dm = RhinoApp.getRhino3dm()
  let doc = RhinoApp.getActiveDoc()
  let material = new THREE.MeshNormalMaterial()
  material.side = THREE.DoubleSide
  let objects = doc.objects()
  for (let i = 0; i < objects.count; i++) {
    let geometry = objects.get(i).geometry()
    if (geometry instanceof rhino3dm.Mesh) {
      let threeMesh = meshToThreejs(geometry, material)
      _scene.add(threeMesh)
    }
    if (geometry instanceof rhino3dm.Brep) {
      let faces = geometry.faces()
      for (let faceIndex = 0; faceIndex < faces.count; faceIndex++) {
        let face = faces.get(faceIndex)
        let mesh = face.getMesh(rhino3dm.MeshType.Any)
        if (mesh) {
          let threeMesh = meshToThreejs(mesh, material)
          _scene.add(threeMesh)
          mesh.delete()
        }
        face.delete()
      }
      faces.delete()
    }
    if (geometry instanceof rhino3dm.Curve) {
      let points = new THREE.Geometry()
      let domain = geometry.domain
      for (let j = 0; j <= 50; j++) {
        let t = domain[0] + (j / 50.0) * (domain[1] - domain[0])
        let point = geometry.pointAt(t)
        points.vertices.push(new THREE.Vector3(point[0], point[1], point[2]))
      }
      let wireMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff })
      let polyline = new THREE.Line(points, wireMaterial)
      _scene.add(polyline)
    }
    if (geometry instanceof rhino3dm.Point) {
      let pointMaterial = new THREE.PointsMaterial({ color: 0x888888 })
      let pointGeometry = new THREE.Geometry()
      let pt = geometry.location
      pointGeometry.vertices.push(new THREE.Vector3(pt[0], pt[1], pt[2]))
      _scene.add(new THREE.Points(pointGeometry, pointMaterial))
    }
    geometry.delete()
  }
  let bbox = objects.getBoundingBox()
  objects.delete()

  let viewport = new rhino3dm.ViewportInfo()
  viewport.isPerspectiveProjection = true
  let size = new THREE.Vector2(0, 0)
  renderer.getSize(size)
  viewport.screenPort = [0, 0, size.x, size.y]
  viewport.dollyExtents(bbox, 0)
  let location = viewport.cameraLocation
  camera.position.x = location[0]
  camera.position.y = location[1]
  camera.position.z = location[2]
  viewport.delete()
}

export default {
  created () {
    RhinoApp.setActiveDocChangedEventWatcher(onActiveDocChanged)
  },
  mounted: function () {
    init()
    onActiveDocChanged()
  }
}
</script>
