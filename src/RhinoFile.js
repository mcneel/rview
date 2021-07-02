/* eslint-disable semi */
// const rhino3dm = require('rhino3dm')();

class RhinoFile {
  constructor (response) {
    this.response = response;
  }

  get3dm (rhino3dm) {
    let doc = new rhino3dm.File3dm();
    console.log('response is: ', this.response);
    for (let item of this.response.data) {
      let innerTree = item['InnerTree'];
      // eslint-disable-next-line no-unused-vars
      for (const [_, innerItem] of Object.entries(innerTree)) {
        for (const v of innerItem) {
          const obj = JSON.parse(v['data']);
          if (typeof obj === 'object' && 'data' in obj) {
            console.log('adding element: ', obj);
            const geo = rhino3dm.CommonObject.decode(obj);
            doc.objects().add(geo, null);
          }
        }
      }
    }
    // console.log('3dm doc is: ', doc);
    return doc.toByteArray();
  }
}

export default RhinoFile;
