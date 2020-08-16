<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import RViewApp from './RViewApp.js'

export default {
  name: 'App',
  mounted: function () {
    RViewApp.init(window.rhino3dm, this.showLoading, this.hideLoading)
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
