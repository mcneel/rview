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
uniform sampler2D image;
uniform vec2 horizontalRange;
varying vec2 tc;
void main() {
  gl_FragColor = texture2D(image, tc); // vec4(1.0, 0.0, 0.0, tc.x);
  if (tc.x < horizontalRange[0] || tc.x > horizontalRange[1])
    discard;
}
`
  let mat = new THREE.ShaderMaterial({
    uniforms: {
      image: { type: 'sampler2D', value: null },
      horizontalRange: { type: 'vec2', value: new THREE.Vector2(0, 1) }
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
