<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn @click="toggleDrawer(drawers.FILE)"
          dense
          :flat="!fileDrawerVisible"
          icon="folder"
          :color="!fileDrawerVisible ? '' : 'secondary'"
        >
        <q-tooltip>Open...</q-tooltip>
        </q-btn>
        <q-btn @click="toggleDrawer(drawers.LAYER)"
          dense
          :flat="!layerDrawerVisible"
          :color="!layerDrawerVisible ? '' : 'secondary'"
          icon="layers"
          :disable="!model1Exists"
        >
        <q-tooltip>Layers</q-tooltip>
        </q-btn>
        <q-btn @click="toggleDrawer(drawers.VIEW)"
          dense
          :flat="!viewDrawerVisible"
          :color="!viewDrawerVisible ? '' : 'secondary'"
          icon="aspect_ratio"
          :disable="!model1Exists"
        >
        <q-tooltip>Display options</q-tooltip>
        </q-btn>

        <q-toolbar-title>
        </q-toolbar-title>
        <div>{{title}}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="fileDrawerVisible" bordered overlay content-class="bg-grey-2">
      <q-list bordered>
        <q-item>
          <q-item-section>Model 1</q-item-section>
        </q-item>
        <q-item :inset-level="0.3">
          <q-btn-dropdown class="full-width" no-caps label="Open Sample" icon="img:logo.png">
            <q-list>
              <q-item v-for="sample in sampleModels"
                :key="sample"
                clickable
                v-close-popup
                @click="openSample(sample, true)"
              >
                <q-item-section>
                  <q-item-label>{{sample}}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-item>
        <q-item :inset-level="0.3">
          <q-btn class="full-width" no-caps label="Open..." icon="folder" @click="openFile(false)"/>
        </q-item>
      </q-list>
      <q-list>
        <q-item :disable="!model1Exists">
          <q-item-section>Model 2</q-item-section>
        </q-item>
        <q-item :inset-level="0.3" :disable="!model1Exists">
          <q-btn-dropdown class="full-width" no-caps label="Open Sample" icon="img:logo.png">
            <q-list>
              <q-item v-for="sample in sampleModels"
                :key="sample"
                clickable
                v-close-popup
                @click="openSample(sample, false)"
              >
                <q-item-section>
                  <q-item-label>{{sample}}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-item>
        <q-item :inset-level="0.3">
          <q-btn class="full-width" no-caps label="Open..." icon="folder" @click="openFile(true)"/>
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
      <q-list bordered dense>
        <q-item>
          <q-item-section v-if="viewmodel.model2Exists">Model 1</q-item-section>
          <q-item-section v-else>Show</q-item-section>
        </q-item>
        <q-item :inset-level="0.3">
          <q-toggle label="Wires" v-model="viewmodel.model1.displayAttrs.wires" @input="updateVisibility()"/>
        </q-item>
        <q-item :inset-level="0.3">
          <q-toggle label="Shading" v-model="viewmodel.model1.displayAttrs.shading" @input="updateVisibility()"/>
        </q-item>
      </q-list>
      <q-list dense v-if="viewmodel.model2Exists">
        <q-item>
          <q-item-section>Model 2</q-item-section>
        </q-item>
        <q-item :inset-level="0.3">
          <q-toggle label="Wires" v-model="viewmodel.model2.displayAttrs.wires" @input="updateVisibility()"/>
        </q-item>
        <q-item :inset-level="0.3">
          <q-toggle label="Shading" v-model="viewmodel.model2.displayAttrs.shading" @input="updateVisibility()"/>
        </q-item>
      </q-list>
      <q-list dense bordered>
        <q-item v-if="viewmodel.model2Exists">
          <q-item-section>General</q-item-section>
        </q-item>
        <q-item :inset-level="0.3">
          <q-item-section>
            <q-toggle v-model="viewmodel.showGrid" label="Grid" @input="updateVisibility()"/>
          </q-item-section>
          <q-item-section avatar><q-icon name="grid_on"/></q-item-section>
        </q-item>
        <q-item v-if="viewmodel.model2Exists" :inset-level="0.3">
          <q-option-group v-model="viewmodel.compareMode"
            :options="[{label: 'Swipe Compare', value: 0}, {label: 'Blend Compare', value: 1}]"
            outlined
          />
        </q-item>
      </q-list>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import RViewApp from '../RViewApp'
import DisplayMode from '../DisplayMode'

export default {
  data () {
    let vm = RViewApp.viewModel()
    return {
      layerDrawerVisible: false,
      fileDrawerVisible: true,
      viewDrawerVisible: false,
      viewmodel: vm,
      drawers: { FILE: 1, LAYER: 2, VIEW: 3 },
      backgroundModes: DisplayMode.backgroundModes
    }
  },
  computed: {
    model1Exists () {
      return this.viewmodel.model1.exists
    },
    sampleModels () {
      return [
        'RhinoLogo.3dm',
        'RhinoLogoSubD.3dm',
        'Clip.3dm',
        'Drill.3dm',
        'Ring.3dm',
        'Teacup.3dm',
        'Teapots.3dm'
      ]
    },
    title () {
      let t = RViewApp.applicationTitle()
      if (this.viewmodel.model1.name.length > 0) {
        t = this.viewmodel.model1.name
        if (this.viewmodel.model2.name.length > 0) {
          t += ' | ' + this.viewmodel.model2.name
        }
      }
      return t
    }
  },
  methods: {
    toggleDrawer (drawer) {
      this.fileDrawerVisible = (drawer === this.drawers.FILE) ? !this.fileDrawerVisible : false
      this.layerDrawerVisible = (drawer === this.drawers.LAYER) ? !this.layerDrawerVisible : false
      this.viewDrawerVisible = (drawer === this.drawers.VIEW) ? !this.viewDrawerVisible : false
    },
    openSample (name, asModel1) {
      const path = 'samples/' + name
      fetch(path).then((res) => {
        let bufferPromise = res.arrayBuffer()
        bufferPromise.then((buffer) => {
          RViewApp.openFile(name, new Uint8Array(buffer), !asModel1)
          this.fileDrawerVisible = false
        })
      })
    },
    openFile (asCompare) {
      let fileInput = document.createElement('input')
      const localVM = this
      let readFile = function (e) {
        let file = e.target.files[0]
        if (!file) { return }
        let reader = new FileReader()
        reader.onload = function (e) {
          var contents = e.target.result
          const openSuccess = RViewApp.openFile(file.name, contents, asCompare)
          document.body.removeChild(fileInput)
          if (openSuccess) localVM.fileDrawerVisible = false
        }
        if (file.name.endsWith('.obj') || file.name.endsWith('.ply')) {
          reader.readAsText(file)
        } else {
          reader.readAsArrayBuffer(file)
        }
      }
      fileInput.type = 'file'
      fileInput.accept = '.3dm, .obj, .drc, .ply'
      fileInput.style.display = 'none'
      fileInput.onchange = readFile
      document.body.appendChild(fileInput)
      let eventMouse = document.createEvent('MouseEvents')
      eventMouse.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
      fileInput.dispatchEvent(eventMouse)
    },
    updateVisibility () {
      RViewApp.updateVisibility()
    }
  }
}
</script>
