<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn v-if="fileDrawerVisible"
          dense
          @click="clickFolder()"
          color="secondary"
          icon="folder"
        />
        <q-btn v-if="!fileDrawerVisible"
          dense
          flat
          @click="clickFolder()"
          icon="folder"
        />

        <q-btn v-if="layerDrawerVisible"
          dense
          to="viewer"
          @click="clickLayers()"
          color="secondary"
          icon="layers"
        />
        <q-btn v-if="!layerDrawerVisible"
          dense
          flat
          to="viewer"
          @click="clickLayers()"
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
      v-model="layerDrawerVisible"
      bordered
      overlay
      content-class="bg-grey-2"
    >
      <q-list>
        <q-expansion-item
          v-for="layer in viewmodel.layers"
          :key="layer.label"
          clickable
          :expand-icon="layer.children ? '' : '0'"
          >
          <template v-slot:header>
            <q-item-section avatar>
              <q-toggle
              v-model="layer.visible"
              @input="clickVis()"
              />
            </q-item-section>
            <q-item-section>
              {{layer.label}}
            </q-item-section>
          </template>

          <q-card>
            <q-card-section>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem, eius reprehenderit eos corrupti
              commodi magni quaerat ex numquam, dolorum officiis modi facere maiores architecto suscipit iste
              eveniet doloribus ullam aliquid.
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
    </q-drawer>

    <q-drawer
      v-model="fileDrawerVisible"
      bordered
      overlay
      content-class="bg-grey-2"
    >
      <q-list bordered>
        <q-item
        clickable
        v-ripple
        @click="openSample()"
        >
          <q-item-section>Sample</q-item-section>
          <q-item-section avatar>
            <q-icon name="img:statics/logo.png"/>
          </q-item-section>
        </q-item>
        <q-item
        clickable
        v-ripple
        @click="open3dm()"
        >
          <q-item-section>Open...</q-item-section>
          <q-item-section avatar>
            <q-icon color="primary" name="folder" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import RhinoApp from '../RhinoApp'

function setActiveDoc (name, byteArray, router) {
  console.log('setActiveDoc called')
  RhinoApp.setActiveDoc(name, byteArray)
  router.push('viewer').catch(err => {}) // eslint-disable-line
}

function clickElem (elem) {
  let eventMouse = document.createEvent('MouseEvents')
  eventMouse.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  elem.dispatchEvent(eventMouse)
}

function openFile (router) {
  let fileInput = document.createElement('input')
  let readFile = function (e) {
    let file = e.target.files[0]
    if (!file) {
      return
    }
    let name = file.name
    let reader = new FileReader()
    reader.onload = function (e) {
      var contents = e.target.result
      fileInput.func(name, contents, router)
      document.body.removeChild(fileInput)
    }
    reader.readAsArrayBuffer(file)
  }
  fileInput.type = 'file'
  fileInput.style.display = 'none'
  fileInput.onchange = readFile
  fileInput.func = setActiveDoc
  document.body.appendChild(fileInput)
  clickElem(fileInput)
}

export default {
  created () {
    RhinoApp.addActiveDocChangedEventWatcher(() => { this.fileDrawerVisible = false })
  },
  mounted () {
    console.log('layout mounted')
  },
  data () {
    let vm = RhinoApp.viewModel()
    return {
      layerDrawerVisible: false,
      fileDrawerVisible: true,
      viewmodel: vm
    }
  },
  methods: {
    clickVis () {
      RhinoApp.updateVisibility()
    },
    clickLayers () {
      this.fileDrawerVisible = false
      this.layerDrawerVisible = !this.layerDrawerVisible
    },
    clickFolder () {
      this.layerDrawerVisible = false
      this.fileDrawerVisible = !this.fileDrawerVisible
    },
    openSample () {
      let fetchPromise = fetch('statics/hello_mesh.3dm')
      fetchPromise.then((res) => {
        let bufferPromise = res.arrayBuffer()
        bufferPromise.then((buffer) => {
          let byteArray = new Uint8Array(buffer)
          RhinoApp.setActiveDoc('RhinoLogo.3dm', byteArray)
          this.$router.push('viewer').catch(err => {}) // eslint-disable-line
        })
      })
    },
    open3dm () {
      openFile(this.$router)
    }
  }
}
</script>
