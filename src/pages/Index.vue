<template>
  <q-page id='canvasParent' class="flex flex-center">
    <q-card flat v-if="!docExists">
      <q-img alt="rview" src="logo.png"/>
      <q-card-section class="text-h6">rview WIP</q-card-section>
    </q-card>
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
import RhinoApp from '../RhinoApp'

export default {
  data () {
    return {
      panMode: false
    }
  },
  props: {
    url: { type: String, default: '' }
  },
  computed: {
    docExists () {
      return RhinoApp.viewModel().docExists
    },
    perspectiveCamera () {
      return RhinoApp.viewModel().perspectiveCamera
    }
  },
  created () {
    RhinoApp.registerWebGlElement('canvasParent')
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
          RhinoApp.openFile(url, new Uint8Array(buffer))
        } else {
          alert(`Error retrieving resource.\n${res.status}`)
        }
      }).catch(e => alert(`Error:.\n${e}`))
    },
    zoomExtents () {
      RhinoApp.getDisplayPipeline().zoomExtents(false)
    },
    togglePan () {
      this.panMode = !this.panMode
      this.setLeftButtonMode()
    },
    setProjection (perspective) {
      if (RhinoApp.viewModel().perspectiveCamera === perspective) return
      RhinoApp.viewModel().perspectiveCamera = perspective
      RhinoApp.getDisplayPipeline().zoomExtents(true)
      this.setLeftButtonMode()
    },
    setLeftButtonMode () {
      RhinoApp.getDisplayPipeline().setPanMode(this.panMode || !RhinoApp.viewModel().perspectiveCamera)
    }
  }
}
</script>
