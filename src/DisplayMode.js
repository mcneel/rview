function wireframeDisplayMode () {
  let mode = new Mode('Wireframe')
  mode.showSurfaceMeshes = false
  return mode
}

function shadedDisplayMode () {
  let mode = new Mode('Shaded')
  return mode
}

function ghostedDisplayMode () {
  let mode = new Mode('Ghosted')
  mode.transparency = 0.5
  return mode
}

function renderedDisplayMode () {
  let mode = new Mode('Rendered')
  mode.showGrid = false
  mode.showSurfaceWires = false
  return mode
}

class Mode {
  constructor (name = null) {
    this.name = name
    this.showGrid = true
    this.backgroundStyle = 'Single Color'
    this.backgroundColor = 'rgb(157,163,170)'
    this.backgroundGradientTop = 'rgb(54,109,168)'
    this.backgroundGradientBottom = 'rgb(165,165,165)'
    this.lightColor = 'rgb(240,240,240)'
    this.showSurfaceWires = true
    this.showSurfaceMeshes = true
    this.clipping = true

    this.defaultModes = () => {
      let modes = []
      modes.push(wireframeDisplayMode())
      modes.push(shadedDisplayMode())
      modes.push(ghostedDisplayMode())
      modes.push(renderedDisplayMode())
      return modes
    }
  }
}

let DisplayMode = {
  defaultModes: () => {
    return new Mode().defaultModes()
  },
  backgroundModes: ['Single Color', '2 Color Gradient'] // , 'Bridge2',
  // 'MilkyWay', 'Park2', 'Park3Med', 'pisa', 'skyboxsun25deg',
  // 'SwedishRoyalCastle']
}

export default DisplayMode
