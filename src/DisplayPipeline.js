import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js'
import RViewApp from './RViewApp'
import SceneUtilities from './SceneUtilities'

export default class DisplayPipeline {
  #renderer = null
  #labelRenderer = null
  #camera = null
  #controls = null
  #parentElement = null // parent DOM element on page that the WebGL control is added to
  #effectComposer = null
  #ssaoPass = null
  #frameSize = [0, 0]

  constructor (parentElement) {
    console.log('create pipeline')
    THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1)
    this.#renderer = new THREE.WebGLRenderer({ antialias: true })
    this.#renderer.setPixelRatio(window.devicePixelRatio)
    this.#renderer.setSize(parentElement.clientWidth, parentElement.clientHeight)
    this.#parentElement = parentElement
    this.#parentElement.appendChild(this.#renderer.domElement)

    this.#labelRenderer = new CSS2DRenderer()
    this.#labelRenderer.domElement.id = 'labels'
    this.#labelRenderer.setSize(parentElement.clientWidth, parentElement.clientHeight)
    this.#labelRenderer.domElement.style.position = 'absolute'
    this.#labelRenderer.domElement.style.top = 0
    this.#labelRenderer.domElement.style.pointerEvents = 'none'
    parentElement.appendChild(this.#labelRenderer.domElement)

    this.#camera = new THREE.PerspectiveCamera(30, parentElement.clientWidth / parentElement.clientHeight, 1, 1000)
    this.#camera.position.z = 40
    this.#controls = new OrbitControls(this.#camera, this.#renderer.domElement)
    this.#controls.screenSpacePanning = true
    this.#controls.addEventListener('change', () => this.updateFrustum())
  }

  drawFrameBuffer () {
    let viewportWidth = this.#parentElement.clientWidth
    let viewportHeight = this.#parentElement.clientHeight
    const windowResize = this.#frameSize[0] !== this.#parentElement.clientWidth || this.#frameSize[1] !== this.#parentElement.clientHeight
    this.#frameSize = [this.#parentElement.clientWidth, this.#parentElement.clientHeight]

    if (windowResize || this.#effectComposer) {
      this.#camera.aspect = this.#parentElement.clientWidth / this.#parentElement.clientHeight
      this.#camera.updateProjectionMatrix()
      this.#renderer.setSize(this.#parentElement.clientWidth, this.#parentElement.clientHeight)
      this.#labelRenderer.setSize(this.#parentElement.clientWidth, this.#parentElement.clientHeight)
      if (this.#effectComposer) {
        this.#effectComposer.setSize(this.#parentElement.clientWidth, this.#parentElement.clientHeight)
      }
    }
    this.#controls.update()
    SceneUtilities.viewportSize.width = viewportWidth
    SceneUtilities.viewportSize.height = viewportHeight
    let model = RViewApp.getActiveModel()
    const displayMode = RViewApp.viewModel().displayMode
    if (displayMode.clipping) {
      this.#renderer.clippingPlanes = model.clippingPlanes
    } else {
      this.#renderer.clippingPlanes = []
    }

    this.#renderer.autoClear = false
    this.#renderer.sortObjects = false
    this.#renderer.render(model.three.background, this.#camera)
    this.#renderer.sortObjects = true
    this.#labelRenderer.render(model.three.foreground, this.#camera)

    if (this.#effectComposer && this.#effectComposer.passes[0].enabled) {
      this.#effectComposer.render()
    } else {
      this.#renderer.render(model.three.middleground, this.#camera)
    }
  }

  boxCorners (box) {
    return [
      new THREE.Vector3(box.min.x, box.min.y, box.min.z), // 000
      new THREE.Vector3(box.min.x, box.min.y, box.max.z), // 001
      new THREE.Vector3(box.min.x, box.max.y, box.min.z), // 010
      new THREE.Vector3(box.min.x, box.max.y, box.max.z), // 011
      new THREE.Vector3(box.max.x, box.min.y, box.min.z), // 100
      new THREE.Vector3(box.max.x, box.min.y, box.max.z), // 101
      new THREE.Vector3(box.max.x, box.max.y, box.min.z), // 110
      new THREE.Vector3(box.max.x, box.max.y, box.max.z) // 111
    ]
  }

  enableSSAO (on) {
    if (this.#effectComposer) {
      this.#effectComposer.passes[0].enabled = on
      return
    }
    if (on) {
      this.#effectComposer = new EffectComposer(this.renderer)
      let model = RViewApp.getActiveModel()
      this.#ssaoPass = new SSAOPass(model.three.middleground, this.camera, this.#parentElement.clientWidth, this.#parentElement.clientHeight)
      this.#ssaoPass.kernelRadius = 18
      this.#ssaoPass.minDistance = 0.002
      this.#ssaoPass.maxDistance = 0.2
      this.#ssaoPass.output = SSAOPass.OUTPUT.SSAO
      this.#effectComposer.addPass(this.#ssaoPass)
    }
  }

