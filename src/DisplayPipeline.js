import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import RViewApp from './RViewApp'
import DisplayMode from './DisplayMode'
import SceneUtilities from './SceneUtilities'

export default class DisplayPipeline {
  #renderer = null
  #labelRenderer = null
  #camera = null
  #controls = null
  #parentElement = null // parent DOM element on page that the WebGL control is added to
  #frameSize = [0, 0]
  #backgroundScene = new THREE.Scene()
  #middlegroundTexture = [null, null]
  #screenQuad = null
  #screenQuadScene = new THREE.Scene()
  #previousDrawCamera = null // save the camera state every frame for caching purposes

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

    this.#screenQuad = SceneUtilities.createScreenQuad()
    this.#screenQuadScene.add(this.#screenQuad)
  }

  drawFrameBuffer (showGrid, displayMode, baseDocument, compareDocument, compareMode, comparePosition) {
    if (compareDocument == null) comparePosition = 100
    let viewportWidth = this.#parentElement.clientWidth
    let viewportHeight = this.#parentElement.clientHeight
    const windowResize = this.#frameSize[0] !== this.#parentElement.clientWidth || this.#frameSize[1] !== this.#parentElement.clientHeight
    this.#frameSize = [this.#parentElement.clientWidth, this.#parentElement.clientHeight]

    if (windowResize) {
      this.#camera.aspect = this.#parentElement.clientWidth / this.#parentElement.clientHeight
      this.#camera.updateProjectionMatrix()
      this.#renderer.setSize(this.#parentElement.clientWidth, this.#parentElement.clientHeight)
      this.#labelRenderer.setSize(this.#parentElement.clientWidth, this.#parentElement.clientHeight)
    }
    this.#controls.update()
    SceneUtilities.viewportSize.width = viewportWidth
    SceneUtilities.viewportSize.height = viewportHeight
    if (displayMode.clipping) {
      this.#renderer.clippingPlanes = baseDocument.clippingPlanes
    } else {
      this.#renderer.clippingPlanes = []
    }

    // Drawing is performed in several stages.
    // - draw background/grid with no depth tesiting/writing
    // - draw middleground to texture
    // - draw the middleground texture to the main view
    // My goal is to eventually have two models loaded and drawn
    // to two different middleground textures. Once that is
    // done, we can draw the two textures in different ways to
    // the screen for different types of comparison.
    this.#renderer.autoClear = false
    this.#renderer.sortObjects = false
    // background draw will still clear the depth/color buffer
    // since the background scene defines a background fill color
    this.drawBackground(showGrid, displayMode)
    this.drawMiddlegroundToTexture(0, baseDocument.three.middleground)
    this.#screenQuad.material.uniforms.imageLeft.value = this.#middlegroundTexture[0].texture
    const x = comparePosition / 100.0
    this.#screenQuad.material.uniforms.horizontalPosition.value = x
    this.#screenQuad.material.uniforms.compareMode.value = compareMode

    if (compareDocument != null) {
      if (compareDocument.syncCamera == null) {
        compareDocument.syncCamera = this.#camera.clone()
        compareDocument.three.middleground.add(compareDocument.syncCamera)
      }
      compareDocument.syncCamera.copy(this.#camera, false)
      this.drawMiddlegroundToTexture(1, compareDocument.three.middleground)
      this.#screenQuad.material.uniforms.imageRight.value = this.#middlegroundTexture[1].texture
    } else {
      this.#screenQuad.material.uniforms.imageRight.value = this.#middlegroundTexture[0].texture
    }

    this.#renderer.render(this.#screenQuadScene, this.#camera)

    // Below is the old fashioned way to draw directly to the element's
    // framebuffer.
    /*
    this.#renderer.render(model.three.middleground, this.#camera)

    this.#renderer.sortObjects = true
    this.#labelRenderer.render(model.three.foreground, this.#camera)
    */
  }

  drawBackground (showGrid, displayMode) {
    // Draw background color and grid based on passed in display mode
    if (displayMode.backgroundStyle === DisplayMode.backgroundModes[0]) {
      // single color
      this.#backgroundScene.background = new THREE.Color(displayMode.backgroundColor)
    } else if (displayMode.backgroundStyle === DisplayMode.backgroundModes[1]) {
      const parentElement = document.createElement('canvas')
      parentElement.width = 128
      parentElement.height = 128
      let context = parentElement.getContext('2d')
      let gradient = context.createLinearGradient(0, 0, 0, parentElement.height)
      gradient.addColorStop(1, displayMode.backgroundGradientTop)
      gradient.addColorStop(0.1, displayMode.backgroundGradientBottom)
      context.fillStyle = gradient
      context.fillRect(0, 0, parentElement.width, parentElement.height)
      this.#backgroundScene.background = new THREE.CanvasTexture(parentElement)
    }

    if (this.#backgroundScene.grid == null) {
      this.#backgroundScene.grid = SceneUtilities.createGrid()
      this.#backgroundScene.add(this.#backgroundScene.grid)
    }
    this.#backgroundScene.grid.visible = showGrid

    this.#renderer.render(this.#backgroundScene, this.#camera)
  }

  drawMiddlegroundToTexture (index, scene) {
    if (this.#middlegroundTexture[index] == null) {
      this.#middlegroundTexture[index] = new THREE.WebGLRenderTarget(this.#frameSize[0], this.#frameSize[1])
    }
    // supersample to get around AA issues
    if (this.#middlegroundTexture[index].width !== this.#frameSize[0] || this.#middlegroundTexture[index].height !== this.#frameSize[1]) {
      this.#middlegroundTexture[index].setSize(this.#frameSize[0] * 2.0, this.#frameSize[1] * 2.0)
    }
    this.#renderer.setRenderTarget(this.#middlegroundTexture[index])
    this.#renderer.setClearColor(new THREE.Color(0, 0, 0), 0)
    this.#renderer.clear(true, true)

    this.#renderer.render(scene, this.#camera)
    this.#renderer.setRenderTarget(null)
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
