(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[4],{f241:function(e,r,t){"use strict";t.r(r);var i=function(){var e=this,r=e.$createElement,t=e._self._c||r;return t("q-layout",{attrs:{view:"hHh lpR fFf"}},[t("q-header",{attrs:{elevated:""}},[t("q-toolbar",[e.fileDrawerVisible?t("q-btn",{attrs:{dense:"",color:"secondary",icon:"folder"},on:{click:function(r){return e.clickFolder()}}}):e._e(),e.fileDrawerVisible?e._e():t("q-btn",{attrs:{dense:"",flat:"",icon:"folder"},on:{click:function(r){return e.clickFolder()}}}),e.layerDrawerVisible?t("q-btn",{attrs:{dense:"",to:"viewer",color:"secondary",icon:"layers"},on:{click:function(r){return e.clickLayers()}}}):e._e(),e.layerDrawerVisible?e._e():t("q-btn",{attrs:{dense:"",flat:"",to:"viewer",icon:"layers"},on:{click:function(r){return e.clickLayers()}}}),t("q-toolbar-title",[e._v("\n        "+e._s(e.viewmodel.filename)+"\n      ")]),t("div",[e._v("rview WIP")]),t("q-btn",{attrs:{flat:"",dense:"",round:"",icon:"keyboard_arrow_up"},on:{click:function(r){e.leftDrawerOpen=!e.leftDrawerOpen}}})],1)],1),t("q-drawer",{attrs:{bordered:"",overlay:"","content-class":"bg-grey-2"},model:{value:e.layerDrawerVisible,callback:function(r){e.layerDrawerVisible=r},expression:"layerDrawerVisible"}},[t("q-tree",{attrs:{nodes:e.viewmodel.layers,expanded:e.viewmodel.expanded,"node-key":"label"},on:{"update:expanded":function(r){return e.$set(e.viewmodel,"expanded",r)}},scopedSlots:e._u([{key:"default-header",fn:function(r){return[t("div",{staticClass:"row items-center"},[t("q-icon",{staticClass:"q-mr-sm",attrs:{name:"visibility",color:"primary"}}),t("div",[e._v(e._s(r.node.label))])],1)]}}])})],1),t("q-drawer",{attrs:{bordered:"",overlay:"","content-class":"bg-grey-2"},model:{value:e.fileDrawerVisible,callback:function(r){e.fileDrawerVisible=r},expression:"fileDrawerVisible"}},[t("q-list",{attrs:{bordered:""}},[t("q-item",{directives:[{name:"ripple",rawName:"v-ripple"}],attrs:{clickable:""},on:{click:function(r){return e.openSample()}}},[t("q-item-section",[e._v("Sample")]),t("q-item-section",{attrs:{avatar:""}},[t("q-icon",{attrs:{name:"img:statics/logo.png"}})],1)],1),t("q-item",{directives:[{name:"ripple",rawName:"v-ripple"}],attrs:{clickable:""},on:{click:function(r){return e.open3dm()}}},[t("q-item-section",[e._v("Open...")]),t("q-item-section",{attrs:{avatar:""}},[t("q-icon",{attrs:{color:"primary",name:"folder"}})],1)],1)],1)],1),t("q-page-container",[t("router-view")],1)],1)},a=[],n=(t("34ef"),t("7f7f"),t("1bee"));function o(e,r,t){console.log("setActiveDoc called"),n["a"].setActiveDoc(e,r),t.push("viewer").catch((function(e){}))}function l(e){var r=document.createEvent("MouseEvents");r.initMouseEvent("click",!0,!1,window,0,0,0,0,0,!1,!1,!1,!1,0,null),e.dispatchEvent(r)}function c(e){var r=document.createElement("input"),t=function(t){var i=t.target.files[0];if(i){var a=i.name,n=new FileReader;n.onload=function(t){var i=t.target.result;r.func(a,i,e),document.body.removeChild(r)},n.readAsArrayBuffer(i)}};r.type="file",r.style.display="none",r.onchange=t,r.func=o,document.body.appendChild(r),l(r)}var s={created:function(){var e=this;n["a"].addActiveDocChangedEventWatcher((function(){e.fileDrawerVisible=!1}))},data:function(){var e=n["a"].viewModel();return{layerDrawerVisible:!1,fileDrawerVisible:!0,viewmodel:e}},methods:{clickLayers:function(){this.fileDrawerVisible=!1,this.layerDrawerVisible=!this.layerDrawerVisible},clickFolder:function(){this.layerDrawerVisible=!1,this.fileDrawerVisible=!this.fileDrawerVisible},openSample:function(){var e=this,r=fetch("statics/hello_mesh.3dm");r.then((function(r){var t=r.arrayBuffer();t.then((function(r){var t=new Uint8Array(r);n["a"].setActiveDoc("RhinoLogo.3dm",t),e.$router.push("viewer").catch((function(e){}))}))}))},open3dm:function(){c(this.$router)}}},d=s,u=t("2877"),f=t("eebe"),v=t.n(f),w=t("4d5a"),p=t("e359"),b=t("65c6"),m=t("9c40"),y=t("6ac5"),h=t("9404"),D=t("7f41"),q=t("0016"),k=t("1c1c"),V=t("66e5"),_=t("4074"),g=t("09e3"),Q=t("714f"),x=Object(u["a"])(d,i,a,!1,null,null,null);r["default"]=x.exports;v()(x,"components",{QLayout:w["a"],QHeader:p["a"],QToolbar:b["a"],QBtn:m["a"],QToolbarTitle:y["a"],QDrawer:h["a"],QTree:D["a"],QIcon:q["a"],QList:k["a"],QItem:V["a"],QItemSection:_["a"],QPageContainer:g["a"]}),v()(x,"directives",{Ripple:Q["a"]})}}]);