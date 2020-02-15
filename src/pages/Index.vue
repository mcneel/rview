<template>
  <q-page id='canvasParent' class="flex flex-center">
    <q-card flat v-if="!viewmodel.docExists">
      <q-img alt="rview" src="statics/logo.png"/>
      <q-card-section>
        <div class="text-h6">rview WIP</div>
      </q-card-section>
    </q-card>
    <q-page-sticky position="bottom-left" :offset="[10, 10]" v-if="viewmodel.docExists">
      <q-fab color="primary" icon="keyboard_arrow_up" direction="up">
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
        <q-fab-action v-if="viewmodel.perspectiveCamera"
          color="primary"
          icon="img:statics/icons/3D.svg"
          @click="setProjection(false)">
        </q-fab-action>
        <q-fab-action v-if="!viewmodel.perspectiveCamera"
          color="primary"
          icon="img:statics/icons/2D.svg"
          @click="setProjection(true)">
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
import SceneUtilities from '../SceneUtilities.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js'

let _pipeline = {
  renderer: null,
  camera: null,
  controls: null,
  effectComposer: null,
  ssaoPass: null,
  initialize: function () {
    if (this.renderer != null) {
      return
    }
    THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1)
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    let canvas = document.getElementById('canvasParent')
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    // canvas.insertBefore(canvas.children[0], _pipeline.renderer.domElement)
    canvas.appendChild(this.renderer.domElement)
    window.addEventListener('resize', () => animate(true), false)

    this.camera = new THREE.PerspectiveCamera(30, canvas.clientWidth / canvas.clientHeight, 1, 1000)
    this.camera.position.z = 40
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.screenSpacePanning = true
  },
  zoomExtents: function (createNewCamera) {
    let rhino3dm = RhinoApp.getRhino3dm()
    let viewport = RhinoApp.viewModel().perspectiveCamera
      ? rhino3dm.ViewportInfo.defaultPerspective()
      : rhino3dm.ViewportInfo.defaultTop()
    let size = new THREE.Vector2(0, 0)
    _pipeline.renderer.getSize(size)
    viewport.screenPort = [0, 0, size.x, size.y]

    let b = RhinoApp.visibleObjectsBoundingBox()
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
      RhinoApp.getActiveModel().three.middleground.remove(this.camera)
      let fr = viewport.getFrustum()
      if (RhinoApp.viewModel().perspectiveCamera) {
        this.camera = new THREE.PerspectiveCamera(30, size.x / size.y, 1, 1000)
      } else {
        this.camera = new THREE.OrthographicCamera(fr.left, fr.right, fr.top, fr.bottom, fr.near, fr.far)
        this.camera.up.set(viewport.cameraUp[0], viewport.cameraUp[1], viewport.cameraUp[2])
      }
      this.controls.object = this.camera

      let light = new THREE.DirectionalLight(RhinoApp.viewModel().lightColor)
      light.position.set(0, 0, 1)
      RhinoApp.getActiveModel().cameraLight = light
      this.camera.add(light)
      RhinoApp.getActiveModel().three.middleground.add(this.camera)
    }

    let location = viewport.cameraLocation
    this.camera.position.set(location[0], location[1], location[2])
    this.camera.updateProjectionMatrix()
    this.controls.target.set(target[0], target[1], target[2])
    viewport.delete()
  },
  enableSSAO (on) {
    if (this.effectComposer) {
      this.effectComposer.passes[0].enabled = on
      return
    }
    if (on) {
      this.effectComposer = new EffectComposer(this.renderer)
      let model = RhinoApp.getActiveModel()
      let canvas = document.getElementById('canvasParent')
      this.ssaoPass = new SSAOPass(model.three.middleground, this.camera, canvas.clientWidth, canvas.clientHeight)
      this.ssaoPass.kernelRadius = 18
      this.ssaoPass.minDistance = 0.002
      this.ssaoPass.maxDistance = 0.2
      this.ssaoPass.output = SSAOPass.OUTPUT.SSAO
      this.effectComposer.addPass(this.ssaoPass)
    }
  }
}

let animate = function (windowResize = false) {
  if (windowResize || _pipeline.effectComposer) {
    let canvas = document.getElementById('canvasParent')
    _pipeline.camera.aspect = canvas.clientWidth / canvas.clientHeight
    _pipeline.camera.updateProjectionMatrix()
    _pipeline.renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    if (_pipeline.effectComposer) {
      _pipeline.effectComposer.setSize(canvas.clientWidth, canvas.clientHeight)
    }
  }
  requestAnimationFrame(animate)
  _pipeline.controls.update()
  let model = RhinoApp.getActiveModel()
  _pipeline.renderer.autoClear = false
  _pipeline.renderer.sortObjects = false
  _pipeline.renderer.render(model.three.background, _pipeline.camera)
  _pipeline.renderer.sortObjects = true

  if (_pipeline.effectComposer && _pipeline.effectComposer.passes[0].enabled) {
    _pipeline.effectComposer.render()
  } else {
    _pipeline.renderer.render(model.three.middleground, _pipeline.camera)
  }
}

