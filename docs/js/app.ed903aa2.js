(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[2],{0:function(e,n,t){e.exports=t("2f39")},"0047":function(e,n,t){},"17c8":function(e,n,t){"use strict";t("63d9");var i=t("5a89"),r=t("1bee"),o=t("fc74"),a=t.n(o),s=t("59a1"),c=t.n(s);t("b05c");function l(e){for(var n=new i["d"],t=new Float32Array(3*e._starts.length),r=0;r<e._starts.length;r++)t[3*r]=e._starts[r].x,t[3*r+1]=e._starts[r].y,t[3*r+2]=e._starts[r].z;if(n.setAttribute("position",new i["c"](t,3)),e._canBeLineSegments)return n;for(var o=new Float32Array(3*e._ends.length),a=0;a<e._ends.length;a++)o[3*a]=e._ends[a].x,o[3*a+1]=e._ends[a].y,o[3*a+2]=e._ends[a].z;n.setAttribute("end",new i["c"](o,3));for(var s=new Float32Array(e._thicknesses.length),c=0;c<e._thicknesses.length;c++)s[c]=e._thicknesses[c];n.setAttribute("thickness",new i["c"](s,1));for(var l=new Int8Array(e._sides.length),d=0;d<e._sides.length;d++)l[d]=e._sides[d];n.setAttribute("side",new i["c"](l,1));for(var u=new Float32Array(4*e._colors.length),h=0;h<e._colors.length;h++)u[4*h]=e._colors[h].r,u[4*h+1]=e._colors[h].g,u[4*h+2]=e._colors[h].b,u[4*h+3]=1;return n.setAttribute("color",new i["c"](u,4)),n.setIndex(e._indices),n}function d(e,n){var t="\nvoid main() {\n  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);\n  vec4 clip = projectionMatrix * modelViewPosition;\n#ifdef NO_CLIP_Z\n  clip.z = 0.0;\n#endif\n  gl_Position = clip;\n}\n",r="\nuniform vec3 color;\nvoid main() {\n  gl_FragColor = vec4(color.rgb, 1.0);\n}\n";e&&(t="#define NO_CLIP_Z\n    "+t,r="#define NO_CLIP_Z\n    "+r);var o=new i["X"]({uniforms:{color:{type:"vec3",value:n}},vertexShader:t,fragmentShader:r,depthWrite:!e,depthTest:!e});return o}function u(e){var n="\nuniform vec2 viewport_size;\n\nattribute vec3 end;\nattribute float thickness;\nattribute float side;\nattribute vec4 color;\n\nvarying vec4 fs_color;\n\nvec2 ClipToScreen(in vec4 clip)\n{\n  float x = viewport_size.x * (1.0 + clip.x / clip.w) * 0.5;\n  float y = viewport_size.y * (1.0 + clip.y / clip.w) * 0.5;\n  return vec2(x, y);\n}\n\nvec2 ScreenToClip(in vec2 screen)\n{\n  float x = 2.0 * screen.x / viewport_size.x - 1.0;\n  float y = 2.0 * screen.y / viewport_size.y - 1.0;\n  return vec2(x, y);\n}\n\nvec2 RotatePoint90(in vec2 p, in bool ccw, in vec2 center)\n{\n  float s = ccw ? -1.0 : 1.0;\n  \n  // translate point back to origin:\n  p = p - center;\n  \n  // rotate point\n  float xnew = -p.y * s;\n  float ynew = p.x * s;\n  \n  // translate point back:\n  p.x = xnew + center.x;\n  p.y = ynew + center.y;\n  return p;\n}\n\n// Helper constants and types for 4D homogeneous drawing routines...\nconst int XLO = 1;\nconst int XHI = 2;\nconst int YLO = 4;\nconst int YHI = 8;\nconst int ZLO = 16;\nconst int ZHI = 32;\n\nvec3 ClippingSideFlag(in vec4 q)\n{\n  vec3 side = vec3(0);\n  float w = abs(q.w);\n  if (abs(q.x)>w) side.x = q.x>q.w ? 1.0 : -1.0;\n  if (abs(q.y)>w) side.y = q.y>q.w ? 1.0 : -1.0;\n  if (abs(q.z)>w) side.z = q.z>q.w ? 1.0 : -1.0;\n  return side;\n}\n\nvoid snip(in float px, in float py, in float qx, in float qy, inout float t0, inout float t1)\n{\n  const float small_float = 1e-10;\n\n  float t0_local = 0.0;\n  float t1_local = 1.0;\n\n  // check which side of line P and Q are with respect to x=y\n  // in this case (+) means x-y>0\n  bool positive_p = (px - py) > 0.0;\n  bool positive_q = (qx - qy) > 0.0;\n  if (positive_p != positive_q)\n  {\n    // snip against x=y line\n    // (1-t)P + tQ = R = (c,c)\n    // (1-t)Px + tQx = (1-t)Py +tQy\n    // t = (Px-Py) / (Px-Py-Qx+Qy)\n    float denom = px - py - qx + qy;\n    if (abs(denom) > small_float) {\n      float posxy_t = (px - py) / denom;\n      if (positive_p) //reduce t1\n        t1_local = posxy_t < t1_local ? posxy_t : t1_local;\n      else // increase t0\n        t0_local = posxy_t > t0_local ? posxy_t : t0_local;\n    }\n  }\n  // check which side of line P and Q are with respect to x=-y\n  // in this case (+) means X+y>0\n  positive_p = (px + py) > 0.0;\n  positive_q = (qx + qy) > 0.0;\n  if (positive_p != positive_q) {\n    // snip against x=-y line\n    // (1-t)P + tQ = R = (c,-c)\n    // (1-t)Px + tQx = -((1-t)Py +tQy)\n    // t = (Px+Py) / (Px+Py-Qx-Qy)\n    float denom = px + py - qx - qy;\n    if (abs(denom) > small_float) {\n      float negxy_t = (px + py) / denom;\n      if (positive_p) //reduce t1\n        t1_local = negxy_t < t1_local ? negxy_t : t1_local;\n      else // increase t0\n        t0_local = negxy_t > t0_local ? negxy_t : t0_local;\n    }\n  }\n  if (t0_local >= t1_local)\n    return;\n  if (t0_local > t0)\n    t0 = t0_local;\n  if (t1_local < t1)\n    t1 = t1_local;\n}\n\nvoid SnipToFrustum(in vec4 start, in vec4 end, in vec3 start_side, in vec3 end_side, out float t0, out float t1)\n{\n  t0 = 0.0;\n  t1 = 1.0;\n\n  if( start_side.x != 0.0 || end_side.x != 0.0)\n  {\n    snip(start.w, start.x, end.w, end.x, t0, t1);\n  }\n  if( start_side.y != 0.0 || end_side.y != 0.0)\n  {\n    snip(start.w, start.y, end.w, end.y, t0, t1);\n  }\n  if( start_side.z != 0.0 || end_side.z != 0.0)\n  {\n    snip(start.w, start.z, end.w, end.z, t0, t1);\n  }\n}\nvoid main()\n{\n  fs_color = color;\n\n  vec4 clip_position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n  vec4 clip_next = projectionMatrix * modelViewMatrix * vec4(end, 1.0);\n#ifdef NO_CLIP_Z\n  clip_position.z = 0.0;\n  clip_next.z = 0.0;\n#endif\n  vec3 start_side = ClippingSideFlag(clip_position);\n  vec3 end_side = ClippingSideFlag(clip_next);\n  float t0 = 0.0;\n  float t1 = 1.0;\n  SnipToFrustum(clip_position, clip_next, start_side, end_side, t0, t1);\n  vec3 world_dir = end - position;\n  vec3 clipped_start = position + world_dir * t0;\n  vec3 clipped_end = position + world_dir * t1;\n  clip_position = projectionMatrix * modelViewMatrix * vec4(clipped_start, 1.0);\n  clip_next = projectionMatrix * modelViewMatrix * vec4(clipped_end, 1.0);\n\n\n  vec2 screen0 = ClipToScreen(clip_position);\n  vec2 screen1 = ClipToScreen(clip_next);\n  vec2 dir = screen1 - screen0;\n  dir = normalize(dir);\n  vec2 offset_screen_point = screen0 + (dir * 0.5 * thickness);\n  vec2 screen = RotatePoint90(offset_screen_point, side>0.0, screen0);\n  vec2 s2c = ScreenToClip(screen);\n  clip_position.x = s2c.x*clip_position.w;\n  clip_position.y = s2c.y*clip_position.w;\n#ifdef NO_CLIP_Z\n  clip_position.z = 0.0;\n#endif\n  // clip_position.w = 1.0;\n  gl_Position = clip_position;\n}\n",t="\nvarying vec4 fs_color;\n\nvoid main() {\n  gl_FragColor = fs_color;\n}\n";e&&(n="#define NO_CLIP_Z\n    "+n,t="#define NO_CLIP_Z\n    "+t);var r=new i["X"]({uniforms:{viewport_size:{type:"vec2",value:_.viewportSize}},vertexShader:n,fragmentShader:t,depthWrite:!e,depthTest:!e});return r}function h(e){var n=!e._depthTesting;return e._canBeLineSegments?d(n,e._colors):u(n)}var p=function(){function e(n){a()(this,e),this._canBeLineSegments=!0,this._starts=[],this._ends=[],this._thicknesses=[],this._sides=[],this._colors=[],this._indices=[],this._depthTesting=n}return c()(e,null,[{key:"createThreeObjectFromLines",value:function(n,t,i,r){var o=new e(r);return o.addLines(n,t,i),o.createThreeObject()}}]),c()(e,[{key:"addLine",value:function(n,t,i,r){if(this._canBeLineSegments&&(1!==r||this._colors.length>0&&!this._colors[0].equals(i))){var o=new e;o._canBeLineSegments=!1;for(var a=0;a<this._starts.length;a+=2){var s=this._starts[a],c=this._starts[a+1];o.addLine(s,c,this._colors,this._thicknesses)}this._canBeLineSegments=!1,this._starts=o._starts,this._ends=o._ends,this._thicknesses=o._thicknesses,this._sides=o._sides,this._colors=o._colors,this._indices=o._indices}if(this._canBeLineSegments)return this._starts=this._starts.concat([n,t]),this._colors=i,void(this._thicknesses=1);this._starts=this._starts.concat([n,t,t,n]),this._ends=this._ends.concat([t,n,n,t]),this._sides=this._sides.concat([1,-1,1,-1]),this._colors=this._colors.concat([i,i,i,i]),this._thicknesses=this._thicknesses.concat([r,r,r,r]);var l=this._starts.length-4;this._indices=this._indices.concat([l,l+1,l+2,l+2,l+3,l])}},{key:"addLines",value:function(e,n,t){for(var i=0;i<e.length;i+=2){var r=e[i],o=e[i+1];this.addLine(r,o,n,t)}}},{key:"addPolyline",value:function(e,n,t){var i=e.length;if(!(i<2))for(var r=0;r<i-1;r++)this.addLine(e[r],e[r+1],n,t)}},{key:"createThreeObject",value:function(){var e=l(this),n=h(this);return this._canBeLineSegments?new i["y"](e,n):new i["G"](e,n)}}]),e}(),f=p;function v(e,n){var t=r["a"].getRhino3dm(),i=n,o=[];if(e instanceof t.LineCurve)return[e.pointAtStart,e.pointAtEnd];if(e instanceof t.PolylineCurve){i=e.pointCount;for(var a=0;a<i;a++)o.push(e.point(a));return o}if(e instanceof t.PolyCurve){for(var s=e.segmentCount,c=0;c<s;c++){var l=e.segmentCurve(c),d=v(l);o=o.concat(d),l.delete()}return o}e instanceof t.NurbsCurve&&1===e.degree&&console.info("degree 1 curve");for(var u=e.domain,h=i-1,p=0;p<i;p++){var f=u[0]+p/h*(u[1]-u[0]);o.push(e.pointAt(f))}return o}var y={createGrid:function(){for(var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:70,t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:5,r=-n*e,o=r,a=n*e,s=a,c=new i["v"],l=[],d=[],u=-n;u<=n;u++){var h=u*e,p=u*e;0!==u?u%t===0?(d.push(new i["eb"](h,o,0)),d.push(new i["eb"](h,s,0)),d.push(new i["eb"](r,p,0)),d.push(new i["eb"](a,p,0))):(l.push(new i["eb"](h,o,0)),l.push(new i["eb"](h,s,0)),l.push(new i["eb"](r,p,0)),l.push(new i["eb"](a,p,0))):(d.push(new i["eb"](0,o,0)),d.push(new i["eb"](0,0,0)),d.push(new i["eb"](r,0,0)),d.push(new i["eb"](0,0,0)))}c.add(f.createThreeObjectFromLines(l,new i["h"](147/255,.6,160/255),1,!1)),c.add(f.createThreeObjectFromLines(d,new i["h"](129/255,134/255,140/255),1,!1));var v=new f(!1);return v.addLine(new i["eb"](0,0,0),new i["eb"](a,0,0),new i["h"](150/255,75/255,75/255),2),v.addLine(new i["eb"](0,0,0),new i["eb"](0,s,0),new i["h"](75/255,150/255,75/255),2),c.add(v.createThreeObject()),c},curveToBufferGeometry:function(e,n){for(var t=v(e,n),r=new i["d"],o=new Float32Array(3*t.length),a=0;a<t.length;a++)o[3*a]=t[a][0],o[3*a+1]=t[a][1],o[3*a+2]=t[a][2];return r.setAttribute("position",new i["c"](o,3)),r},meshWiresToThreejs:function(e,n){for(var t=e.topologyEdges(),r=t.count,o=new Float32Array(2*r*3),a=0;a<r;a++){var s=t.edgeLine(a);o[6*a]=s.from[0],o[6*a+1]=s.from[1],o[6*a+2]=s.from[2],o[6*a+3]=s.to[0],o[6*a+4]=s.to[1],o[6*a+5]=s.to[2]}t.delete();var c=new i["d"];c.setAttribute("position",new i["c"](o,3));var l=new i["h"](n.r/255,n.g/255,n.b/255),d=new i["x"]({color:l}),u=new i["y"](c,d);return u.userData["surfaceWires"]=!0,u},meshToThreejs:function(e,n){var t=e.textureCoordinates();if(0===t.count){var o=r["a"].getRhino3dm(),a=new o.Sphere([0,0,0],1e3),s=o.TextureMapping.createSphereMapping(a);e.setTextureCoordinates(s,null,!1)}t.delete();var c=new i["e"],l=c.parse(e.toThreejsJSON()),d=new i["h"](n.r/255,n.g/255,n.b/255);0===n.r&&0===n.g&&0===n.b&&(d.r=1,d.g=1,d.b=1);var u=new i["I"]({color:d,side:i["n"]}),h=new i["G"](l,u);return h.userData["diffuse"]=d,h},createThreeGeometry:function(e,n,t){var o=this,a=r["a"].getRhino3dm(),s=[],c=e.objectType;switch(c){case a.ObjectType.Point:var l=new i["S"]({color:n}),d=new i["u"],u=e.location;d.vertices.push(new i["eb"](u[0],u[1],u[2])),s.push([new i["R"](d,l),e.getBoundingBox()]);break;case a.ObjectType.PointSet:for(var h=new i["S"]({color:n}),p=new i["u"],f=e.count,v=0;v<f;v++){var y=e.pointAt(v);p.vertices.push(new i["eb"](y[0],y[1],y[2]))}s.push([new i["R"](p,h),e.getBoundingBox()]);break;case a.ObjectType.Curve:var _=this.curveToBufferGeometry(e,32),b=new i["h"](n.r/255,n.g/255,n.b/255),g=new i["x"]({color:b}),w=new i["w"](_,g);s.push([w,e.getBoundingBox()]);break;case a.ObjectType.Surface:console.warn("TODO: Implement surface");break;case a.ObjectType.Brep:for(var m=e.faces(),x=0;x<m.count;x++){var O=m.get(x),M=O.getMesh(a.MeshType.Any);if(M){var k=this.meshToThreejs(M,n);s.push([k,M.getBoundingBox()]),M.delete()}O.delete()}m.delete();var T=new i["v"];T.userData["surfaceWires"]=!0;for(var S=e.edges(),j=0;j<S.count;j++){var P=S.get(j),C=this.curveToBufferGeometry(P,32),B=new i["h"](n.r/255,n.g/255,n.b/255),L=new i["x"]({color:B}),A=new i["w"](C,L);T.add(A)}s.push([T,e.getBoundingBox()]);break;case a.ObjectType.Mesh:var D=this.meshToThreejs(e,n);s.push([D,e.getBoundingBox()]);var F=this.meshWiresToThreejs(e,n);s.push([F,e.getBoundingBox()]);break;case a.ObjectType.Light:console.warn("TODO: Implement light");break;case a.ObjectType.Annotation:console.warn("TODO: Implement annotation");break;case a.ObjectType.InstanceReference:var q=e.parentIdefId,I=e.xform.toFloatArray(!0),R=new i["v"],z=new i["F"];z.set(I[0],I[1],I[2],I[3],I[4],I[5],I[6],I[7],I[8],I[9],I[10],I[11],I[12],I[13],I[14],I[15]),R.applyMatrix(z),s.push([R,null]);var E=t.instanceDefinitions(),G=t.objects(),W=E.findId(q),N=W.getObjectIds();N.forEach((function(e){var n=G.findId(e),i=n.geometry(),r=n.attributes(),a=r.drawColor(t),s=o.createThreeGeometry(i,a,t);s.forEach((function(e){R.add(e[0])}))})),G.delete(),E.delete();break;case a.ObjectType.TextDot:console.log("TODO: Implement dots");break;case a.ObjectType.Hatch:console.warn("TODO: Implement hatch");break;case a.ObjectType.SubD:console.warn("TODO: Implement SubD");break;case a.ObjectType.ClipPlane:console.warn("TODO: Implement clipplane");break;case a.ObjectType.Extrusion:var Q=e.getMesh(a.MeshType.Any);if(Q){var V=this.meshToThreejs(Q,n);s.push([V,Q.getBoundingBox()]),Q.delete()}break;default:break}return s},createPBRMaterial:function(e,n){var t=new i["J"];t.metalness=.75,t.roughness=.15,t.normalScale.x=1,t.normalScale.y=1;var r=new i["ab"];r.setPath("statics/materials/PBR/"+e+"/"),t.aoMmap=r.load(e+"_ao.png"),t.normalMap=r.load(e+"_normal.png"),t.metalnessMap=r.load(e+"_metallic.png"),r.load(e+"_base.png",(function(e){t.map=e,n(t)}))},viewportSize:new i["db"](0,0)},_=n["a"]=y},"1bee":function(e,n,t){"use strict";t("28a5"),t("aef6"),t("a481"),t("7f7f");var i=t("5a89"),r=t("5a15"),o={readFile:function(e,n){var t=O.getRhino3dm(),i=new r["a"],o=i.parse(n),a=new t.File3dm,s=new t.Layer;s.name="Default",a.layers().add(s);var c=new t.ObjectAttributes;return c.layersIndex=0,o.children.forEach((function(e){if("Mesh"===e.type){var n=t.Mesh.createFromThreejsJSON(e.geometry.toJSON());e.material.color?(c.colorSource=t.ObjectColorSource.ColorFromObject,c.objectColor={r:255*e.material.color.r,g:255*e.material.color.g,b:255*e.material.color.b,a:255}):c.colorSource=t.ObjectColorSource.ColorFromLayer,a.objects().addMesh(n,c)}})),a}},a=o,s={readFile:function(e,n){var t=O.getRhino3dm(),i=t.DracoCompression.decompressByteArray(n),r=new t.File3dm,o=new t.Layer;o.name="Default",r.layers().add(o);var a=new t.ObjectAttributes;a.layersIndex=0,r.objects().addMesh(i,a),O.setActiveDoc(e,r)}},c=s,l=t("21cb"),d={readFile:function(e,n){var t=O.getRhino3dm(),i=new l["a"],r=i.parse(n),o=new t.File3dm,a=new t.Layer;a.name="Default",o.layers().add(a);var s=new t.ObjectAttributes;s.layersIndex=0;var c=t.Mesh.createFromThreejsJSON(r.toJSON());return o.objects().addMesh(c,s),o}},u=d,h=t("17c8"),p=t("cbaf"),f=null,v=null,y=[],_=[],b={docExists:!1,filename:"rview WIP",expanded:["Layers"],layers:[],perspectiveCamera:!0,onChangeCamera:function(){},currentMaterialStyle:"Basic",materialOptions:["Basic","PBR: Carbon Fiber","PBR: Chipped Paint Metal","PBR: Scuffed Plastic","PBR: Streaked Metal"],displayMode:null},g={rhinoDoc:null,three:{background:null,middleground:null,setBackground:null},threeObjectsOnLayer:{},threeGrid:null,cameraLight:null,displayModes:null};function w(e,n,t){n.forEach((function(n){e.layers.hasOwnProperty(n)||(e.layers[n]={visible:!0,layers:{}}),e=e.layers[n]})),e.visible=t.visible}function m(e){var n=[],t=Object.getOwnPropertyNames(e.layers);return t.forEach((function(t){var i={label:t,visible:e.layers[t].visible},r=m(e.layers[t]);r.length>0&&(i.children=r),n.push(i)})),n}var x={init:function(e,n,t){var i=this;if(g.displayModes=p["a"].defaultModes(),this.setActiveDisplayMode("Shaded",!1),null==f){var r=e();console.log("start loading rhino3dm"),n(),r.then((function(e){if(f=e,t(),console.log("rhino3dm loaded"),null!=v){var n=v[0],r=v[1];v=null,i.openFile(n,r)}}))}},getRhino3dm:function(){return f},viewModel:function(){return b},updateVisibility:function(){b.layers.forEach((function(e){var n=g.threeObjectsOnLayer[e.label];null!=n&&n.forEach((function(n){n.visible=e.visible,n.visible&&"Mesh"===n.type&&(n.visible=b.displayMode.showSurfaceMeshes),n.visible&&n.userData["surfaceWires"]&&(n.visible=b.displayMode.showSurfaceWires)}))})),g.threeGrid&&(g.threeGrid.visible=b.displayMode.showGrid)},setActiveDisplayMode:function(e){for(var n=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],t=0;t<g.displayModes.length;t++)if(g.displayModes[t].name===e){b.displayMode=g.displayModes[t];break}n&&this.regen(),_.forEach((function(e){e()}))},updateColors:function(){var e=b.displayMode;g.cameraLight.color=new i["h"](e.lightColor),e.backgroundStyle===p["a"].backgroundModes[0]?g.three.setBackground(g.three.background,e.backgroundColor):e.backgroundStyle===p["a"].backgroundModes[1]?g.three.setBackground(g.three.background,e.backgroundGradientTop,e.backgroundGradientBottom):g.three.setBackground(g.three.background,null,null,e.backgroundStyle)},updateMaterial:function(){if(b.currentMaterialStyle!==b.materialOptions[0]){var e=b.currentMaterialStyle.substr("PBR: ".length).toLowerCase();e=e.replace(/ /g,"-"),h["a"].createPBRMaterial(e,this.applyMaterial)}else this.applyMaterial(null)},regen:function(){this.updateVisibility(),this.updateColors(),this.updateMaterial()},applyMaterial:function(e){b.layers.forEach((function(n){var t=g.threeObjectsOnLayer[n.label];null!=t&&t.forEach((function(n){if("Mesh"===n.type)if(n.material&&(n.material.dispose(),n.material=null),null==e){var t=n.userData["diffuse"];n.material=new i["I"]({color:t,side:i["n"]}),b.displayMode.transparency&&(n.material.opacity=b.displayMode.transparency,n.material.transparent=!0)}else n.material=e}))}))},openFile:function(e,n){if(null!=f)if(e.endsWith(".obj")){var t=a.readFile(e,n);this.setActiveDoc(e,t)}else if(e.endsWith(".drc"))c.readFile(e,n);else if(e.endsWith(".ply")){var i=u.readFile(e,n);this.setActiveDoc(e,i)}else{var r=f.File3dm.fromByteArray(n);this.setActiveDoc(e,r)}else v=[e,n]},setActiveDoc:function(e,n){if(console.log("setActiveDoc ("+e+")"),g.rhinoDoc&&g.rhinoDoc.delete(),this.disposeMiddleground(),g.threeObjectsOnLayer={},g.rhinoDoc=n,b.docExists=null!=n,b.filename=e,b.layers.length=0,n){for(var t=n.layers(),i=t.count(),r={layers:{},visible:!0},o=0;o<i;o++){var a=t.get(o),s=a.fullPath,c=s.split("::");w(r,c,a),a.delete()}b.layers=m(r),t.delete()}y.forEach((function(e){e()})),this.regen()},getActiveModel:function(){return g},addActiveDocChangedEventWatcher:function(e){y.push(e)},addDisplayModeChangedEventWatcher:function(e){_.push(e)},disposeMiddleground:function(){g.three.middleground&&(g.three.middleground.dispose(),g.three.middleground=null)},visibleObjectsBoundingBox:function(){var e=null;return b.layers.forEach((function(n){if(n.visible){var t=g.threeObjectsOnLayer[n.label];null!=t&&t.forEach((function(n){null!=n.boundingBox&&(null==e?e=n.boundingBox.clone():e.union(n.boundingBox))}))}})),e}},O=n["a"]=x},"2f39":function(e,n,t){"use strict";t.r(n);var i=t("967e"),r=t.n(i),o=(t("96cf"),t("fa84")),a=t.n(o),s=(t("7d6e"),t("e54f"),t("985d"),t("0047"),t("2b0e")),c=t("1f91"),l=t("42d2"),d=t("b05d"),u=t("f508");s["a"].use(d["a"],{config:{loading:{}},lang:c["a"],iconSet:l["a"],plugins:{Loading:u["a"]}});var h=function(){var e=this,n=e.$createElement,t=e._self._c||n;return t("div",{attrs:{id:"q-app"}},[t("router-view")],1)},p=[],f=t("1bee"),v={name:"App",mounted:function(){f["a"].init(window.rhino3dm,this.showLoading,this.hideLoading)},methods:{showLoading:function(){this.$q.loading.show()},hideLoading:function(){this.$q.loading.hide()}}},y=v,_=t("2877"),b=Object(_["a"])(y,h,p,!1,null,null,null),g=b.exports,w=t("8c4f"),m=[{path:"/",component:function(){return Promise.all([t.e(0),t.e(5)]).then(t.bind(null,"713b"))},children:[{path:"",component:function(){return Promise.all([t.e(0),t.e(1)]).then(t.bind(null,"8b24"))}},{path:"/view",component:function(){return Promise.all([t.e(0),t.e(1)]).then(t.bind(null,"8b24"))},props:function(e){return{query:e.query.q}}}]}];m.push({path:"*",component:function(){return Promise.all([t.e(0),t.e(4)]).then(t.bind(null,"e51e"))}});var x=m;s["a"].use(w["a"]);var O=function(){var e=new w["a"]({scrollBehavior:function(){return{x:0,y:0}},routes:x,mode:"hash",base:""});return e},M=function(){return k.apply(this,arguments)};function k(){return k=a()(r.a.mark((function e(){var n,t;return r.a.wrap((function(e){while(1)switch(e.prev=e.next){case 0:if("function"!==typeof O){e.next=6;break}return e.next=3,O({Vue:s["a"]});case 3:e.t0=e.sent,e.next=7;break;case 6:e.t0=O;case 7:return n=e.t0,t={el:"#q-app",router:n,render:function(e){return e(g)}},e.abrupt("return",{app:t,router:n});case 10:case"end":return e.stop()}}),e)}))),k.apply(this,arguments)}function T(){return S.apply(this,arguments)}function S(){return S=a()(r.a.mark((function e(){var n,t;return r.a.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.next=2,M();case 2:n=e.sent,t=n.app,n.router,new s["a"](t);case 6:case"end":return e.stop()}}),e)}))),S.apply(this,arguments)}T()},cbaf:function(e,n,t){"use strict";t("7f7f");var i=t("fc74"),r=t.n(i);function o(){var e=new d("Wireframe");return e.showSurfaceMeshes=!1,e}function a(){var e=new d("Shaded");return e}function s(){var e=new d("Ghosted");return e.transparency=.5,e}function c(){var e=new d("Rendered");return e.showGrid=!1,e.showSurfaceWires=!1,e}function l(){var e=new d("Arctic");return e.showGrid=!1,e.backgroundColor="rgb(250,250,250)",e.showSurfaceWires=!1,e}var d=function e(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;r()(this,e),this.name=n,this.showGrid=!0,this.backgroundStyle="Single Color",this.backgroundColor="rgb(157,163,170)",this.backgroundGradientTop="rgb(54,109,168)",this.backgroundGradientBottom="rgb(165,165,165)",this.lightColor="rgb(240,240,240)",this.showSurfaceWires=!0,this.showSurfaceMeshes=!0,this.defaultModes=function(){var e=[];return e.push(o()),e.push(a()),e.push(s()),e.push(c()),e.push(l()),e}},u={defaultModes:function(){return(new d).defaultModes()},backgroundModes:["Single Color","2 Color Gradient"]};n["a"]=u}},[[0,3,0]]]);