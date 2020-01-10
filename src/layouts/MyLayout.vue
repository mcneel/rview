<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          to="/"
          @click="leftDrawerOpen = false"
          icon="folder"
        />
        <q-btn
          flat
          dense
          round
          to="viewer"
          @click="leftDrawerOpen = !leftDrawerOpen"
          icon="layers"
          :disable="!viewmodel.docExists"
        />

        <q-toolbar-title>
          {{viewmodel.filename}}
        </q-toolbar-title>

        <div>rview WIP</div>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          icon="keyboard_arrow_up"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      overlay
      content-class="bg-grey-2"
    >
      <q-tree
        :nodes="viewmodel.layers"
        :expanded.sync="viewmodel.expanded"
        node-key="label"
      >
      </q-tree>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import RhinoApp from '../RhinoApp'

export default {
  data () {
    let vm = RhinoApp.viewModel()
    return {
      leftDrawerOpen: false,
      viewmodel: vm
    }
  }
}
</script>
