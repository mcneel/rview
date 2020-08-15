<template>
  <q-page id='canvasParent' class="flex flex-center">
    <q-card flat v-if="!viewmodel.docExists">
      <q-img alt="rview" src="logo.png"/>
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
          icon="img:icons/2D.svg"
          @click="setProjection(false)">
        </q-fab-action>
        <q-fab-action v-if="!viewmodel.perspectiveCamera"
          color="primary"
          icon="img:icons/3D.svg"
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
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import RhinoApp from '../RhinoApp.js'
import SceneUtilities from '../SceneUtilities.js'
import DisplayPipeline from '../DisplayPipeline'

let _dp = null

function createScene () {
  if (_dp != null) return
  _dp = new DisplayPipeline(window, document.getElementById('canvasParent'))

  RhinoApp.disposeMiddleground()
  RhinoApp.disposeForeground()
  let labelDiv = document.getElementById('labels')
  labelDiv.innerHTML = ''
  let model = RhinoApp.getActiveModel()
  model.three.middleground = new THREE.Scene()
  model.three.foreground = new THREE.Scene()

  model.clippingPlanes = []
  _dp.setClippingPlanes(model.clippingPlanes)

  if (model.three.background == null) {
    model.three.background = new THREE.Scene()
    model.three.background.background = new THREE.Color(0.75, 0.75, 0.75)
    let grid = SceneUtilities.createGrid()
    model.threeGrid = grid
    model.three.background.add(grid)
  }

  model.three.setBackground = _dp.setBackground
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
    let objectsToAdd = SceneUtilities.createThreeGeometry(geometry, attr, doc)

    objectsToAdd.forEach((obj) => {
      let threeGeometry = obj[0]
      let bbox = obj[1]
      if (bbox) {
        let minPoint = new THREE.Vector3(bbox.min[0], bbox.min[1], bbox.min[2])
        let maxPoint = new THREE.Vector3(bbox.max[0], bbox.max[1], bbox.max[2])
        threeGeometry.boundingBox = new THREE.Box3(minPoint, maxPoint)
        bbox.delete()
      }
      switch (threeGeometry.constructor) {
        case CSS2DObject: // handling CSS2D lables type
          model.three.foreground.add(threeGeometry)
          model.threeObjectsOnLayer[rootLayer].push(threeGeometry)
          break
        case THREE.Plane: // handling clipping planes
          model.clippingPlanes.push(threeGeometry)
          break
        default:
          model.three.middleground.add(threeGeometry)
          model.threeObjectsOnLayer[rootLayer].push(threeGeometry)
          break
      }
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
  // _pipeline.zoomExtents(true)
  _dp.zoomExtents(true)
  _dp.animate()
}

function onClippingChanged (isClipping) {
  if (isClipping) {
    let model = RhinoApp.getActiveModel()
    _dp.setClippingPlanes(model.clippingPlanes)
  } else {
    _dp.setClippingPlanes([])
  }
}

function onDisplayModeChanged () {
  let useSSAO = RhinoApp.viewModel().displayMode.name === 'Arctic'
  _dp.enableSSAO(useSSAO)
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
    RhinoApp.addClippingChangedEventWatcher(onClippingChanged)
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
        if (res.status === 200) {
          let buffer = await res.arrayBuffer()
          let arr = new Uint8Array(buffer)
          RhinoApp.openFile(url, arr)
        } else {
          alert(`Error retrieving resource.\n${res.status}`)
        }
      }).catch(e => alert(`Error:.\n${e}`))
    },
    updateCameraProjection () {
      _dp.zoomExtents(true)
      this.setLeftButtonMode()
    },
    zoomExtents () {
      _dp.zoomExtents(true)
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
        _dp.setPanMode(true)
      } else {
        _dp.setPanMode(false)
      }
    }
  }
}
</script>
