(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[1],{"8b24":function(e,t,n){"use strict";n.r(t);var r=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("q-page",{staticClass:"flex flex-center",attrs:{id:"canvasParent"}},[e.viewmodel.docExists?e._e():n("q-card",{attrs:{flat:""}},[n("q-img",{attrs:{alt:"rview",src:"statics/logo.png"}}),n("q-card-section",[n("div",{staticClass:"text-h6"},[e._v("rview WIP")])])],1),e.viewmodel.docExists?n("q-page-sticky",{attrs:{position:"bottom-left",offset:[10,10]}},[n("q-fab",{attrs:{color:"primary",icon:"keyboard_arrow_up",direction:"up"}},[n("q-fab-action",{attrs:{color:e.panMode?"secondary":"primary",icon:"pan_tool"},on:{click:function(t){return e.togglePan()}}},[n("q-tooltip",{attrs:{"transition-show":"flip-right","transition-hide":"flip-left"}},[e._v("\n          Pan\n        ")])],1),n("q-fab-action",{attrs:{color:"primary",icon:"zoom_out_map"},on:{click:function(t){return e.zoomExtents()}}},[n("q-tooltip",{attrs:{"transition-show":"flip-right","transition-hide":"flip-left"}},[e._v("\n          Zoom Extents\n        ")])],1),e.viewmodel.perspectiveCamera?n("q-fab-action",{attrs:{color:"primary",icon:"img:statics/icons/3D.svg"},on:{click:function(t){return e.setProjection(!1)}}}):e._e(),e.viewmodel.perspectiveCamera?e._e():n("q-fab-action",{attrs:{color:"primary",icon:"img:statics/icons/2D.svg"},on:{click:function(t){return e.setProjection(!0)}}})],1)],1):e._e(),e.panMode?n("q-page-sticky",{attrs:{position:"bottom-right",offset:[10,10]}},[n("q-btn",{attrs:{outline:"",rounded:"",color:"primary",label:"Pan Mode","icon-right":"close"},on:{click:function(t){return e.togglePan()}}})],1):e._e()],1)},o=[],a=n("967e"),i=n.n(a),c=(n("34ef"),n("96cf"),n("fa84")),s=n.n(c),l=(n("28a5"),n("5a89")),u=n("4721"),d=n("1bee");n("63d9");function h(e,t){var n=d["a"].getRhino3dm(),r=t,o=[];if(e instanceof n.LineCurve)return[e.pointAtStart,e.pointAtEnd];if(e instanceof n.PolylineCurve){r=e.pointCount;for(var a=0;a<r;a++)o.push(e.point(a));return o}if(e instanceof n.PolyCurve){for(var i=e.segmentCount,c=0;c<i;c++){var s=e.segmentCurve(c),l=h(s);o=o.concat(l),s.delete()}return o}e instanceof n.NurbsCurve&&1===e.degree&&console.info("degree 1 curve");for(var u=e.domain,p=r-1,m=0;m<r;m++){var f=u[0]+m/p*(u[1]-u[0]);o.push(e.pointAt(f))}return o}var p={createGrid:function(){for(var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:70,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:5,r=-t*e,o=r,a=t*e,i=a,c=new l["j"],s=[],u=[],d=-t;d<=t;d++){var h=d*e,p=d*e;0!==d?d%n===0?(u.push(new l["B"](h,o,0)),u.push(new l["B"](h,i,0)),u.push(new l["B"](r,p,0)),u.push(new l["B"](a,p,0))):(s.push(new l["B"](h,o,0)),s.push(new l["B"](h,i,0)),s.push(new l["B"](r,p,0)),s.push(new l["B"](a,p,0))):(u.push(new l["B"](0,o,0)),u.push(new l["B"](0,0,0)),u.push(new l["B"](r,0,0)),u.push(new l["B"](0,0,0)))}for(var m=new l["l"]({color:1118481,depthTest:!1,depthWrite:!1}),f=new Float32Array(3*u.length),v=0;v<u.length;v++)f[3*v]=u[v].x,f[3*v+1]=u[v].y,f[3*v+2]=u[v].z;var w=new l["c"];w.setAttribute("position",new l["b"](f,3));var g=new l["m"](w,m),b=new l["l"]({color:7829367,depthTest:!1,depthWrite:!1});f=new Float32Array(3*s.length);for(var y=0;y<s.length;y++)f[3*y]=s[y].x,f[3*y+1]=s[y].y,f[3*y+2]=s[y].z;w=new l["c"],w.setAttribute("position",new l["b"](f,3));var T=new l["m"](w,b);c.add(g),c.add(T),f=new Float32Array([0,0,0,a,0,0]),w=new l["c"],w.setAttribute("position",new l["b"](f,3));var x=new l["l"]({color:new l["e"](150/255,75/255,75/255),depthTest:!1,depthWrite:!1});c.add(new l["m"](w,x)),f=new Float32Array([0,0,0,0,i,0]),w=new l["c"],w.setAttribute("position",new l["b"](f,3));var B=new l["l"]({color:new l["e"](75/255,150/255,75/255),depthTest:!1,depthWrite:!1});return c.add(new l["m"](w,B)),c},curveToBufferGeometry:function(e,t){for(var n=h(e,t),r=new l["c"],o=new Float32Array(3*n.length),a=0;a<n.length;a++)o[3*a]=n[a][0],o[3*a+1]=n[a][1],o[3*a+2]=n[a][2];return r.setAttribute("position",new l["b"](o,3)),r},meshToThreejs:function(e,t){var n=new l["d"],r=n.parse(e.toThreejsJSON());0===t.r&&0===t.g&&0===t.b&&(t.r=255,t.g=255,t.b=255);var o=new l["e"](t.r/255,t.g/255,t.b/255),a=new l["q"]({color:o,side:l["g"]});return new l["p"](r,a)},createThreeGeometry:function(e,t,n){var r=this,o=d["a"].getRhino3dm(),a=[],i=e.objectType;switch(i){case o.ObjectType.Point:var c=new l["v"]({color:t}),s=new l["i"],u=e.location;s.vertices.push(new l["B"](u[0],u[1],u[2])),a.push([new l["u"](s,c),e.getBoundingBox()]);break;case o.ObjectType.PointSet:for(var h=new l["v"]({color:t}),p=new l["i"],m=e.count,f=0;f<m;f++){var v=e.pointAt(f);p.vertices.push(new l["B"](v[0],v[1],v[2]))}a.push([new l["u"](p,h),e.getBoundingBox()]);break;case o.ObjectType.Curve:var w=this.curveToBufferGeometry(e,32),g=new l["e"](t.r/255,t.g/255,t.b/255),b=new l["l"]({color:g}),y=new l["k"](w,b);a.push([y,e.getBoundingBox()]);break;case o.ObjectType.Surface:console.warn("TODO: Implement surface");break;case o.ObjectType.Brep:for(var T=e.faces(),x=0;x<T.count;x++){var B=T.get(x),O=B.getMesh(o.MeshType.Any);if(O){var j=this.meshToThreejs(O,t);a.push([j,O.getBoundingBox()]),O.delete()}B.delete()}T.delete();break;case o.ObjectType.Mesh:var A=this.meshToThreejs(e,t);a.push([A,e.getBoundingBox()]);break;case o.ObjectType.Light:console.warn("TODO: Implement light");break;case o.ObjectType.Annotation:console.warn("TODO: Implement annotation");break;case o.ObjectType.InstanceReference:var C=e.parentIdefId,P=e.xform.toFloatArray(!0),E=new l["j"],k=new l["o"];k.set(P[0],P[1],P[2],P[3],P[4],P[5],P[6],P[7],P[8],P[9],P[10],P[11],P[12],P[13],P[14],P[15]),E.applyMatrix(k),a.push([E,null]);var D=n.instanceDefinitions(),M=n.objects(),q=D.findId(C),S=q.getObjectIds();S.forEach((function(e){var t=M.findId(e),o=t.geometry(),a=t.attributes(),i=a.drawColor(n),c=r.createThreeGeometry(o,i,n);c.forEach((function(e){E.add(e[0])}))})),M.delete(),D.delete();break;case o.ObjectType.TextDot:console.warn("TODO: Implement dot");break;case o.ObjectType.Hatch:console.warn("TODO: Implement hatch");break;case o.ObjectType.SubD:console.warn("TODO: Implement SubD");break;case o.ObjectType.ClipPlane:console.warn("TODO: Implement clipplane");break;case o.ObjectType.Extrusion:var z=e.getMesh(o.MeshType.Any);if(z){var I=this.meshToThreejs(z,t);a.push([I,z.getBoundingBox()]),z.delete()}break;default:break}return a}},m=p,f={renderer:null,camera:null,controls:null,initialize:function(){if(null==this.renderer){l["r"].DefaultUp=new l["B"](0,0,1),this.renderer=new l["C"]({antialias:!0}),this.renderer.setPixelRatio(window.devicePixelRatio);var e=document.getElementById("canvasParent");this.renderer.setSize(e.clientWidth,e.clientHeight),e.appendChild(this.renderer.domElement),window.addEventListener("resize",(function(){return v(!0)}),!1),this.camera=new l["t"](30,e.clientWidth/e.clientHeight,1,1e3),this.camera.position.z=40,this.controls=new u["a"](this.camera,this.renderer.domElement),this.controls.screenSpacePanning=!0}},zoomExtents:function(e){var t=d["a"].getRhino3dm(),n=d["a"].visibleObjectsBoundingBox(),r=new t.BoundingBox(n.min.x,n.min.y,n.min.z,n.max.x,n.max.y,n.max.z),o=new t.ViewportInfo;o.isPerspectiveProjection=d["a"].viewModel().perspectiveCamera;var a=new l["A"](0,0);f.renderer.getSize(a),o.screenPort=[0,0,a.x,a.y];var i=0;d["a"].viewModel().perspectiveCamera?o.setCameraLocation([30,-50,15]):i=.05*(r.max[0]-r.min[0]);var c=r.max[0]-r.min[0],s=c*a.y/a.x;if(o.setFrustum(-c/2,c/2,-s/2,s/2,.1,1e3),o.dollyExtents(r,i),r.delete(),e){d["a"].getActiveDoc().threeScene.remove(this.camera);var u=o.getFrustum();u.near>.1&&(u.near=.1),u.far<1e3&&(u.far=1e3),o.setFrustum(u.left,u.right,u.bottom,u.top,u.near,u.far),d["a"].viewModel().perspectiveCamera?this.camera=new l["t"](30,a.x/a.y,1,1e3):(u=o.getFrustum(),this.camera=new l["s"](u.left,u.right,u.top,u.bottom,u.near,u.far),this.camera.up.set(o.cameraUp[0],o.cameraUp[1],o.cameraUp[2])),this.controls.object=this.camera;var h=new l["f"](d["a"].viewModel().lightColor);h.position.set(0,0,1),d["a"].getActiveDoc().cameraLight=h,this.camera.add(h),d["a"].getActiveDoc().threeScene.add(this.camera)}var p=o.cameraLocation;this.camera.position.set(p[0],p[1],p[2]),this.camera.updateProjectionMatrix(),this.controls.target.set(0,0,0),o.delete()}},v=function e(){var t=arguments.length>0&&void 0!==arguments[0]&&arguments[0];if(t){var n=document.getElementById("canvasParent");f.camera.aspect=n.clientWidth/n.clientHeight,f.camera.updateProjectionMatrix(),f.renderer.setSize(n.clientWidth,n.clientHeight)}requestAnimationFrame(e),f.controls.update();var r=d["a"].getActiveDoc();f.renderer.render(r.threeScene,f.camera)};function w(){f.initialize();var e=d["a"].getActiveDoc();e.threeScene&&e.threeScene.dispose(),e.threeScene=new l["x"],e.threeScene.background=new l["e"](.75,.75,.75);var t=m.createGrid();e.threeGrid=t,e.threeScene.add(t)}function g(){console.log("Building Scene"),w();for(var e=d["a"].getActiveDoc(),t=e.rhinoDoc,n=t.objects(),r=function(r){var o=n.get(r);if(null==o)return"continue";var a=o.geometry(),i=o.attributes();if(i.isInstanceDefinitionObject)return"continue";var c=t.layers().get(i.layerIndex),s=c.fullPath.split("::")[0];e.threeObjectsOnLayer[s]||(e.threeObjectsOnLayer[s]=[]);var u=i.drawColor(t),d=m.createThreeGeometry(a,u,t);d.forEach((function(t){var n=t[0],r=t[1];if(r){var o=new l["B"](r.min[0],r.min[1],r.min[2]),a=new l["B"](r.max[0],r.max[1],r.max[2]);n.boundingBox=new l["a"](o,a),r.delete()}e.threeScene.add(n),e.threeObjectsOnLayer[s].push(n)})),o.delete(),a.delete(),i.delete()},o=0;o<n.count;o++)r(o);n.delete(),d["a"].updateVisibility(),f.zoomExtents(!0),v()}var b={data:function(){var e=d["a"].viewModel();return{panMode:!1,viewmodel:e}},props:{url:{type:String,default:""}},created:function(){d["a"].addActiveDocChangedEventWatcher(g),this.viewmodel.onChangeCamera=this.updateCameraProjection},mounted:function(){this.$route.query&&this.$route.query["url"]&&(console.log("MOUNTED with "+this.$route.query["url"]),this.openURL(this.$route.query["url"])),console.log("MOUNTED")},watch:{$route:function(e,t){e.query["url"]&&this.openURL(e.query["url"]),console.log(e.query)}},methods:{openURL:function(e){fetch(e).then(function(){var t=s()(i.a.mark((function t(n){var r,o;return i.a.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return t.next=2,n.arrayBuffer();case 2:r=t.sent,o=new Uint8Array(r),d["a"].setActiveDoc(e,o);case 5:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}())},updateCameraProjection:function(){f.zoomExtents(!0),this.setLeftButtonMode()},zoomExtents:function(){f.zoomExtents(!0)},togglePan:function(){this.panMode=!this.panMode,this.setLeftButtonMode()},setProjection:function(e){this.viewmodel.perspectiveCamera!==e&&(this.viewmodel.perspectiveCamera=e,this.updateCameraProjection(),this.zoomExtents())},setLeftButtonMode:function(){this.panMode||!this.viewmodel.perspectiveCamera?(f.controls.mouseButtons.LEFT=l["n"].PAN,f.controls.touches.ONE=l["z"].PAN):(f.controls.mouseButtons.LEFT=l["n"].ROTATE,f.controls.touches.ONE=l["z"].ROTATE)}}},y=b,T=n("2877"),x=n("eebe"),B=n.n(x),O=n("9989"),j=n("f09f"),A=n("068f"),C=n("a370"),P=n("de5e"),E=n("c294"),k=n("72db"),D=n("05c0"),M=n("9c40"),q=Object(T["a"])(y,r,o,!1,null,null,null);t["default"]=q.exports;B()(q,"components",{QPage:O["a"],QCard:j["a"],QImg:A["a"],QCardSection:C["a"],QPageSticky:P["a"],QFab:E["a"],QFabAction:k["a"],QTooltip:D["a"],QBtn:M["a"]})}}]);