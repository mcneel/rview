# Setup of environment

## Steps for fresh installation

1. Recommend that `nvs` be used.
2. As of the time of writing, latest Node version is `16.4.0`, so install this via `nvs add 16.4.0`.
3. Activate this version using `nvs use 16.4.0`.
4. To install the project dependencies in `package.json`, need to install MSVC 2017, since a build is necessary[^1]. Otherwise, there'll be errors in trying to build `node-sass`. See [this page](https://github.com/nodejs/node-gyp/blob/master/docs/Common-issues.md)
5. From [here](https://github.com/nodejs/node-gyp/issues/1747), install the MSVC 2017 build environment using `npm install --global --production windows-build-tools --vs2017` in an Admin command-line. This may take a while, and you may need to press Enter to get the terminal to update its output.
6. You must have Python `2.7` installed and its executable must be in your `PATH` variable. Could use Anaconda or download the Windows installer from the official Python web page. _Aside_: this is perhaps installed as part of `windows-build-tools`.
7. Run `npm config set msvs_version 2017` to tell `npm` to use MSVC 2017.
8. Set up the MSVC 2017 build environment by running the batch file `C:\Program Files (x86)\Microsoft Visual Studio\2017\BuildTools\Common7\Tools\VsMSBuildCmd`.
9. Install `yarn` using `npm install --global yarn`, see [here](https://classic.yarnpkg.com/en/docs/install/#windows-stable).
10. Install the project dependencies in `package.json` via `yarn`.
11. Install the Quasar CLI using either `yarn` or `npm`, see [here](https://quasar.dev/quasar-cli/installation).
12. If all goes well, you should be able to `cd` to the project root directory and run `quasar dev`.

[^1]: Subject to change in dependencies listed in `package.json`.