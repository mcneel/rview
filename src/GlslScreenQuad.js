import * as THREE from 'three'

function createBufferGeometry () {
  let geometry = new THREE.BufferGeometry()
  let positions = new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0])
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setIndex([0, 1, 2, 0, 2, 3])
  return geometry
}

function getMaterial () {
  let vs = `
varying vec2 tc;
void main() {
  tc = vec2((position.x + 1.0) * 0.5, (position.y + 1.0) * 0.5);
  gl_Position = vec4(position, 1.0);
}
`
  let fs = `
uniform sampler2D imageLeft;
uniform sampler2D imageRight;
uniform float horizontalPosition;
uniform int compareMode;
varying vec2 tc;
void main() {
  vec4 color1 = texture2D(imageLeft, tc);
  vec4 color2 = texture2D(imageRight, tc);
  // compareMode: 0 (swipe), 1 (blend)
  if (compareMode == 0) {
    gl_FragColor = texture2D(imageLeft, tc);
    if (tc.x > horizontalPosition)
      gl_FragColor = texture2D(imageRight, tc);
  } else {
    gl_FragColor = mix(color1, color2, horizontalPosition);
  }
}
`
  let mat = new THREE.ShaderMaterial({
    uniforms: {
      imageLeft: { type: 'sampler2D', value: null },
      imageRight: { type: 'sampler2D', value: null },
      horizontalPosition: { type: 'float', value: 1.0 },
      compareMode: { type: 'int', value: 0 }
    },
    vertexShader: vs,
    fragmentShader: fs,
    depthWrite: false,
    depthTest: false,
    transparent: true
  })
  return mat
}

export default class GlslScreenQuad {
  static createThreeObject () {
    let geometry = createBufferGeometry()
    let material = getMaterial()
    return new THREE.Mesh(geometry, material)
  }
}
