(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[2],{0:function(e,n,t){e.exports=t("2f39")},"0047":function(e,n,t){},"17c8":function(e,n,t){"use strict";t("63d9");var r=t("5a89"),i=null;function o(e,n){var t=n,r=[];if(e instanceof i.LineCurve)return[e.pointAtStart,e.pointAtEnd];if(e instanceof i.PolylineCurve){t=e.pointCount;for(var a=0;a<t;a++)r.push(e.point(a));return r}if(e instanceof i.PolyCurve){for(var l=e.segmentCount,u=0;u<l;u++){var s=e.segmentCurve(u),c=o(s);r=r.concat(c),s.delete()}return r}e instanceof i.NurbsCurve&&1===e.degree&&console.log("degree 1 curve");for(var h=e.domain,f=t-1,d=0;d<t;d++){var p=h[0]+d/f*(h[1]-h[0]);r.push(e.pointAt(p))}return r}var a={init:function(e){i=e},createGrid:function(){for(var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:70,t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:5,i=-n*e,o=i,a=n*e,l=a,u=new r["j"],s=[],c=[],h=-n;h<=n;h++){var f=h*e,d=h*e;0!==h?h%t===0?(c.push(new r["A"](f,o,0)),c.push(new r["A"](f,l,0)),c.push(new r["A"](i,d,0)),c.push(new r["A"](a,d,0))):(s.push(new r["A"](f,o,0)),s.push(new r["A"](f,l,0)),s.push(new r["A"](i,d,0)),s.push(new r["A"](a,d,0))):(c.push(new r["A"](0,o,0)),c.push(new r["A"](0,0,0)),c.push(new r["A"](i,0,0)),c.push(new r["A"](0,0,0)))}for(var p=new r["l"]({color:1118481,depthTest:!1,depthWrite:!1}),v=new Float32Array(3*c.length),w=0;w<c.length;w++)v[3*w]=c[w].x,v[3*w+1]=c[w].y,v[3*w+2]=c[w].z;var b=new r["c"];b.setAttribute("position",new r["b"](v,3));var g=new r["m"](b,p),y=new r["l"]({color:7829367,depthTest:!1,depthWrite:!1});v=new Float32Array(3*s.length);for(var m=0;m<s.length;m++)v[3*m]=s[m].x,v[3*m+1]=s[m].y,v[3*m+2]=s[m].z;b=new r["c"],b.setAttribute("position",new r["b"](v,3));var A=new r["m"](b,y);u.add(g),u.add(A),v=new Float32Array([0,0,0,a,0,0]),b=new r["c"],b.setAttribute("position",new r["b"](v,3));var x=new r["l"]({color:new r["e"](150/255,75/255,75/255),depthTest:!1,depthWrite:!1});u.add(new r["m"](b,x)),v=new Float32Array([0,0,0,0,l,0]),b=new r["c"],b.setAttribute("position",new r["b"](v,3));var C=new r["l"]({color:new r["e"](75/255,150/255,75/255),depthTest:!1,depthWrite:!1});return u.add(new r["m"](b,C)),u},curveToBufferGeometry:function(e){for(var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:21,t=o(e,n),i=new r["c"],a=new Float32Array(3*t.length),l=0;l<t.length;l++)a[3*l]=t[l][0],a[3*l+1]=t[l][1],a[3*l+2]=t[l][2];return i.setAttribute("position",new r["b"](a,3)),i}};n["a"]=a},"1bee":function(e,n,t){"use strict";t("28a5");var r=t("17c8"),i=t("5a89"),o=null,a=null,l=[],u={docExists:!1,filename:"rview WIP",expanded:["Layers"],layers:[],perspectiveCamera:!0,onChangeCamera:function(){},gridVisible:!0,lightColor:"rgb(240,240,240)"},s={rhinoDoc:null,threeScene:null,threeObjectsOnLayer:{},threeGrid:null,cameraLight:null};function c(e,n,t){n.forEach((function(n){e.layers.hasOwnProperty(n)||(e.layers[n]={visible:!0,layers:{}}),e=e.layers[n]})),e.visible=t.visible}function h(e){var n=[],t=Object.getOwnPropertyNames(e.layers);return t.forEach((function(t){var r={label:t,visible:e.layers[t].visible},i=h(e.layers[t]);i.length>0&&(r.children=i),n.push(r)})),n}var f={init:function(e,n,t){var i=this;if(null==o){var l=e();console.log("start loading rhino3dm"),n(),l.then((function(e){if(o=e,r["a"].init(o),t(),console.log("rhino3dm loaded"),null!=a){var n=a[0],l=a[1];a=null,i.setActiveDoc(n,l)}}))}},getRhino3dm:function(){return o},viewModel:function(){return u},updateVisibility:function(){u.layers.forEach((function(e){var n=s.threeObjectsOnLayer[e.label];null!=n&&n.forEach((function(n){n.visible=e.visible}))})),s.threeGrid&&(s.threeGrid.visible=u.gridVisible)},updateColors:function(){s.cameraLight.color=new i["e"](u.lightColor)},setActiveDoc:function(e,n){if(console.log("setActiveDoc ("+e+")"),null!=o){var t=o.File3dm.fromByteArray(n);if(s.rhinoDoc&&s.rhinoDoc.delete(),s.threeScene&&(s.threeScene.dispose(),s.threeScene=null),s.threeObjectsOnLayer={},s.rhinoDoc=t,u.docExists=null!=t,u.filename=e,u.layers.length=0,t){for(var r=t.layers(),i=r.count(),f={layers:{},visible:!0},d=0;d<i;d++){var p=r.get(d),v=p.fullPath,w=v.split("::");c(f,w,p),p.delete()}u.layers=h(f),r.delete()}l.forEach((function(e){e()}))}else a=[e,n]},getActiveDoc:function(){return s},addActiveDocChangedEventWatcher:function(e){l.push(e)},visibleObjectsBoundingBox:function(){var e=null;return u.layers.forEach((function(n){if(n.visible){var t=s.threeObjectsOnLayer[n.label];null!=t&&t.forEach((function(n){null==e?e=n.boundingBox.clone():e.union(n.boundingBox)}))}})),e}};n["a"]=f},"2f39":function(e,n,t){"use strict";t.r(n);var r=t("967e"),i=t.n(r),o=(t("96cf"),t("fa84")),a=t.n(o),l=(t("7d6e"),t("e54f"),t("985d"),t("0047"),t("2b0e")),u=t("1f91"),s=t("42d2"),c=t("b05d"),h=t("f508");l["a"].use(c["a"],{config:{loading:{}},lang:u["a"],iconSet:s["a"],plugins:{Loading:h["a"]}});var f=function(){var e=this,n=e.$createElement,t=e._self._c||n;return t("div",{attrs:{id:"q-app"}},[t("router-view")],1)},d=[],p=t("1bee"),v={name:"App",mounted:function(){p["a"].init(window.rhino3dm,this.showLoading,this.hideLoading)},methods:{showLoading:function(){this.$q.loading.show()},hideLoading:function(){this.$q.loading.hide()}}},w=v,b=t("2877"),g=Object(b["a"])(w,f,d,!1,null,null,null),y=g.exports,m=t("8c4f"),A=[{path:"/",component:function(){return Promise.all([t.e(0),t.e(5)]).then(t.bind(null,"713b"))},children:[{path:"",component:function(){return Promise.all([t.e(0),t.e(1)]).then(t.bind(null,"8b24"))}},{path:"/view",component:function(){return Promise.all([t.e(0),t.e(1)]).then(t.bind(null,"8b24"))},props:function(e){return{query:e.query.q}}}]}];A.push({path:"*",component:function(){return Promise.all([t.e(0),t.e(4)]).then(t.bind(null,"e51e"))}});var x=A;l["a"].use(m["a"]);var C=function(){var e=new m["a"]({scrollBehavior:function(){return{x:0,y:0}},routes:x,mode:"hash",base:""});return e},L=function(){return O.apply(this,arguments)};function O(){return O=a()(i.a.mark((function e(){var n,t;return i.a.wrap((function(e){while(1)switch(e.prev=e.next){case 0:if("function"!==typeof C){e.next=6;break}return e.next=3,C({Vue:l["a"]});case 3:e.t0=e.sent,e.next=7;break;case 6:e.t0=C;case 7:return n=e.t0,t={el:"#q-app",router:n,render:function(e){return e(y)}},e.abrupt("return",{app:t,router:n});case 10:case"end":return e.stop()}}),e)}))),O.apply(this,arguments)}function E(){return P.apply(this,arguments)}function P(){return P=a()(i.a.mark((function e(){var n,t;return i.a.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.next=2,L();case 2:n=e.sent,t=n.app,n.router,new l["a"](t);case 6:case"end":return e.stop()}}),e)}))),P.apply(this,arguments)}E()}},[[0,3,0]]]);