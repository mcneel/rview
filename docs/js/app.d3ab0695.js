(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[2],{0:function(e,n,t){e.exports=t("2f39")},"0047":function(e,n,t){},"17c8":function(e,n,t){"use strict";t("63d9");var i=t("5a89"),r=t("1bee"),a=t("fc74"),o=t.n(a),s=t("59a1"),c=t.n(s);t("b05c");function l(e){for(var n=new i["d"],t=new Float32Array(3*e._starts.length),r=0;r<e._starts.length;r++)t[3*r]=e._starts[r].x,t[3*r+1]=e._starts[r].y,t[3*r+2]=e._starts[r].z;if(n.setAttribute("position",new i["c"](t,3)),e._canBeLineSegments)return n;for(var a=new Float32Array(3*e._ends.length),o=0;o<e._ends.length;o++)a[3*o]=e._ends[o].x,a[3*o+1]=e._ends[o].y,a[3*o+2]=e._ends[o].z;n.setAttribute("end",new i["c"](a,3));for(var s=new Float32Array(e._thicknesses.length),c=0;c<e._thicknesses.length;c++)s[c]=e._thicknesses[c];n.setAttribute("thickness",new i["c"](s,1));for(var l=new Int8Array(e._sides.length),d=0;d<e._sides.length;d++)l[d]=e._sides[d];n.setAttribute("side",new i["c"](l,1));for(var u=new Float32Array(4*e._colors.length),p=0;p<e._colors.length;p++)u[4*p]=e._colors[p].r,u[4*p+1]=e._colors[p].g,u[4*p+2]=e._colors[p].b,u[4*p+3]=1;return n.setAttribute("color",new i["c"](u,4)),n.setIndex(e._indices),n}function d(e,n){var t="\nvoid main() {\n  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);\n  vec4 clip = projectionMatrix * modelViewPosition;\n#ifdef NO_CLIP_Z\n  clip.z = 0.0;\n#else\n  float z = clip_position.z / clip_position.w;\n  z -= 0.001;\n  clip_position.z = z * clip_position.w;\n#endif\n  gl_Position = clip;\n}\n",r="\nuniform vec3 color;\nvoid main() {\n  gl_FragColor = vec4(color.rgb, 1.0);\n}\n";e&&(t="#define NO_CLIP_Z\n    "+t,r="#define NO_CLIP_Z\n    "+r);var a=new i["W"]({uniforms:{color:{type:"vec3",value:n}},vertexShader:t,fragmentShader:r,depthWrite:!e,depthTest:!e});return a}function u(e){var n="\nuniform vec2 viewport_size;\n\nattribute vec3 end;\nattribute float thickness;\nattribute float side;\nattribute vec4 color;\n\nvarying vec4 fs_color;\n\nvec2 ClipToScreen(in vec4 clip)\n{\n  float x = viewport_size.x * (1.0 + clip.x / clip.w) * 0.5;\n  float y = viewport_size.y * (1.0 + clip.y / clip.w) * 0.5;\n  return vec2(x, y);\n}\n\nvec2 ScreenToClip(in vec2 screen)\n{\n  float x = 2.0 * screen.x / viewport_size.x - 1.0;\n  float y = 2.0 * screen.y / viewport_size.y - 1.0;\n  return vec2(x, y);\n}\n\nvec2 RotatePoint90(in vec2 p, in bool ccw, in vec2 center)\n{\n  float s = ccw ? -1.0 : 1.0;\n  \n  // translate point back to origin:\n  p = p - center;\n  \n  // rotate point\n  float xnew = -p.y * s;\n  float ynew = p.x * s;\n  \n  // translate point back:\n  p.x = xnew + center.x;\n  p.y = ynew + center.y;\n  return p;\n}\n\n// Helper constants and types for 4D homogeneous drawing routines...\nconst int XLO = 1;\nconst int XHI = 2;\nconst int YLO = 4;\nconst int YHI = 8;\nconst int ZLO = 16;\nconst int ZHI = 32;\n\nvec3 ClippingSideFlag(in vec4 q)\n{\n  vec3 side = vec3(0);\n  float w = abs(q.w);\n  if (abs(q.x)>w) side.x = q.x>q.w ? 1.0 : -1.0;\n  if (abs(q.y)>w) side.y = q.y>q.w ? 1.0 : -1.0;\n  if (abs(q.z)>w) side.z = q.z>q.w ? 1.0 : -1.0;\n  return side;\n}\n\nvoid snip(in float px, in float py, in float qx, in float qy, inout float t0, inout float t1)\n{\n  const float small_float = 1e-10;\n\n  float t0_local = 0.0;\n  float t1_local = 1.0;\n\n  // check which side of line P and Q are with respect to x=y\n  // in this case (+) means x-y>0\n  bool positive_p = (px - py) > 0.0;\n  bool positive_q = (qx - qy) > 0.0;\n  if (positive_p != positive_q)\n  {\n    // snip against x=y line\n    // (1-t)P + tQ = R = (c,c)\n    // (1-t)Px + tQx = (1-t)Py +tQy\n    // t = (Px-Py) / (Px-Py-Qx+Qy)\n    float denom = px - py - qx + qy;\n    if (abs(denom) > small_float) {\n      float posxy_t = (px - py) / denom;\n      if (positive_p) //reduce t1\n        t1_local = posxy_t < t1_local ? posxy_t : t1_local;\n      else // increase t0\n        t0_local = posxy_t > t0_local ? posxy_t : t0_local;\n    }\n  }\n  // check which side of line P and Q are with respect to x=-y\n  // in this case (+) means X+y>0\n  positive_p = (px + py) > 0.0;\n  positive_q = (qx + qy) > 0.0;\n  if (positive_p != positive_q) {\n    // snip against x=-y line\n    // (1-t)P + tQ = R = (c,-c)\n    // (1-t)Px + tQx = -((1-t)Py +tQy)\n    // t = (Px+Py) / (Px+Py-Qx-Qy)\n    float denom = px + py - qx - qy;\n    if (abs(denom) > small_float) {\n      float negxy_t = (px + py) / denom;\n      if (positive_p) //reduce t1\n        t1_local = negxy_t < t1_local ? negxy_t : t1_local;\n      else // increase t0\n        t0_local = negxy_t > t0_local ? negxy_t : t0_local;\n    }\n  }\n  if (t0_local >= t1_local)\n    return;\n  if (t0_local > t0)\n    t0 = t0_local;\n  if (t1_local < t1)\n    t1 = t1_local;\n}\n\nvoid SnipToFrustum(in vec4 start, in vec4 end, in vec3 start_side, in vec3 end_side, out float t0, out float t1)\n{\n  t0 = 0.0;\n  t1 = 1.0;\n\n  if( start_side.x != 0.0 || end_side.x != 0.0)\n  {\n    snip(start.w, start.x, end.w, end.x, t0, t1);\n  }\n  if( start_side.y != 0.0 || end_side.y != 0.0)\n  {\n    snip(start.w, start.y, end.w, end.y, t0, t1);\n  }\n  if( start_side.z != 0.0 || end_side.z != 0.0)\n  {\n    snip(start.w, start.z, end.w, end.z, t0, t1);\n  }\n}\nvoid main()\n{\n  fs_color = color;\n\n  vec4 clip_position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n  vec4 clip_next = projectionMatrix * modelViewMatrix * vec4(end, 1.0);\n#ifdef NO_CLIP_Z\n  clip_position.z = 0.0;\n  clip_next.z = 0.0;\n#endif\n  vec3 start_side = ClippingSideFlag(clip_position);\n  vec3 end_side = ClippingSideFlag(clip_next);\n  float t0 = 0.0;\n  float t1 = 1.0;\n  SnipToFrustum(clip_position, clip_next, start_side, end_side, t0, t1);\n  vec3 world_dir = end - position;\n  vec3 clipped_start = position + world_dir * t0;\n  vec3 clipped_end = position + world_dir * t1;\n  clip_position = projectionMatrix * modelViewMatrix * vec4(clipped_start, 1.0);\n  clip_next = projectionMatrix * modelViewMatrix * vec4(clipped_end, 1.0);\n\n\n  vec2 screen0 = ClipToScreen(clip_position);\n  vec2 screen1 = ClipToScreen(clip_next);\n  vec2 dir = screen1 - screen0;\n  dir = normalize(dir);\n  vec2 offset_screen_point = screen0 + (dir * 0.5 * thickness);\n  vec2 screen = RotatePoint90(offset_screen_point, side>0.0, screen0);\n  vec2 s2c = ScreenToClip(screen);\n  clip_position.x = s2c.x*clip_position.w;\n  clip_position.y = s2c.y*clip_position.w;\n#ifdef NO_CLIP_Z\n  clip_position.z = 0.0;\n#else\n  float z = clip_position.z / clip_position.w;\n  z -= 0.001;\n  clip_position.z = z * clip_position.w;\n#endif\n  // clip_position.w = 1.0;\n  gl_Position = clip_position;\n}\n",t="\nvarying vec4 fs_color;\n\nvoid main() {\n  gl_FragColor = fs_color;\n}\n";e&&(n="#define NO_CLIP_Z\n    "+n,t="#define NO_CLIP_Z\n    "+t);var r=new i["W"]({uniforms:{viewport_size:{type:"vec2",value:g.viewportSize}},vertexShader:n,fragmentShader:t,depthWrite:!e,depthTest:!e});return r}function p(e){var n=!e._depthTesting;return e._canBeLineSegments?d(n,e._colors):u(n)}var h=function(){function e(n){o()(this,e),this._canBeLineSegments=!0,this._starts=[],this._ends=[],this._thicknesses=[],this._sides=[],this._colors=[],this._indices=[],this._depthTesting=n}return c()(e,null,[{key:"createThreeObjectFromLines",value:function(n,t,i,r){var a=new e(r);return a.addLines(n,t,i),a.createThreeObject()}}]),c()(e,[{key:"addLine",value:function(n,t,r,a){if(Array.isArray(n)&&(n=new i["db"](n[0],n[1],n[2])),Array.isArray(t)&&(t=new i["db"](t[0],t[1],t[2])),this._canBeLineSegments&&(1!==a||this._colors.length>0&&!this._colors[0].equals(r))){var o=new e;o._canBeLineSegments=!1;for(var s=0;s<this._starts.length;s+=2){var c=this._starts[s],l=this._starts[s+1];o.addLine(c,l,this._colors,this._thicknesses)}this._canBeLineSegments=!1,this._starts=o._starts,this._ends=o._ends,this._thicknesses=o._thicknesses,this._sides=o._sides,this._colors=o._colors,this._indices=o._indices}if(this._canBeLineSegments)return this._starts=this._starts.concat([n,t]),this._colors=r,void(this._thicknesses=1);this._starts=this._starts.concat([n,t,t,n]),this._ends=this._ends.concat([t,n,n,t]),this._sides=this._sides.concat([1,-1,1,-1]),this._colors=this._colors.concat([r,r,r,r]),this._thicknesses=this._thicknesses.concat([a,a,a,a]);var d=this._starts.length-4;this._indices=this._indices.concat([d,d+1,d+2,d+2,d+3,d])}},{key:"addLines",value:function(e,n,t){for(var i=0;i<e.length;i+=2){var r=e[i],a=e[i+1];this.addLine(r,a,n,t)}}},{key:"addPolyline",value:function(e,n,t){var i=e.length;if(!(i<2))for(var r=0;r<i-1;r++)this.addLine(e[r],e[r+1],n,t)}},{key:"createThreeObject",value:function(){var e=l(this),n=p(this);return this._canBeLineSegments?new i["x"](e,n):new i["F"](e,n)}}]),e}(),f=h;function v(e,n){var t=r["a"].getRhino3dm(),i=n,a=[];if(e instanceof t.LineCurve)return[e.pointAtStart,e.pointAtEnd];if(e instanceof t.PolylineCurve){i=e.pointCount;for(var o=0;o<i;o++)a.push(e.point(o));return a}if(e instanceof t.PolyCurve){for(var s=e.segmentCount,c=0;c<s;c++){var l=e.segmentCurve(c),d=v(l);a=a.concat(d),l.delete()}return a}e instanceof t.NurbsCurve&&1===e.degree&&console.info("degree 1 curve");for(var u=e.domain,p=i-1,h=0;h<i;h++){var f=u[0]+h/p*(u[1]-u[0]);a.push(e.pointAt(f))}return a}function y(e,n){var t=e.materials(),i=t.findFromAttributes(n),r=i.id;return i.delete(),t.delete(),r}var _={createGrid:function(){for(var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:70,t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:5,r=-n*e,a=r,o=n*e,s=o,c=new i["v"],l=[],d=[],u=-n;u<=n;u++){var p=u*e,h=u*e;0!==u?u%t===0?(d.push(new i["db"](p,a,0)),d.push(new i["db"](p,s,0)),d.push(new i["db"](r,h,0)),d.push(new i["db"](o,h,0))):(l.push(new i["db"](p,a,0)),l.push(new i["db"](p,s,0)),l.push(new i["db"](r,h,0)),l.push(new i["db"](o,h,0))):(d.push(new i["db"](0,a,0)),d.push(new i["db"](0,0,0)),d.push(new i["db"](r,0,0)),d.push(new i["db"](0,0,0)))}c.add(f.createThreeObjectFromLines(l,new i["h"](147/255,.6,160/255),1,!1)),c.add(f.createThreeObjectFromLines(d,new i["h"](129/255,134/255,140/255),1,!1));var v=new f(!1);return v.addLine(new i["db"](0,0,0),new i["db"](o,0,0),new i["h"](150/255,75/255,75/255),2),v.addLine(new i["db"](0,0,0),new i["db"](0,s,0),new i["h"](75/255,150/255,75/255),2),c.add(v.createThreeObject()),c},meshWiresToThreejs:function(e,n){for(var t=e.topologyEdges(),r=t.count,a=new Float32Array(2*r*3),o=0;o<r;o++){var s=t.edgeLine(o);a[6*o]=s.from[0],a[6*o+1]=s.from[1],a[6*o+2]=s.from[2],a[6*o+3]=s.to[0],a[6*o+4]=s.to[1],a[6*o+5]=s.to[2]}t.delete();var c=new i["d"];c.setAttribute("position",new i["c"](a,3));var l=new i["h"](n.r/255,n.g/255,n.b/255),d=new i["w"]({color:l}),u=new i["x"](c,d);return u.userData["surfaceWires"]=!0,u},meshToThreejs:function(e,n,t){var a=e.textureCoordinates();if(0===a.count){var o=r["a"].getRhino3dm(),s=new o.Sphere([0,0,0],1e3),c=o.TextureMapping.createSphereMapping(s);e.setTextureCoordinates(c,null,!1)}a.delete();var l=new i["e"],d=l.parse(e.toThreejsJSON()),u=new i["h"](n.r/255,n.g/255,n.b/255);0===n.r&&0===n.g&&0===n.b&&(u.r=1,u.g=1,u.b=1);var p=new i["H"]({color:u,side:i["n"]}),h=new i["F"](d,p);return h.userData["diffuse"]=u,h.userData["materialId"]=t,h},createThreeGeometry:function(e,n,t){var a=this,o=r["a"].getRhino3dm(),s=[],c=n.drawColor(t),l=e.objectType;switch(l){case o.ObjectType.Point:var d=new i["R"]({color:c}),u=new i["u"],p=e.location;u.vertices.push(new i["db"](p[0],p[1],p[2])),s.push([new i["Q"](u,d),e.getBoundingBox()]);break;case o.ObjectType.PointSet:for(var h=new i["R"]({color:c}),_=new i["u"],g=e.count,b=0;b<g;b++){var w=e.pointAt(b);_.vertices.push(new i["db"](w[0],w[1],w[2]))}s.push([new i["Q"](_,h),e.getBoundingBox()]);break;case o.ObjectType.Curve:var m=v(e,32),x=new f(!0),T=new i["h"](c.r/255,c.g/255,c.b/255);x.addPolyline(m,T,1.5),s.push([x.createThreeObject(),e.getBoundingBox()]);break;case o.ObjectType.Surface:console.warn("TODO: Implement surface");break;case o.ObjectType.Brep:for(var O=y(t,n),M=e.faces(),k=0;k<M.count;k++){var j=M.get(k),S=j.getMesh(o.MeshType.Any);if(S){var P=this.meshToThreejs(S,c,O);s.push([P,S.getBoundingBox()]),S.delete()}j.delete()}M.delete();var B=new i["v"];B.userData["surfaceWires"]=!0;for(var C=e.edges(),L=0;L<C.count;L++){var A=C.get(L),D=v(A,32),F=new f(!0),z=new i["h"](c.r/255,c.g/255,c.b/255);F.addPolyline(D,z,1.5),B.add(F.createThreeObject())}s.push([B,e.getBoundingBox()]);break;case o.ObjectType.Mesh:var q=y(t,n),I=this.meshToThreejs(e,c,q);s.push([I,e.getBoundingBox()]);var R=this.meshWiresToThreejs(e,c);s.push([R,e.getBoundingBox()]);break;case o.ObjectType.Light:console.warn("TODO: Implement light");break;case o.ObjectType.Annotation:console.warn("TODO: Implement annotation");break;case o.ObjectType.InstanceReference:var E=e.parentIdefId,W=e.xform.toFloatArray(!0),G=new i["v"],N=new i["E"];N.set(W[0],W[1],W[2],W[3],W[4],W[5],W[6],W[7],W[8],W[9],W[10],W[11],W[12],W[13],W[14],W[15]),G.applyMatrix(N),s.push([G,null]);var Q=t.instanceDefinitions(),V=t.objects(),Z=Q.findId(E),H=Z.getObjectIds();H.forEach((function(e){var n=V.findId(e),i=n.geometry(),r=n.attributes(),o=a.createThreeGeometry(i,r,t);o.forEach((function(e){G.add(e[0])}))})),V.delete(),Q.delete();break;case o.ObjectType.TextDot:console.log("TODO: Implement dots");break;case o.ObjectType.Hatch:console.warn("TODO: Implement hatch");break;case o.ObjectType.SubD:console.warn("TODO: Implement SubD");break;case o.ObjectType.ClipPlane:console.warn("TODO: Implement clipplane");break;case o.ObjectType.Extrusion:var J=e.getMesh(o.MeshType.Any);if(J){var X=y(t,n),$=this.meshToThreejs(J,c,X);s.push([$,J.getBoundingBox()]),J.delete()}break;default:break}return s},createThreeMaterial:function(e,n){var t=null,a=r["a"].getRhino3dm(),o=new i["Z"],s=e.physicallyBased();if(s.supported){var c=[a.TextureType.PBR_BaseColor,a.TextureType.PBR_Metallic,a.TextureType.PBR_Roughness];c.forEach((function(r){var s=e.getTexture(r);if(s){var c=n.getEmbeddedFileAsBase64(s.fileName);c&&(t||(t=new i["I"]),r===a.TextureType.PBR_BaseColor&&(t.map=o.load("data:image/png;base64,"+c)),r===a.TextureType.PBR_Metallic&&(t.metalnessMap=o.load("data:image/png;base64,"+c)),r===a.TextureType.PBR_Roughness&&(t.roughnessMap=o.load("data:image/png;base64,"+c))),s.delete()}}))}if(t){var l=new i["i"];l.setPath("statics/cubemaps/skyboxsun25deg/");var d=l.load(["px.jpg","nx.jpg","py.jpg","ny.jpg","pz.jpg","nz.jpg"]);t.envMap=d,t.metalness=s.metallic,t.roughness=s.roughness,t.normalScale.x=1,t.normalScale.y=1}return s.delete(),t},viewportSize:new i["cb"](0,0)},g=n["a"]=_},"1bee":function(e,n,t){"use strict";t("28a5"),t("aef6"),t("7f7f");var i=t("5a89"),r=t("5a15"),a={readFile:function(e,n){var t=T.getRhino3dm(),i=new r["a"],a=i.parse(n),o=new t.File3dm,s=new t.Layer;s.name="Default",o.layers().add(s);var c=new t.ObjectAttributes;return c.layersIndex=0,a.children.forEach((function(e){if("Mesh"===e.type){var n=t.Mesh.createFromThreejsJSON(e.geometry.toJSON());e.material.color?(c.colorSource=t.ObjectColorSource.ColorFromObject,c.objectColor={r:255*e.material.color.r,g:255*e.material.color.g,b:255*e.material.color.b,a:255}):c.colorSource=t.ObjectColorSource.ColorFromLayer,o.objects().addMesh(n,c)}})),o}},o=a,s={readFile:function(e,n){var t=T.getRhino3dm(),i=t.DracoCompression.decompressByteArray(n),r=new t.File3dm,a=new t.Layer;a.name="Default",r.layers().add(a);var o=new t.ObjectAttributes;o.layersIndex=0,r.objects().addMesh(i,o),T.setActiveDoc(e,r)}},c=s,l=t("21cb"),d={readFile:function(e,n){var t=T.getRhino3dm(),i=new l["a"],r=i.parse(n),a=new t.File3dm,o=new t.Layer;o.name="Default",a.layers().add(o);var s=new t.ObjectAttributes;s.layersIndex=0;var c=t.Mesh.createFromThreejsJSON(r.toJSON());return a.objects().addMesh(c,s),a}},u=d,p=t("17c8"),h=t("cbaf"),f=null,v=null,y=[],_=[],g={docExists:!1,filename:"rview WIP",expanded:["Layers"],layers:[],perspectiveCamera:!0,onChangeCamera:function(){},currentMaterialStyle:"Basic",materialOptions:["Basic","PBR: Carbon Fiber","PBR: Chipped Paint Metal","PBR: Scuffed Plastic","PBR: Streaked Metal"],displayMode:null},b={rhinoDoc:null,three:{background:null,middleground:null,setBackground:null},threeObjectsOnLayer:{},threeGrid:null,cameraLight:null,displayModes:null};function w(e,n,t){n.forEach((function(n){e.layers.hasOwnProperty(n)||(e.layers[n]={visible:!0,layers:{}}),e=e.layers[n]})),e.visible=t.visible}function m(e){var n=[],t=Object.getOwnPropertyNames(e.layers);return t.forEach((function(t){var i={label:t,visible:e.layers[t].visible},r=m(e.layers[t]);r.length>0&&(i.children=r),n.push(i)})),n}var x={init:function(e,n,t){var i=this;if(b.displayModes=h["a"].defaultModes(),this.setActiveDisplayMode("Shaded",!1),null==f){var r=e();console.log("start loading rhino3dm"),n(),r.then((function(e){if(f=e,t(),console.log("rhino3dm loaded"),null!=v){var n=v[0],r=v[1];v=null,i.openFile(n,r)}}))}},getRhino3dm:function(){return f},viewModel:function(){return g},updateVisibility:function(){g.layers.forEach((function(e){var n=b.threeObjectsOnLayer[e.label];null!=n&&n.forEach((function(n){n.visible=e.visible,n.visible&&"Mesh"===n.type&&(n.visible=g.displayMode.showSurfaceMeshes),n.visible&&n.userData["surfaceWires"]&&(n.visible=g.displayMode.showSurfaceWires)}))})),b.threeGrid&&(b.threeGrid.visible=g.displayMode.showGrid)},setActiveDisplayMode:function(e){for(var n=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],t=0;t<b.displayModes.length;t++)if(b.displayModes[t].name===e){g.displayMode=b.displayModes[t];break}this.applyMaterial2("Rendered"===e),n&&this.regen(),_.forEach((function(e){e()}))},updateColors:function(){var e=g.displayMode;b.cameraLight.color=new i["h"](e.lightColor),e.backgroundStyle===h["a"].backgroundModes[0]?b.three.setBackground(b.three.background,e.backgroundColor):e.backgroundStyle===h["a"].backgroundModes[1]?b.three.setBackground(b.three.background,e.backgroundGradientTop,e.backgroundGradientBottom):b.three.setBackground(b.three.background,null,null,e.backgroundStyle)},updateMaterial:function(){},regen:function(){this.updateVisibility(),this.updateColors(),this.updateMaterial()},applyMaterial:function(e){g.layers.forEach((function(n){var t=b.threeObjectsOnLayer[n.label];null!=t&&t.forEach((function(n){if("Mesh"===n.type&&n.userData["diffuse"])if(n.material&&(n.material.dispose(),n.material=null),null==e){var t=n.userData["diffuse"];n.material=new i["H"]({color:t,side:i["n"]}),g.displayMode.transparency&&(n.material.opacity=g.displayMode.transparency,n.material.transparent=!0)}else n.material=e}))}))},applyMaterial2:function(e){g.layers.forEach((function(n){var t=b.threeObjectsOnLayer[n.label];null!=t&&t.forEach((function(n){if("Mesh"===n.type&&n.userData["diffuse"]){if(n.material&&(n.material.dispose(),n.material=null),e){var t=n.userData["materialId"],r=b.rhinoDoc.materials(),a=r.findId(t);n.material=p["a"].createThreeMaterial(a,b.rhinoDoc),a.delete(),r.delete()}if(null==n.material){var o=n.userData["diffuse"];n.material=new i["H"]({color:o,side:i["n"]}),g.displayMode.transparency&&(n.material.opacity=g.displayMode.transparency,n.material.transparent=!0)}}}))}))},openFile:function(e,n){if(null!=f)if(e.endsWith(".obj")){var t=o.readFile(e,n);this.setActiveDoc(e,t)}else if(e.endsWith(".drc"))c.readFile(e,n);else if(e.endsWith(".ply")){var i=u.readFile(e,n);this.setActiveDoc(e,i)}else{var r=f.File3dm.fromByteArray(n);this.setActiveDoc(e,r)}else v=[e,n]},setActiveDoc:function(e,n){if(console.log("setActiveDoc ("+e+")"),b.rhinoDoc&&b.rhinoDoc.delete(),this.disposeMiddleground(),b.threeObjectsOnLayer={},b.rhinoDoc=n,g.docExists=null!=n,g.filename=e,g.layers.length=0,n){for(var t=n.layers(),i=t.count(),r={layers:{},visible:!0},a=0;a<i;a++){var o=t.get(a),s=o.fullPath,c=s.split("::");w(r,c,o),o.delete()}g.layers=m(r),t.delete()}y.forEach((function(e){e()})),this.regen()},getActiveModel:function(){return b},addActiveDocChangedEventWatcher:function(e){y.push(e)},addDisplayModeChangedEventWatcher:function(e){_.push(e)},disposeMiddleground:function(){b.three.middleground&&(b.three.middleground.dispose(),b.three.middleground=null)},visibleObjectsBoundingBox:function(){var e=null;return g.layers.forEach((function(n){if(n.visible){var t=b.threeObjectsOnLayer[n.label];null!=t&&t.forEach((function(n){null!=n.boundingBox&&(null==e?e=n.boundingBox.clone():e.union(n.boundingBox))}))}})),e}},T=n["a"]=x},"2f39":function(e,n,t){"use strict";t.r(n);var i=t("967e"),r=t.n(i),a=(t("96cf"),t("fa84")),o=t.n(a),s=(t("7d6e"),t("e54f"),t("985d"),t("0047"),t("2b0e")),c=t("1f91"),l=t("42d2"),d=t("b05d"),u=t("f508");s["a"].use(d["a"],{config:{loading:{}},lang:c["a"],iconSet:l["a"],plugins:{Loading:u["a"]}});var p=function(){var e=this,n=e.$createElement,t=e._self._c||n;return t("div",{attrs:{id:"q-app"}},[t("router-view")],1)},h=[],f=t("1bee"),v={name:"App",mounted:function(){f["a"].init(window.rhino3dm,this.showLoading,this.hideLoading)},methods:{showLoading:function(){this.$q.loading.show()},hideLoading:function(){this.$q.loading.hide()}}},y=v,_=t("2877"),g=Object(_["a"])(y,p,h,!1,null,null,null),b=g.exports,w=t("8c4f"),m=[{path:"/",component:function(){return Promise.all([t.e(0),t.e(5)]).then(t.bind(null,"713b"))},children:[{path:"",component:function(){return Promise.all([t.e(0),t.e(1)]).then(t.bind(null,"8b24"))}},{path:"/view",component:function(){return Promise.all([t.e(0),t.e(1)]).then(t.bind(null,"8b24"))},props:function(e){return{query:e.query.q}}}]}];m.push({path:"*",component:function(){return Promise.all([t.e(0),t.e(4)]).then(t.bind(null,"e51e"))}});var x=m;s["a"].use(w["a"]);var T=function(){var e=new w["a"]({scrollBehavior:function(){return{x:0,y:0}},routes:x,mode:"hash",base:""});return e},O=function(){return M.apply(this,arguments)};function M(){return M=o()(r.a.mark((function e(){var n,t;return r.a.wrap((function(e){while(1)switch(e.prev=e.next){case 0:if("function"!==typeof T){e.next=6;break}return e.next=3,T({Vue:s["a"]});case 3:e.t0=e.sent,e.next=7;break;case 6:e.t0=T;case 7:return n=e.t0,t={el:"#q-app",router:n,render:function(e){return e(b)}},e.abrupt("return",{app:t,router:n});case 10:case"end":return e.stop()}}),e)}))),M.apply(this,arguments)}function k(){return j.apply(this,arguments)}function j(){return j=o()(r.a.mark((function e(){var n,t;return r.a.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.next=2,O();case 2:n=e.sent,t=n.app,n.router,new s["a"](t);case 6:case"end":return e.stop()}}),e)}))),j.apply(this,arguments)}k()},cbaf:function(e,n,t){"use strict";t("7f7f");var i=t("fc74"),r=t.n(i);function a(){var e=new d("Wireframe");return e.showSurfaceMeshes=!1,e}function o(){var e=new d("Shaded");return e}function s(){var e=new d("Ghosted");return e.transparency=.5,e}function c(){var e=new d("Rendered");return e.showGrid=!1,e.showSurfaceWires=!1,e}function l(){var e=new d("Arctic");return e.showGrid=!1,e.backgroundColor="rgb(250,250,250)",e.showSurfaceWires=!1,e}var d=function e(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;r()(this,e),this.name=n,this.showGrid=!0,this.backgroundStyle="Single Color",this.backgroundColor="rgb(157,163,170)",this.backgroundGradientTop="rgb(54,109,168)",this.backgroundGradientBottom="rgb(165,165,165)",this.lightColor="rgb(240,240,240)",this.showSurfaceWires=!0,this.showSurfaceMeshes=!0,this.defaultModes=function(){var e=[];return e.push(a()),e.push(o()),e.push(s()),e.push(c()),e.push(l()),e}},u={defaultModes:function(){return(new d).defaultModes()},backgroundModes:["Single Color","2 Color Gradient"]};n["a"]=u}},[[0,3,0]]]);