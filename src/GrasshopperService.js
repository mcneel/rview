/* eslint-disable semi */
const axios = require('axios');

class GrasshopperJob {
  constructor (
    grasshopperFile,
    inputs
    // resourcesFile,
    // resourcesFolder,
    // outputsFileSubpath
  ) {
    this.grasshopperFile = grasshopperFile;
    this.inputs = inputs;
    // this.resourcesFile = resourcesFile;
    // this.resourcesFolder = resourcesFolder;
    // this.outputsFileSubpath = outputsFileSubpath;
  }
}

class GrasshopperJobBlob {
  // blob: Blob;
  // blob_desc: string;
  // blob_filename: string;
  constructor (blob, blobDescription, blobFilename) {
    this.blob = blob;
    this.blob_desc = blobDescription;
    this.blob_filename = blobFilename;
  }
}

class GrasshopperService {
  static serviceUrl = 'http://localhost:8081';

  createFileReaderPromise (f, filename, formKey) {
    let fileReaderPromise = new Promise(resolve => {
      let reader = new FileReader();
      reader.onload = function (evt) {
        const blob = new Blob([reader.result]);
        const ghBlob = new GrasshopperJobBlob(blob, formKey, filename);
        resolve(ghBlob);
      };
      reader.readAsArrayBuffer(f);
    });
    return fileReaderPromise;
  }

  createFormData (job) {
    let promises = [];
    const formData = new FormData();

    // DEBUG
    // console.log('job.grasshopperFile has type: ' + typeof job.grasshopperFile);

    promises.push(
      this.createFileReaderPromise(
        job.grasshopperFile,
        job.grasshopperFile.name,
        'gh_file'
      )
    );

    if (job.inputs) {
      // promises.push(
      //   this.createFileReaderPromise(
      //     job.inputsFile,
      //     job.inputsFile.name,
      //     'inputs_file'
      //   )
      // );
      formData.append(
        'inputs_file',
        new Blob(job.inputs, { type: 'application/json' })
      );
    }

    // if (job.resourcesFile) {
    //   promises.push(
    //     this.createFileReaderPromise(
    //       job.resourcesFile,
    //       job.resourcesFile.name,
    //       "resources_file"
    //     )
    //   );
    // }

    // if (job.jobOutput == JobOutput.File) {
    //   formData.append("outputs_file_subpath", job.outputsFileSubpath);
    // }

    // formData.append("resources_path", job.resourcesFolder);

    return {
      form: formData,
      promises: promises
    };
  }

  getUrl () {
    return GrasshopperService.serviceUrl + '/json';
  }

  async getJson (job) {
    const { form, promises } = this.createFormData(job);
    let formFilled = await Promise.all(promises).then(ghBlobs => {
      for (const ghBlob of ghBlobs) {
        // DEBUG
        console.log(`Setting ${ghBlob.blob_desc} from ${ghBlob.blob_filename}, size is ${ghBlob.blob.size}`);
        console.log(ghBlob.blob);
        form.append(ghBlob.blob_desc, ghBlob.blob, ghBlob.blob_filename);
      }
      return form;
    });

    // return this.http.post<JSON>(this.getUrl(job), formFilled)
    //   .pipe(
    //     catchError(this.handleError)
    //   );

    try {
      return await axios.post(this.getUrl(), formFilled);
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }
      console.log(error.config);
      return null;
    }
  }
}

export { GrasshopperJob, GrasshopperService };
