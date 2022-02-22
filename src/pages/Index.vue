<template>
  <q-page class="flex flex-center" id='canvasParent'>
    <q-card flat v-if="!docExists">
      <q-img alt="rview" src="logo.png"/>
      <q-card-section class="text-h6">rview WIP</q-card-section>
    </q-card>
    <div
      v-if="showCompareSlider"
      style="position: absolute; top: 0; left: 0; width: 100%;">
      <q-slider :min="0" :max="100" v-model="viewmodel.comparePosition" class="z-fab"/>
    </div>
    <q-page-sticky position="bottom-left" :offset="[10, 10]" v-if="docExists">
      <q-fab color="primary" icon="keyboard_arrow_up" direction="up">
        <q-fab-action
          :color="panMode ? 'secondary' : 'primary'"
          icon="pan_tool"
          @click="togglePan()">
          <q-tooltip transition-show="flip-right" transition-hide="flip-left">Pan</q-tooltip>
        </q-fab-action>
        <q-fab-action
          color="primary"
          icon="zoom_out_map"
          @click="zoomExtents()">
          <q-tooltip transition-show="flip-right" transition-hide="flip-left">Zoom Extents</q-tooltip>
        </q-fab-action>
        <q-fab-action
          color="primary"
          :icon="perspectiveCamera ? 'img:icons/2D.svg' : 'img:icons/3D.svg'"
          @click="setProjection(!perspectiveCamera)">
        </q-fab-action>
      </q-fab>
    </q-page-sticky>
    <q-page-sticky position="bottom-right" :offset="[10, 10]" v-if="panMode">
      <q-btn outline rounded color="primary" label="Pan Mode" icon-right="close" @click="togglePan()"/>
    </q-page-sticky>
  </q-page>
</template>

<script>
import RViewApp from '../RViewApp'

export default {
  data () {
    return {
      panMode: false,
      viewmodel: RViewApp._viewmodel
    }
  },
  props: {
    url: { type: String, default: '' }
  },
  computed: {
    docExists () {
      return this.viewmodel.model1.exists
    },
    perspectiveCamera () {
      return this.viewmodel.perspectiveCamera
    },
    showCompareSlider () {
      return this.viewmodel.model1.exists && this.viewmodel.model2.exists
    }
  },
  created () {
    RViewApp.registerWebGlElement('canvasParent')
  },
  mounted () {
    if (this.$route.query && this.$route.query['url']) {
      this.openURL(this.$route.query['url'])
    }
  },
  watch: {
    $route (to, from) {
      if (to.query['url']) {
        this.openURL(to.query['url'])
      }
    }
  },
  methods: {
    openURL (url) {
      fetch(url).then(async res => {
        if (res.status === 200) {
          const buffer = await res.arrayBuffer()
          RViewApp.openFile(url, new Uint8Array(buffer), true)
        } else {
          alert(`Error retrieving resource.\n${res.status}`)
        }
      }).catch(e => alert(`Error:.\n${e}`))
    },
    zoomExtents () {
      RViewApp.getDisplayPipeline().zoomExtents(false)
    },
    togglePan () {
      this.panMode = !this.panMode
      this.setLeftButtonMode()
    },
    setProjection (perspective) {
      if (RViewApp.viewModel().perspectiveCamera === perspective) return
      RViewApp.viewModel().perspectiveCamera = perspective
      RViewApp.getDisplayPipeline().zoomExtents(true)
      this.setLeftButtonMode()
    },
    setLeftButtonMode () {
      RViewApp.getDisplayPipeline().setPanMode(this.panMode || !RViewApp.viewModel().perspectiveCamera)
    }
  }
}
</script>
