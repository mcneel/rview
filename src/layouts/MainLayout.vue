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
          :disable="!viewmodel.docExists"
        >
        <q-tooltip>Layers</q-tooltip>
        </q-btn>
        <q-btn @click="toggleDrawer(drawers.VIEW)"
          dense
          :flat="!viewDrawerVisible"
          :color="!viewDrawerVisible ? '' : 'secondary'"
          icon="aspect_ratio"
          :disable="!viewmodel.docExists"
        >
        <q-tooltip>Display options</q-tooltip>
        </q-btn>
        <q-btn @click="toggleDrawer(drawers.COMPARE)"
          dense
          :flat="!compareDrawerVisible"
          :color="!compareDrawerVisible ? '' : 'secondary'"
          icon="compare"
          :disable="!viewmodel.compareDocExists"
        >
        <q-tooltip>Compare options</q-tooltip>
        </q-btn>

        <q-toolbar-title>
        </q-toolbar-title>
        <div>{{viewmodel.title}}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="fileDrawerVisible" bordered overlay content-class="bg-grey-2">
      <q-list bordered>
        <q-item clickable v-ripple @click="openSample()">
          <q-item-section>Open Sample</q-item-section>
          <q-item-section avatar>
            <q-icon name="img:logo.png"/>
          </q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="openCompareSample()">
          <q-item-section>Open Compare Sample</q-item-section>
          <q-item-section avatar>
            <q-icon name="img:logo.png"/>
          </q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="openFile(false)">
          <q-item-section>Open...</q-item-section>
          <q-item-section avatar>
            <q-icon color="primary" name="folder" />
          </q-item-section>
        </q-item>
        <q-item v-if="viewmodel.docExists" clickable v-ripple @click="openFile(true)">
          <q-item-section>Open Compare...</q-item-section>
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
        <q-item-section>
          <q-select v-model="currentDisplayModeName"
            outlined
            dense
            options-dense
            :options="displayModeNames"
            @input="setActiveDisplayMode(currentDisplayModeName)"/>
        </q-item-section>
        <q-expansion-item expand-separator icon="landscape" label="Background" :content-inset-level="1">
          <q-list>
            <q-item-section>
              <q-select v-model="viewmodel.displayMode.backgroundStyle"
                filled
                dense
                options-dense
                :options="backgroundModes"
              />
            </q-item-section>
            <q-item v-if="viewmodel.displayMode.backgroundStyle===backgroundModes[0] || viewmodel.displayMode.backgroundStyle===backgroundModes[1]">
              <q-item-section>
                <q-item-label>{{viewmodel.displayMode.backgroundStyle===backgroundModes[0] ? 'Color' : 'Top Color'}}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn round size="xs" icon="colorize" color="primary">
                  <q-popup-proxy>
                    <q-color v-if="viewmodel.displayMode.backgroundStyle===backgroundModes[0]" v-model="viewmodel.displayMode.backgroundColor"/>
                    <q-color v-if="viewmodel.displayMode.backgroundStyle===backgroundModes[1]" v-model="viewmodel.displayMode.backgroundGradientTop"/>
                  </q-popup-proxy>
                </q-btn>
              </q-item-section>
            </q-item>
            <q-item v-if="viewmodel.displayMode.backgroundStyle===backgroundModes[1]">
              <q-item-section>
                <q-item-label>Bottom Color</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn round size="xs" icon="colorize" color="primary">
                  <q-popup-proxy>
                    <q-color v-model="viewmodel.displayMode.backgroundGradientBottom"/>
                  </q-popup-proxy>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
        <q-item dense>
          <q-item-section avatar><q-icon name="grid_on"/></q-item-section>
          <q-item-section><q-item-label>Grid</q-item-label></q-item-section>
          <q-item-section side>
            <q-toggle v-model="viewmodel.displayMode.showGrid" @input="updateVisibility()"/>
          </q-item-section>
        </q-item>
        <q-item dense>
          <q-item-section avatar></q-item-section>
          <q-item-section><q-item-label>Surface Wires</q-item-label></q-item-section>
          <q-item-section side>
            <q-toggle v-model="viewmodel.displayMode.showSurfaceWires" @input="updateVisibility()"/>
          </q-item-section>
        </q-item>
        <q-item dense>
          <q-item-section avatar></q-item-section>
          <q-item-section><q-item-label>Clipping Planes</q-item-label></q-item-section>
          <q-item-section side>
            <q-toggle v-model="viewmodel.displayMode.clipping"/>
          </q-item-section>
        </q-item>
        <q-expansion-item expand-separator icon="palette" label="Material" :content-inset-level="1">
          <q-list>
            <q-item-section>
              <q-select v-model="viewmodel.currentMaterialStyle"
                filled
                dense
                options-dense
                :options="viewmodel.materialOptions"
              />
            </q-item-section>
          </q-list>
        </q-expansion-item>
      </q-list>
    </q-drawer>

    <q-drawer v-model="compareDrawerVisible" bordered overlay content-class="bg-grey-2">
      <q-list bordered>
        <q-item>
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
      compareDrawerVisible: false,
      viewmodel: vm,
      drawers: { FILE: 1, LAYER: 2, VIEW: 3, COMPARE: 4 },
      backgroundModes: DisplayMode.backgroundModes,
      currentDisplayModeName: vm.displayMode.name
    }
  },
  computed: {
    displayModeNames () {
      let names = []
      DisplayMode.defaultModes().forEach((mode) => {
        names.push(mode.name)
      })
      return Object.freeze(names)
    }
  },
  methods: {
    toggleDrawer (drawer) {
      this.fileDrawerVisible = (drawer === this.drawers.FILE) ? !this.fileDrawerVisible : false
      this.layerDrawerVisible = (drawer === this.drawers.LAYER) ? !this.layerDrawerVisible : false
      this.viewDrawerVisible = (drawer === this.drawers.VIEW) ? !this.viewDrawerVisible : false
      this.compareDrawerVisible = (drawer === this.drawers.COMPARE) ? !this.compareDrawerVisible : false
    },
    openSample () {
      fetch('rhino_logo.3dm').then((res) => {
        let bufferPromise = res.arrayBuffer()
        bufferPromise.then((buffer) => {
          RViewApp.openFile('RhinoLogo.3dm', new Uint8Array(buffer))
          this.fileDrawerVisible = false
        })
      })
    },
    openCompareSample () {
      let fetchComparePromise = fetch('rhino_logo_twisted.3dm')
      fetch('rhino_logo.3dm').then((res) => {
        let bufferPromise = res.arrayBuffer()
        bufferPromise.then((buffer) => {
          RViewApp.openFile('RhinoLogo.3dm', new Uint8Array(buffer))
          fetchComparePromise.then((res) => {
            bufferPromise = res.arrayBuffer()
            bufferPromise.then((buffer) => {
              RViewApp.openFile('RhinoLogoTwisted.3dm', new Uint8Array(buffer), true)
              this.fileDrawerVisible = false
            })
          })
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
    setActiveDisplayMode (name) {
      RViewApp.setActiveDisplayMode(name)
    },
    updateVisibility () {
      RViewApp.updateVisibility()
    }
  }
}
</script>
