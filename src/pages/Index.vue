<template>
  <q-page class="q-pa-md q-gutter-md">
    <q-btn
      @click='openSample()'
      size="xl"
    >
      <q-avatar rounded size="xl">
        <img src='/statics/logo.png'>
      </q-avatar>
      <div>Sample</div>
    </q-btn>
    <q-btn
      icon="folder"
      label="Open..."
      size="xl"
      @click="open3dm()"
    >
    </q-btn>
  </q-page>
</template>

<script>
import RhinoApp from '../RhinoApp'

function setActiveDoc (name, byteArray, router) {
  console.log('setActiveDoc called')
  RhinoApp.setActiveDoc(name, byteArray)
  router.push('viewer')
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
  methods: {
    openSample () {
      let fetchPromise = fetch('/statics/hello_mesh.3dm')
      fetchPromise.then((res) => {
        let bufferPromise = res.arrayBuffer()
        bufferPromise.then((buffer) => {
          let byteArray = new Uint8Array(buffer)
          RhinoApp.setActiveDoc('RhinoLogo.3dm', byteArray)
          this.$router.push('viewer')
        })
      })
    },
    open3dm () {
      openFile(this.$router)
    }
  }
}
</script>
