let privateModule = {}

try {
  privateModule = require('../../../inject/_module')
} catch (e) {
}

// for use inside Vue files through this.$privateModule
// (only in Vue Options API form)
export default ({ app }) => {
  app.config.globalProperties.$privateModule = privateModule
}

// Here we define a named export
// that we can later use inside .js files:
export { privateModule }
