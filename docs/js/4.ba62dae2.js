(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[4],{"713b":function(e,t,i){"use strict";i.r(t);var l=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("q-layout",{attrs:{view:"hHh lpR fFf"}},[i("q-header",{attrs:{elevated:""}},[i("q-toolbar",[i("q-btn",{attrs:{dense:"",flat:!e.fileDrawerVisible,icon:"folder",color:e.fileDrawerVisible?"secondary":""},on:{click:function(t){return e.toggleDrawer(e.drawers.FILE)}}},[i("q-tooltip",[e._v("Files")])],1),i("q-btn",{attrs:{dense:"",flat:!e.layerDrawerVisible,color:e.layerDrawerVisible?"secondary":"",icon:"layers",disable:!e.modelExists},on:{click:function(t){return e.toggleDrawer(e.drawers.LAYER)}}},[i("q-tooltip",[e._v("Layers")])],1),i("q-btn",{attrs:{dense:"",flat:!e.viewDrawerVisible,color:e.viewDrawerVisible?"secondary":"",icon:"aspect_ratio",disable:!e.modelExists},on:{click:function(t){return e.toggleDrawer(e.drawers.VIEW)}}},[i("q-tooltip",[e._v("Display options")])],1),i("q-toolbar-title"),i("div",[e._v(e._s(e.title))])],1)],1),i("q-drawer",{attrs:{bordered:"",overlay:"","content-class":"bg-grey-2"},model:{value:e.fileDrawerVisible,callback:function(t){e.fileDrawerVisible=t},expression:"fileDrawerVisible"}},[i("q-toolbar",{staticClass:"bg-primary text-white shadow-2"},[i("q-toolbar-title",[e._v("Files")]),i("q-btn",{attrs:{flat:"",round:"",dense:"",icon:"arrow_back"},on:{click:function(t){return e.toggleDrawer(e.drawers.FILE)}}})],1),i("q-list",{attrs:{bordered:""}},[i("q-item",[i("q-item-section",[e._v("\n          "+e._s(e.model1Label)+"\n        ")]),e.viewmodel.model1.exists?i("q-item-section",{attrs:{side:""}},[i("q-btn",{attrs:{flat:"",round:"",color:"primary",icon:"o_info",size:"sm"}},[i("q-tooltip",[e._v("Model information")])],1)],1):e._e(),e.viewmodel.model1.exists?i("q-item-section",{attrs:{side:""}},[i("q-btn",{attrs:{flat:"",round:"",color:"primary",icon:"close",size:"sm"},on:{click:function(t){return e.closeModel(!0)}}},[i("q-tooltip",[e._v("Close")])],1)],1):e._e()],1),i("q-item",{attrs:{"inset-level":e.insetLevel}},[i("q-btn-dropdown",{staticClass:"full-width",attrs:{"no-caps":"",label:"Open Sample",icon:"img:logo.png"}},[i("q-list",e._l(e.sampleModels,(function(t){return i("q-item",{directives:[{name:"close-popup",rawName:"v-close-popup"}],key:t,attrs:{clickable:""},on:{click:function(i){return e.openSample(t,!0)}}},[i("q-item-section",[i("q-item-label",[e._v(e._s(t))])],1)],1)})),1)],1)],1),i("q-item",{attrs:{"inset-level":e.insetLevel}},[i("q-btn",{staticClass:"full-width",attrs:{"no-caps":"",label:"Open...",icon:"folder"},on:{click:function(t){return e.openFile(!0)}}})],1)],1),i("q-list",[i("q-item",[i("q-item-section",[e._v("\n          "+e._s(e.model2Label)+"\n        ")]),e.viewmodel.model2.exists?i("q-item-section",{attrs:{side:""}},[i("q-btn",{attrs:{flat:"",round:"",color:"primary",icon:"o_info",size:"sm"}},[i("q-tooltip",[e._v("Model information")])],1)],1):e._e(),e.viewmodel.model2.exists?i("q-item-section",{attrs:{side:""}},[i("q-btn",{attrs:{flat:"",round:"",color:"primary",icon:"close",size:"sm"},on:{click:function(t){return e.closeModel(!1)}}},[i("q-tooltip",[e._v("Close")])],1)],1):e._e()],1),i("q-item",{attrs:{"inset-level":e.insetLevel}},[i("q-btn-dropdown",{staticClass:"full-width",attrs:{"no-caps":"",label:"Open Sample",icon:"img:logo.png"}},[i("q-list",e._l(e.sampleModels,(function(t){return i("q-item",{directives:[{name:"close-popup",rawName:"v-close-popup"}],key:t,attrs:{clickable:""},on:{click:function(i){return e.openSample(t,!1)}}},[i("q-item-section",[i("q-item-label",[e._v(e._s(t))])],1)],1)})),1)],1)],1),i("q-item",{attrs:{"inset-level":e.insetLevel}},[i("q-btn",{staticClass:"full-width",attrs:{"no-caps":"",label:"Open...",icon:"folder"},on:{click:function(t){return e.openFile(!1)}}})],1)],1)],1),i("q-drawer",{attrs:{bordered:"",overlay:"","content-class":"bg-grey-2"},model:{value:e.layerDrawerVisible,callback:function(t){e.layerDrawerVisible=t},expression:"layerDrawerVisible"}},[i("q-list",e._l(e.viewmodel.layers,(function(t){return i("q-expansion-item",{key:t.label,attrs:{clickable:"","expand-icon":t.children?"":"0"},scopedSlots:e._u([{key:"header",fn:function(){return[i("q-item-section",{attrs:{avatar:""}},[i("q-toggle",{on:{input:function(t){return e.updateVisibility()}},model:{value:t.visible,callback:function(i){e.$set(t,"visible",i)},expression:"layer.visible"}})],1),i("q-item-section",[e._v("\n            "+e._s(t.label)+"\n          ")])]},proxy:!0}],null,!0)},[i("q-card",[i("q-card-section",[e._v("\n            Still working on child layer UI\n          ")])],1)],1)})),1)],1),i("q-drawer",{attrs:{bordered:"",overlay:"","content-class":"bg-grey-2"},model:{value:e.viewDrawerVisible,callback:function(t){e.viewDrawerVisible=t},expression:"viewDrawerVisible"}},[i("q-list",{attrs:{bordered:"",dense:""}},[i("q-item",[e.viewmodel.model2Exists?i("q-item-section",[e._v("Model 1")]):i("q-item-section",[e._v("Show")])],1),i("q-item",{attrs:{"inset-level":e.insetLevel}},[i("q-toggle",{attrs:{label:"Wires"},on:{input:function(t){return e.updateVisibility()}},model:{value:e.viewmodel.model1.displayAttrs.wires,callback:function(t){e.$set(e.viewmodel.model1.displayAttrs,"wires",t)},expression:"viewmodel.model1.displayAttrs.wires"}})],1),i("q-item",{attrs:{"inset-level":e.insetLevel}},[i("q-toggle",{attrs:{label:"Shading"},on:{input:function(t){return e.updateVisibility()}},model:{value:e.viewmodel.model1.displayAttrs.shading,callback:function(t){e.$set(e.viewmodel.model1.displayAttrs,"shading",t)},expression:"viewmodel.model1.displayAttrs.shading"}})],1)],1),e.viewmodel.model2Exists?i("q-list",{attrs:{dense:""}},[i("q-item",[i("q-item-section",[e._v("Model 2")])],1),i("q-item",{attrs:{"inset-level":e.insetLevel}},[i("q-toggle",{attrs:{label:"Wires"},on:{input:function(t){return e.updateVisibility()}},model:{value:e.viewmodel.model2.displayAttrs.wires,callback:function(t){e.$set(e.viewmodel.model2.displayAttrs,"wires",t)},expression:"viewmodel.model2.displayAttrs.wires"}})],1),i("q-item",{attrs:{"inset-level":e.insetLevel}},[i("q-toggle",{attrs:{label:"Shading"},on:{input:function(t){return e.updateVisibility()}},model:{value:e.viewmodel.model2.displayAttrs.shading,callback:function(t){e.$set(e.viewmodel.model2.displayAttrs,"shading",t)},expression:"viewmodel.model2.displayAttrs.shading"}})],1)],1):e._e(),i("q-list",{attrs:{dense:"",bordered:""}},[e.viewmodel.model2Exists?i("q-item",[i("q-item-section",[e._v("General")])],1):e._e(),i("q-item",{attrs:{"inset-level":e.insetLevel}},[i("q-item-section",[i("q-toggle",{attrs:{label:"Grid"},model:{value:e.viewmodel.showGrid,callback:function(t){e.$set(e.viewmodel,"showGrid",t)},expression:"viewmodel.showGrid"}})],1),i("q-item-section",{attrs:{avatar:""}},[i("q-icon",{attrs:{name:"grid_on"}})],1)],1),e.viewmodel.model2Exists?i("q-item",{attrs:{"inset-level":e.insetLevel}},[i("q-option-group",{attrs:{options:[{label:"Swipe Compare",value:0},{label:"Blend Compare",value:1}],outlined:""},model:{value:e.viewmodel.compareMode,callback:function(t){e.$set(e.viewmodel,"compareMode",t)},expression:"viewmodel.compareMode"}})],1):e._e()],1)],1),i("q-page-container",[i("router-view")],1)],1)},o=[],s=(i("ace4"),i("e6cf"),i("5cc6"),i("436a")),a=i("cbaf"),r={data(){let e=s["a"].viewModel();return{layerDrawerVisible:!1,fileDrawerVisible:!0,viewDrawerVisible:!1,viewmodel:e,drawers:{FILE:1,LAYER:2,VIEW:3},backgroundModes:a["a"].backgroundModes}},computed:{insetLevel(){return.3},modelExists(){return this.viewmodel.model1.exists||this.viewmodel.model2.exists},model1Label(){return this.viewmodel.model1.exists?"Model 1: "+this.viewmodel.model1.name:"Model 1: (none)"},model2Label(){return this.viewmodel.model2.exists?"Model 2: "+this.viewmodel.model2.name:"Model 2: (none)"},sampleModels(){return["RhinoLogo.3dm","RhinoLogoSubD.3dm","Clip.3dm","Drill.3dm","Ring.3dm","Teacup.3dm","Teapots.3dm"]},title(){let e=s["a"].applicationTitle();return this.viewmodel.model1.name.length>0&&(e=this.viewmodel.model1.name,this.viewmodel.model2.name.length>0&&(e+=" | "+this.viewmodel.model2.name)),e}},methods:{toggleDrawer(e){this.fileDrawerVisible=e===this.drawers.FILE&&!this.fileDrawerVisible,this.layerDrawerVisible=e===this.drawers.LAYER&&!this.layerDrawerVisible,this.viewDrawerVisible=e===this.drawers.VIEW&&!this.viewDrawerVisible},closeModel(e){s["a"].closeModel(e)},openSample(e,t){const i="samples/"+e;fetch(i).then(i=>{let l=i.arrayBuffer();l.then(i=>{s["a"].openFile(e,new Uint8Array(i),t),this.fileDrawerVisible=!1})})},openFile(e){let t=document.createElement("input");const i=this;let l=function(l){let o=l.target.files[0];if(!o)return;let a=new FileReader;a.onload=function(l){var a=l.target.result;const r=s["a"].openFile(o.name,a,e);document.body.removeChild(t),r&&(i.fileDrawerVisible=!1)},o.name.endsWith(".obj")||o.name.endsWith(".ply")?a.readAsText(o):a.readAsArrayBuffer(o)};t.type="file",t.accept=".3dm, .obj, .drc, .ply",t.style.display="none",t.onchange=l,document.body.appendChild(t);let o=document.createEvent("MouseEvents");o.initMouseEvent("click",!0,!1,window,0,0,0,0,0,!1,!1,!1,!1,0,null),t.dispatchEvent(o)},updateVisibility(){s["a"].updateVisibility()}}},n=r,d=i("2877"),c=i("4d5a"),m=i("e359"),p=i("65c6"),u=i("9c40"),w=i("05c0"),v=i("6ac5"),b=i("9404"),q=i("1c1c"),f=i("66e5"),y=i("4074"),h=i("f20b"),g=i("0170"),_=i("3b73"),D=i("9564"),V=i("f09f"),k=i("a370"),x=i("0016"),L=i("9f0a"),E=i("09e3"),M=i("7f67"),A=i("eebe"),Q=i.n(A),C=Object(d["a"])(n,l,o,!1,null,null,null);t["default"]=C.exports;Q()(C,"components",{QLayout:c["a"],QHeader:m["a"],QToolbar:p["a"],QBtn:u["a"],QTooltip:w["a"],QToolbarTitle:v["a"],QDrawer:b["a"],QList:q["a"],QItem:f["a"],QItemSection:y["a"],QBtnDropdown:h["a"],QItemLabel:g["a"],QExpansionItem:_["a"],QToggle:D["a"],QCard:V["a"],QCardSection:k["a"],QIcon:x["a"],QOptionGroup:L["a"],QPageContainer:E["a"]}),Q()(C,"directives",{ClosePopup:M["a"]})}}]);