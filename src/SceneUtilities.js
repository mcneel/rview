import * as THREE from 'three'

let _rhino3dm = null // eslint-disable-line

let SceneUtilities = {
  init (rhino3dm) {
    _rhino3dm = rhino3dm
  },
  createGrid () {
    const gridSpacing = 1.0
    const gridLineCount = 70
    const gridThickFrequency = 5

    const xMin = -gridLineCount * gridSpacing
    const yMin = xMin
    const xMax = gridLineCount * gridSpacing
    const yMax = xMax
    let grid = new THREE.Group()
    let minorLines = []
    let majorLines = []
    for (let i = -gridLineCount; i <= gridLineCount; i++) {
      let x = i * gridSpacing
      let y = i * gridSpacing
      if (i === 0) {
        majorLines.push(new THREE.Vector3(0, yMin, 0))
        majorLines.push(new THREE.Vector3(0, 0, 0))
        majorLines.push(new THREE.Vector3(xMin, 0, 0))
        majorLines.push(new THREE.Vector3(0, 0, 0))
        continue
      }

      if (i % gridThickFrequency === 0) {
        majorLines.push(new THREE.Vector3(x, yMin, 0))
        majorLines.push(new THREE.Vector3(x, yMax, 0))
        majorLines.push(new THREE.Vector3(xMin, y, 0))
        majorLines.push(new THREE.Vector3(xMax, y, 0))
      } else {
        minorLines.push(new THREE.Vector3(x, yMin, 0))
        minorLines.push(new THREE.Vector3(x, yMax, 0))
        minorLines.push(new THREE.Vector3(xMin, y, 0))
        minorLines.push(new THREE.Vector3(xMax, y, 0))
      }
    }
    let majorMaterial = new THREE.LineBasicMaterial({
      color: 0x111111,
      depthTest: false,
      depthWrite: false
    })
    let positions = new Float32Array(majorLines.length * 3)
    for (let i = 0; i < majorLines.length; i++) {
      positions[i * 3] = majorLines[i].x
      positions[i * 3 + 1] = majorLines[i].y
      positions[i * 3 + 2] = majorLines[i].z
    }
    let geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    let major = new THREE.LineSegments(geometry, majorMaterial)  // eslint-disable-line

    let minorMaterial = new THREE.LineBasicMaterial({
      color: 0x777777,
      depthTest: false,
      depthWrite: false
    })
    positions = new Float32Array(minorLines.length * 3)
    for (let i = 0; i < minorLines.length; i++) {
      positions[i * 3] = minorLines[i].x
      positions[i * 3 + 1] = minorLines[i].y
      positions[i * 3 + 2] = minorLines[i].z
    }
    geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    let minor = new THREE.LineSegments(geometry, minorMaterial) // eslint-disable-line
    grid.add(major)
    grid.add(minor)

    positions = new Float32Array([0, 0, 0, xMax, 0, 0])
    geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    let xMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(150 / 255, 75 / 255, 75 / 255),
      depthTest: false,
      depthWrite: false
    })
    grid.add(new THREE.LineSegments(geometry, xMaterial))

    positions = new Float32Array([0, 0, 0, 0, yMax, 0])
    geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    let yMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(75 / 255, 150 / 255, 75 / 255),
      depthTest: false,
      depthWrite: false
    })
    grid.add(new THREE.LineSegments(geometry, yMaterial))
    return grid
  }
}

export default SceneUtilities
