import * as THREE from 'three'
import SceneUtilities from './SceneUtilities.js'

function createBufferGeometry (lineList) {
  let geometry = new THREE.BufferGeometry()

  let positions = new Float32Array(lineList._starts.length * 3)
  for (let i = 0; i < lineList._starts.length; i++) {
    positions[i * 3] = lineList._starts[i].x
    positions[i * 3 + 1] = lineList._starts[i].y
    positions[i * 3 + 2] = lineList._starts[i].z
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  if (lineList._canBeLineSegments) {
    // we're done for single pixel thickness, single color wires
    return geometry
  }

  let ends = new Float32Array(lineList._ends.length * 3)
  for (let i = 0; i < lineList._ends.length; i++) {
    ends[i * 3] = lineList._ends[i].x
    ends[i * 3 + 1] = lineList._ends[i].y
    ends[i * 3 + 2] = lineList._ends[i].z
  }
  geometry.setAttribute('end', new THREE.BufferAttribute(ends, 3))

  let thicknesses = new Float32Array(lineList._thicknesses.length)
  for (let i = 0; i < lineList._thicknesses.length; i++) {
    thicknesses[i] = lineList._thicknesses[i]
  }
  geometry.setAttribute('thickness', new THREE.BufferAttribute(thicknesses, 1))

  let sides = new Int8Array(lineList._sides.length)
  for (let i = 0; i < lineList._sides.length; i++) {
    sides[i] = lineList._sides[i]
  }
  geometry.setAttribute('side', new THREE.BufferAttribute(sides, 1))

  let colors = new Float32Array(lineList._colors.length * 4)
  for (let i = 0; i < lineList._colors.length; i++) {
    colors[i * 4] = lineList._colors[i].r
    colors[i * 4 + 1] = lineList._colors[i].g
    colors[i * 4 + 2] = lineList._colors[i].b
    colors[i * 4 + 3] = 1.0
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4))
  geometry.setIndex(lineList._indices)
  return geometry
}

function getLinesMaterial (noclip, pixelColor) {
  let vs = `
void main() {
  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
  vec4 clip = projectionMatrix * modelViewPosition;
#ifdef NO_CLIP_Z
  clip.z = 0.0;
#endif
  gl_Position = clip;
}
`
  let fs = `
uniform vec3 color;
void main() {
  gl_FragColor = vec4(color.rgb, 1.0);
}
`
  if (noclip) {
    vs = `#define NO_CLIP_Z
    ` + vs
    fs = `#define NO_CLIP_Z
    ` + fs
  }

  let mat = new THREE.ShaderMaterial({
    uniforms: {
      color: { type: 'vec3', value: pixelColor }
    },
    vertexShader: vs,
    fragmentShader: fs,
    depthWrite: !noclip,
    depthTest: !noclip
  })
  return mat
}