  updateFrustum () {
    if (RViewApp.viewModel().perspectiveCamera) {
      let bbox = RViewApp.visibleObjectsBoundingBox()
      let corners = this.boxCorners(bbox)
      let vector = new THREE.Vector3(0, 0, -1)
      vector.applyQuaternion(this.#camera.quaternion)
      let pl = new THREE.Plane(vector, 0)
      pl.translate(this.#camera.position)
      let distances = corners.map(corner => { return pl.distanceToPoint(corner) })
      this.#camera.near = Math.max(0.1, Math.min(...distances))
      this.#camera.far = Math.max(...distances)
      this.#camera.updateProjectionMatrix()
    }
  }

  setBackground (scene, color1, color2 = null, environment = null) {
    if (!color2 && !environment) {
      scene.background = new THREE.Color(color1)
    }
    if (color1 && color2) {
      let parentElement = document.createElement('parentElement')
      parentElement.width = 128
      parentElement.height = 128
      let context = parentElement.getContext('2d')
      let gradient = context.createLinearGradient(0, 0, 0, parentElement.height)
      gradient.addColorStop(1, color2)
      gradient.addColorStop(0.1, color1)
      context.fillStyle = gradient
      context.fillRect(0, 0, parentElement.width, parentElement.height)
      scene.background = new THREE.CanvasTexture(parentElement)
    }
    if (environment) {
      let ctl = new THREE.CubeTextureLoader()
      ctl.setPath('cubemaps/' + environment + '/')
      let texture = ctl.load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'])
      // let matrix = new THREE.Matrix4()
      // matrix = matrix.makeRotationY(Math.PI / 2.0)
      // texture.matrix.setFromMatrix4(matrix)
      scene.background = texture
    }
  }

  setPanMode (on) {
    if (on) {
      this.#controls.mouseButtons.LEFT = THREE.MOUSE.PAN
      this.#controls.touches.ONE = THREE.TOUCH.PAN
    } else {
      this.#controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE
      this.#controls.touches.ONE = THREE.TOUCH.ROTATE
    }
  }

  zoomExtents (createNewCamera) {
    let rhino3dm = RViewApp.getRhino3dm()
    let viewport = RViewApp.viewModel().perspectiveCamera
      ? rhino3dm.ViewportInfo.defaultPerspective()
      : rhino3dm.ViewportInfo.defaultTop()
    let size = new THREE.Vector2(0, 0)
    this.#renderer.getSize(size)
    viewport.screenPort = [0, 0, size.x, size.y]

    let b = RViewApp.visibleObjectsBoundingBox()
    let bbox = new rhino3dm.BoundingBox(b.min.x, b.min.y, b.min.z, b.max.x, b.max.y, b.max.z)
    let target = bbox.center

    let bboxWidth = bbox.max[0] - bbox.min[0]
    let bboxHeight = bbox.max[1] - bbox.min[1]
    let bboxDepth = bbox.max[2] - bbox.min[2]
    bbox.inflate(bboxWidth * 0.2, bboxHeight * 0.2, bboxDepth * 0.2)
    let width = bboxWidth
    let height = width * size.y / size.x
    viewport.setFrustum(-width / 2.0, width / 2.0, -height / 2.0, height / 2.0, 0.1, 1000)
    viewport.extents(50.0 * Math.PI / 180.0, bbox)
    bbox.delete()

    if (createNewCamera) {
      RViewApp.getActiveModel().three.middleground.remove(this.#camera)
      let fr = viewport.getFrustum()
      if (RViewApp.viewModel().perspectiveCamera) {
        this.#camera = new THREE.PerspectiveCamera(30, size.x / size.y, fr.near, fr.far)
      } else {
        this.#camera = new THREE.OrthographicCamera(fr.left, fr.right, fr.top, fr.bottom, fr.near, fr.far)
        this.#camera.up.set(viewport.cameraUp[0], viewport.cameraUp[1], viewport.cameraUp[2])
      }
      this.#controls.object = this.#camera

      let light = new THREE.DirectionalLight(RViewApp.viewModel().lightColor)
      light.position.set(0, 0, 1)
      RViewApp.getActiveModel().cameraLight = light
      this.#camera.add(light)
      RViewApp.getActiveModel().three.middleground.add(this.#camera)
    }

    let location = viewport.cameraLocation
    this.#camera.position.set(location[0], location[1], location[2])
    this.#camera.updateProjectionMatrix()
    this.#controls.target.set(target[0], target[1], target[2])
    viewport.delete()
  }
}
