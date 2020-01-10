<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import RhinoApp from './RhinoApp.js'

export default {
  name: 'App',
  mounted: function () {
    RhinoApp.init(window.rhino3dm, this.showLoading, this.hideLoading)
  },
  methods: {
    showLoading () {
      this.$q.loading.show()
    },
    hideLoading () {
      this.$q.loading.hide()
    }
  }
}
</script>