function setBackground (scene, color1, color2 = null, environment = null) {
  if (!color2 && !environment) {
    scene.background = new THREE.Color(color1)
  }
  if (color1 && color2) {
    let canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    let context = canvas.getContext('2d')
    let gradient = context.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(1, color2)
    gradient.addColorStop(0.1, color1)
    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)
    scene.background = new THREE.CanvasTexture(canvas)
  }
  if (environment) {
    let ctl = new THREE.CubeTextureLoader()
    ctl.setPath('statics/cubemaps/' + environment + '/')
    let texture = ctl.load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'])
    // let matrix = new THREE.Matrix4()
    // matrix = matrix.makeRotationY(Math.PI / 2.0)
    // texture.matrix.setFromMatrix4(matrix)
    scene.background = texture
    animate(true)
  }
}

function createScene () {
  _pipeline.initialize()
  RhinoApp.disposeMiddleground()
  let model = RhinoApp.getActiveModel()
  model.three.middleground = new THREE.Scene()

  if (model.three.background == null) {
    model.three.background = new THREE.Scene()
    model.three.background.background = new THREE.Color(0.75, 0.75, 0.75)
    let grid = SceneUtilities.createGrid()
    model.threeGrid = grid
    model.three.background.add(grid)
  }

  model.three.setBackground = setBackground
}

function onActiveDocChanged () {
  console.log('Building Scene')
  createScene()
  let model = RhinoApp.getActiveModel()
  let doc = model.rhinoDoc

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
    let rootLayer = layer.fullPath.split('::')[0]
    if (!model.threeObjectsOnLayer[rootLayer]) {
      model.threeObjectsOnLayer[rootLayer] = []
    }
    let color = attr.drawColor(doc)
    let objectsToAdd = SceneUtilities.createThreeGeometry(geometry, color, doc)

    objectsToAdd.forEach((obj) => {
      let threeGeometry = obj[0]
      let bbox = obj[1]
      if (bbox) {
        let minPoint = new THREE.Vector3(bbox.min[0], bbox.min[1], bbox.min[2])
        let maxPoint = new THREE.Vector3(bbox.max[0], bbox.max[1], bbox.max[2])
        threeGeometry.boundingBox = new THREE.Box3(minPoint, maxPoint)
        bbox.delete()
      }
      model.three.middleground.add(threeGeometry)
      model.threeObjectsOnLayer[rootLayer].push(threeGeometry)
      // let box = new THREE.BoxHelper(threeGeometry, 0x000000)
      // model.three.middleground.add(box)
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

function onDisplayModeChanged () {
  let useSSAO = RhinoApp.viewModel().displayMode.name === 'Arctic'
  _pipeline.enableSSAO(useSSAO)
}

export default {
  data () {
    let vm = RhinoApp.viewModel()
    return {
      panMode: false,
      viewmodel: vm
    }
  },
  props: {
    url: {
      type: String,
      default: ''
    }
  },
  created () {
    RhinoApp.addActiveDocChangedEventWatcher(onActiveDocChanged)
    RhinoApp.addDisplayModeChangedEventWatcher(onDisplayModeChanged)
    this.viewmodel.onChangeCamera = this.updateCameraProjection
  },
  mounted () {
    if (this.$route.query && this.$route.query['url']) {
      console.log('MOUNTED with ' + this.$route.query['url'])
      this.openURL(this.$route.query['url'])
    }
    console.log('MOUNTED')
  },
  watch: {
    $route (to, from) {
      if (to.query['url']) {
        this.openURL(to.query['url'])
      }
      console.log(to.query)
    }
  },
  methods: {
    openURL (url) {
      fetch(url).then(async res => {
        let buffer = await res.arrayBuffer()
        let arr = new Uint8Array(buffer)
        RhinoApp.openFile(url, arr)
      })
    },
    updateCameraProjection () {
      _pipeline.zoomExtents(true)
      this.setLeftButtonMode()
    },
    zoomExtents () {
      _pipeline.zoomExtents(true)
    },
    togglePan () {
      this.panMode = !this.panMode
      this.setLeftButtonMode()
    },
    setProjection (perspective) {
      if (this.viewmodel.perspectiveCamera === perspective) {
        return
      }
      this.viewmodel.perspectiveCamera = perspective
      this.updateCameraProjection()
      this.zoomExtents()
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
