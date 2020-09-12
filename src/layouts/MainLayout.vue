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
        <q-item :inset-level="0.3" clickable v-ripple @click="openSample('rhino_logo.3dm', true)">
          <q-item-section>Open Sample</q-item-section>
          <q-item-section avatar>
            <q-icon name="img:logo.png"/>
          </q-item-section>
        </q-item>
        <q-item :inset-level="0.3" clickable v-ripple @click="openFile(false)">
          <q-item-section>Open...</q-item-section>
          <q-item-section avatar>
            <q-icon color="primary" name="folder" />
          </q-item-section>
        </q-item>
      </q-list>
      <q-list>
        <q-item :disable="!model1Exists">
          <q-item-section>Model 2</q-item-section>
        </q-item>
        <q-item :inset-level="0.3" clickable v-ripple :disable="!model1Exists" @click="openSample('rhino_logo_subd.3dm', false)">
          <q-item-section>Open Sample</q-item-section>
          <q-item-section avatar>
            <q-icon name="img:logo.png"/>
          </q-item-section>
        </q-item>
        <q-item :inset-level="0.3" clickable v-ripple :disable="!model1Exists" @click="openFile(true)">
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
        <q-item v-if="viewmodel.model2Exists">
          <q-item-section>Model 1</q-item-section>
        </q-item>
        <q-item :inset-level="0.3">
          <q-item-section>
            <q-select v-model="currentDisplayModeName"
              outlined
              dense
              options-dense
              :options="displayModeNames"
              @input="setActiveDisplayMode(currentDisplayModeName, true)"/>
          </q-item-section>
        </q-item>
      </q-list>
      <q-list v-if="viewmodel.model2Exists">
        <q-item>
          <q-item-section>Model 2</q-item-section>
        </q-item>
        <q-item :inset-level="0.3">
          <q-item-section>
            <q-select v-model="currentDisplayModeName"
              outlined
              dense
              options-dense
              :options="displayModeNames"
              @input="setActiveDisplayMode(currentDisplayModeName, false)"/>
          </q-item-section>
        </q-item>
      </q-list>
      <q-list bordered>
        <q-item v-if="viewmodel.model2Exists">
          <q-item-section>General</q-item-section>
        </q-item>
        <q-item dense :inset-level="0.3">
          <q-item-section avatar><q-icon name="grid_on"/></q-item-section>
          <q-item-section><q-item-label>Grid</q-item-label></q-item-section>
          <q-item-section side>
            <q-toggle v-model="viewmodel.showGrid" @input="updateVisibility()"/>
          </q-item-section>
        </q-item>
        <q-item v-if="viewmodel.model2Exists" :inset-level="0.3">
          <q-option-group
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
    },
    model1Exists () {
      return this.viewmodel.model1.exists
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
      fetch(name).then((res) => {
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
    setActiveDisplayMode (name, forModel1) {
      RViewApp.setActiveDisplayMode(name, forModel1)
    },
    updateVisibility () {
      RViewApp.updateVisibility()
    }
  }
}
</script>