function getMeshLineMaterial (noclip) {
  let vs = `
uniform vec2 viewport_size;

attribute vec3 end;
attribute float thickness;
attribute float side;
attribute vec4 color;

varying vec4 fs_color;

vec2 ClipToScreen(in vec4 clip)
{
  float x = viewport_size.x * (1.0 + clip.x / clip.w) * 0.5;
  float y = viewport_size.y * (1.0 + clip.y / clip.w) * 0.5;
  return vec2(x, y);
}

vec2 ScreenToClip(in vec2 screen)
{
  float x = 2.0 * screen.x / viewport_size.x - 1.0;
  float y = 2.0 * screen.y / viewport_size.y - 1.0;
  return vec2(x, y);
}

vec2 RotatePoint90(in vec2 p, in bool ccw, in vec2 center)
{
  float s = ccw ? -1.0 : 1.0;
  
  // translate point back to origin:
  p = p - center;
  
  // rotate point
  float xnew = -p.y * s;
  float ynew = p.x * s;
  
  // translate point back:
  p.x = xnew + center.x;
  p.y = ynew + center.y;
  return p;
}

// Helper constants and types for 4D homogeneous drawing routines...
const int XLO = 1;
const int XHI = 2;
const int YLO = 4;
const int YHI = 8;
const int ZLO = 16;
const int ZHI = 32;

vec3 ClippingSideFlag(in vec4 q)
{
  vec3 side = vec3(0);
  float w = abs(q.w);
  if (abs(q.x)>w) side.x = q.x>q.w ? 1.0 : -1.0;
  if (abs(q.y)>w) side.y = q.y>q.w ? 1.0 : -1.0;
  if (abs(q.z)>w) side.z = q.z>q.w ? 1.0 : -1.0;
  return side;
}

void snip(in float px, in float py, in float qx, in float qy, inout float t0, inout float t1)
{
  const float small_float = 1e-10;

  float t0_local = 0.0;
  float t1_local = 1.0;

  // check which side of line P and Q are with respect to x=y
  // in this case (+) means x-y>0
  bool positive_p = (px - py) > 0.0;
  bool positive_q = (qx - qy) > 0.0;
  if (positive_p != positive_q)
  {
    // snip against x=y line
    // (1-t)P + tQ = R = (c,c)
    // (1-t)Px + tQx = (1-t)Py +tQy
    // t = (Px-Py) / (Px-Py-Qx+Qy)
    float denom = px - py - qx + qy;
    if (abs(denom) > small_float) {
      float posxy_t = (px - py) / denom;
      if (positive_p) //reduce t1
        t1_local = posxy_t < t1_local ? posxy_t : t1_local;
      else // increase t0
        t0_local = posxy_t > t0_local ? posxy_t : t0_local;
    }
  }
  // check which side of line P and Q are with respect to x=-y
  // in this case (+) means X+y>0
  positive_p = (px + py) > 0.0;
  positive_q = (qx + qy) > 0.0;
  if (positive_p != positive_q) {
    // snip against x=-y line
    // (1-t)P + tQ = R = (c,-c)
    // (1-t)Px + tQx = -((1-t)Py +tQy)
    // t = (Px+Py) / (Px+Py-Qx-Qy)
    float denom = px + py - qx - qy;
    if (abs(denom) > small_float) {
      float negxy_t = (px + py) / denom;
      if (positive_p) //reduce t1
        t1_local = negxy_t < t1_local ? negxy_t : t1_local;
      else // increase t0
        t0_local = negxy_t > t0_local ? negxy_t : t0_local;
    }
  }
  if (t0_local >= t1_local)
    return;
  if (t0_local > t0)
    t0 = t0_local;
  if (t1_local < t1)
    t1 = t1_local;
}

void SnipToFrustum(in vec4 start, in vec4 end, in vec3 start_side, in vec3 end_side, out float t0, out float t1)
{
  t0 = 0.0;
  t1 = 1.0;

  if( start_side.x != 0.0 || end_side.x != 0.0)
  {
    snip(start.w, start.x, end.w, end.x, t0, t1);
  }
  if( start_side.y != 0.0 || end_side.y != 0.0)
  {
    snip(start.w, start.y, end.w, end.y, t0, t1);
  }
  if( start_side.z != 0.0 || end_side.z != 0.0)
  {
    snip(start.w, start.z, end.w, end.z, t0, t1);
  }
}
void main()
{
  fs_color = color;

  vec4 clip_position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec4 clip_next = projectionMatrix * modelViewMatrix * vec4(end, 1.0);
#ifdef NO_CLIP_Z
  clip_position.z = 0.0;
  clip_next.z = 0.0;
#endif
  vec3 start_side = ClippingSideFlag(clip_position);
  vec3 end_side = ClippingSideFlag(clip_next);
  float t0 = 0.0;
  float t1 = 1.0;
  SnipToFrustum(clip_position, clip_next, start_side, end_side, t0, t1);
  vec3 world_dir = end - position;
  vec3 clipped_start = position + world_dir * t0;
  vec3 clipped_end = position + world_dir * t1;
  clip_position = projectionMatrix * modelViewMatrix * vec4(clipped_start, 1.0);
  clip_next = projectionMatrix * modelViewMatrix * vec4(clipped_end, 1.0);


  vec2 screen0 = ClipToScreen(clip_position);
  vec2 screen1 = ClipToScreen(clip_next);
  vec2 dir = screen1 - screen0;
  dir = normalize(dir);
  vec2 offset_screen_point = screen0 + (dir * 0.5 * thickness);
  vec2 screen = RotatePoint90(offset_screen_point, side>0.0, screen0);
  vec2 s2c = ScreenToClip(screen);
  clip_position.x = s2c.x*clip_position.w;
  clip_position.y = s2c.y*clip_position.w;
#ifdef NO_CLIP_Z
  clip_position.z = 0.0;
#endif
  // clip_position.w = 1.0;
  gl_Position = clip_position;
}
`
  let fs = `
varying vec4 fs_color;

void main() {
  gl_FragColor = fs_color;
}
`
  if (noclip) {
    vs = `#define NO_CLIP_Z
    ` + vs
    fs = `#define NO_CLIP_Z
    ` + fs
  }

  let material = new THREE.ShaderMaterial({
    uniforms: {
      viewport_size: { type: 'vec2', value: SceneUtilities.viewportSize }
    },
    vertexShader: vs,
    fragmentShader: fs,
    depthWrite: !noclip,
    depthTest: !noclip
  })
  return material
}

