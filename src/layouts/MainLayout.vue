<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn @click="clickFolder()"
          dense
          :flat="!fileDrawerVisible"
          icon="folder"
          :color="!fileDrawerVisible ? '' : 'secondary'"
        />

        <q-btn @click="clickLayers()"
          dense
          :flat="!layerDrawerVisible"
          :color="!layerDrawerVisible ? '' : 'secondary'"
          icon="layers"
          :disable="!viewmodel.docExists"
        />

        <q-btn @click="clickView()"
          dense
          :flat="!viewDrawerVisible"
          :color="!viewDrawerVisible ? '' : 'secondary'"
          icon="aspect_ratio"
          :disable="!viewmodel.docExists"
        />

        <q-toolbar-title>
        </q-toolbar-title>
        <div>
          {{viewmodel.filename}}
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="fileDrawerVisible" bordered overlay content-class="bg-grey-2">
      <q-list bordered>
        <q-item clickable v-ripple @click="openSample()">
          <q-item-section>Open Sample</q-item-section>
          <q-item-section avatar>
            <q-icon name="img:statics/logo.png"/>
          </q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="open3dm()">
          <q-item-section>Open...</q-item-section>
          <q-item-section avatar>
            <q-icon color="primary" name="folder" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-drawer v-model="layerDrawerVisible" bordered overlay content-class="bg-grey-2">
      <q-list>
        <q-expansion-item v-for="layer in viewmodel.layers"
          :key="layer.label"
          clickable
          :expand-icon="layer.children ? '' : '0'"
          >
          <template v-slot:header>
            <q-item-section avatar>
              <q-toggle v-model="layer.visible" @input="updateVisibility()"/>
            </q-item-section>
            <q-item-section>
              {{layer.label}}
            </q-item-section>
          </template>
          <q-card>
            <q-card-section>
              Still working on child layer UI
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
    </q-drawer>

    <q-drawer v-model="viewDrawerVisible" bordered overlay content-class="bg-grey-2">
      <q-list bordered>
        <q-item>
          <q-item-section avatar>
            <q-toggle v-model="viewmodel.gridVisible"
            @input="updateVisibility()"
            label="Grid"
            />
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

export default {
  created () {
    RhinoApp.addActiveDocChangedEventWatcher(() => { this.fileDrawerVisible = false })
  },
  data () {
    let vm = RhinoApp.viewModel()
    return {
      layerDrawerVisible: false,
      fileDrawerVisible: true,
      viewDrawerVisible: false,
      viewmodel: vm
    }
  },
  methods: {
    updateVisibility () {
      RhinoApp.updateVisibility()
    },
    clickLayers () {
      this.fileDrawerVisible = false
      this.viewDrawerVisible = false
      this.layerDrawerVisible = !this.layerDrawerVisible
    },
    clickFolder () {
      this.layerDrawerVisible = false
      this.viewDrawerVisible = false
      this.fileDrawerVisible = !this.fileDrawerVisible
    },
    clickView () {
      this.layerDrawerVisible = false
      this.fileDrawerVisible = false
      this.viewDrawerVisible = !this.viewDrawerVisible
    },
    openSample () {
      let fetchPromise = fetch('statics/hello_mesh.3dm')
      fetchPromise.then((res) => {
        let bufferPromise = res.arrayBuffer()
        bufferPromise.then((buffer) => {
          RhinoApp.setActiveDoc('RhinoLogo.3dm', new Uint8Array(buffer))
        })
      })
    },
    open3dm () {
      let fileInput = document.createElement('input')
      let readFile = function (e) {
        let file = e.target.files[0]
        if (!file) { return }
        let reader = new FileReader()
        reader.onload = function (e) {
          var contents = e.target.result
          RhinoApp.setActiveDoc(file.name, contents)
          document.body.removeChild(fileInput)
        }
        reader.readAsArrayBuffer(file)
      }
      fileInput.type = 'file'
      fileInput.style.display = 'none'
      fileInput.onchange = readFile
      document.body.appendChild(fileInput)
      let eventMouse = document.createEvent('MouseEvents')
      eventMouse.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
      fileInput.dispatchEvent(eventMouse)
    }
  }
}
</script>
