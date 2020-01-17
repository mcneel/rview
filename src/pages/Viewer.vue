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
  //  add a couple lights
  let light = new THREE.DirectionalLight(0xffffff)
  light.position.set(0, 0, 1)
  _scene.add(light)
  let light2 = new THREE.DirectionalLight(0x666666)
  light2.position.set(0.2, 0.2, -1)
  _scene.add(light2)
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
function meshToThreejs (mesh, diffuse) {
  let loader = new THREE.BufferGeometryLoader()
  var geometry = loader.parse(mesh.toThreejsJSON())
  if (diffuse.r === 0 && diffuse.g === 0 && diffuse.b === 0) {
    diffuse.r = 255
    diffuse.g = 255
    diffuse.b = 255
  }
  let diffusecolor = new THREE.Color(diffuse.r / 255.0, diffuse.g / 255.0, diffuse.b / 255.0)
  let material = new THREE.MeshPhongMaterial(
    {
      color: diffusecolor,
      side: THREE.DoubleSide
    })
  return new THREE.Mesh(geometry, material)
}
function onActiveDocChanged () {
  console.log('activedoc changed')
  createScene()
  let rhino3dm = RhinoApp.getRhino3dm()
  let doc = RhinoApp.getActiveDoc()

  let objects = doc.objects()
  for (let i = 0; i < objects.count; i++) {
    let modelObject = objects.get(i)
    if (modelObject == null) {
      continue
    }
    let geometry = modelObject.geometry()
    let attr = modelObject.attributes()
    let color = attr.drawColor(doc)
    if (geometry instanceof rhino3dm.Mesh) {
      let threeMesh = meshToThreejs(geometry, color)
      _scene.add(threeMesh)
    }
    if (geometry instanceof rhino3dm.Brep) {
      let faces = geometry.faces()
      for (let faceIndex = 0; faceIndex < faces.count; faceIndex++) {
        let face = faces.get(faceIndex)
        let mesh = face.getMesh(rhino3dm.MeshType.Any)
        if (mesh) {
          let threeMesh = meshToThreejs(mesh, color)
          _scene.add(threeMesh)
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
      _scene.add(polyline)
    }
    if (geometry instanceof rhino3dm.Point) {
      let pointMaterial = new THREE.PointsMaterial({ color: color })
      let pointGeometry = new THREE.Geometry()
      let pt = geometry.location
      pointGeometry.vertices.push(new THREE.Vector3(pt[0], pt[1], pt[2]))
      _scene.add(new THREE.Points(pointGeometry, pointMaterial))
    }
    modelObject.delete()
    geometry.delete()
    attr.delete()
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
    RhinoApp.addActiveDocChangedEventWatcher(onActiveDocChanged)
  },
  mounted: function () {
    init()
    onActiveDocChanged()
  }
}
</script>