function getMaterial (lineList) {
  let noclip = !lineList._depthTesting
  return lineList._canBeLineSegments
    ? getLinesMaterial(noclip, lineList._colors)
    : getMeshLineMaterial(noclip)
}

class GlslLineList {
  static createThreeObjectFromLines (lines, color, thickness, depthTest) {
    let linelist = new GlslLineList(depthTest)
    linelist.addLines(lines, color, thickness)
    return linelist.createThreeObject()
  }
  constructor (depthTesting) {
    this._canBeLineSegments = true
    this._starts = []
    this._ends = []
    this._thicknesses = []
    this._sides = []
    this._colors = []
    this._indices = []
    this._depthTesting = depthTesting
  }
  addLine (from, to, color, thickness) {
    if (this._canBeLineSegments) {
      if (thickness !== 1.0 ||
         (this._colors.length > 0 && !this._colors[0].equals(color))) {
        let temp = new GlslLineList()
        temp._canBeLineSegments = false
        for (let i = 0; i < this._starts.length; i += 2) {
          let start = this._starts[i]
          let end = this._starts[i + 1]
          temp.addLine(start, end, this._colors, this._thicknesses)
        }
        this._canBeLineSegments = false
        this._starts = temp._starts
        this._ends = temp._ends
        this._thicknesses = temp._thicknesses
        this._sides = temp._sides
        this._colors = temp._colors
        this._indices = temp._indices
      }
    }
    if (this._canBeLineSegments) {
      this._starts = this._starts.concat([from, to])
      this._colors = color
      this._thicknesses = 1.0
      return
    }
    this._starts = this._starts.concat([from, to, to, from])
    this._ends = this._ends.concat([to, from, from, to])
    this._sides = this._sides.concat([1, -1, 1, -1])
    this._colors = this._colors.concat([color, color, color, color])
    this._thicknesses = this._thicknesses.concat([thickness, thickness, thickness, thickness])

    let start = this._starts.length - 4
    this._indices = this._indices.concat([start, start + 1, start + 2, start + 2, start + 3, start])
  }
  addLines (lines, color, thickness) {
    for (let i = 0; i < lines.length; i += 2) {
      let from = lines[i]
      let to = lines[i + 1]
      this.addLine(from, to, color, thickness)
    }
  }
  addPolyline (points, color, thickness) {
    let count = points.length
    if (count < 2) { return }
    for (let i = 0; i < count - 1; i++) {
      this.addLine(points[i], points[i + 1], color, thickness)
    }
  }
  createThreeObject () {
    let geometry = createBufferGeometry(this)
    let material = getMaterial(this)
    return this._canBeLineSegments
      ? new THREE.LineSegments(geometry, material)
      : new THREE.Mesh(geometry, material)
  }
}

export default GlslLineList
