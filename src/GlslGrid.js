import * as THREE from 'three'

// GlslGrid shader draws all wires with a frustum z value of 0 to make sure
// they don't get clipped by near and far planes
let GlslGrid = {
  vs: `
  void main() {
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    vec4 p = projectionMatrix * modelViewPosition;
    p.z = 0.0;
    gl_Position = p;
  }
  `,
  fs: `
  uniform vec3 color;
  void main() {
    gl_FragColor = vec4(color.rgb, 1.0);
  }
  `,
  material (pixelColor) {
    let mat = new THREE.ShaderMaterial({
      uniforms: {
        color: { type: 'vec3', value: pixelColor }
      },
      vertexShader: this.vs,
      fragmentShader: this.fs,
      depthWrite: false,
      depthTest: false
    })
    return mat
  }
}

export default GlslGrid
