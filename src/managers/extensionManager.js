'use strict'

/**
 * @exports
 * @class
 */
module.exports = class ExtensionManager {
  /**
   * @constructor
   */
  constructor() {
    /**
     * The extensions
     * @type {Object}
     */
    this.extensions = {}
  }

  /**
   * Load the extensions
   * @param {Function} callback
   */
  async loadExtensions(callback) {
    const dir = `${process.cwd()}\\src\\extensions\\`

    try {
      const readdirAsync = require('util').promisify(require('fs').readdir)
      const extensions = await readdirAsync(dir)

      for (let i = 0; i < extensions.length; i++) {
        const extension = extensions[i]
        const file = extension.split('.')[0]

        if (config.EXTENSIONS_ENABLED.indexOf(file) > -1) {
          this.extensions[file] = require(`${dir}${extension}`)
        }
      }
    } catch (err) {
      logger.error(`An error has occurred whilst reading the extensions: ${err.message}`)
      process.kill(process.pid)
    } finally {
      callback(Object.keys(this.extensions).length)
    }
  }

  /**
   * Retrieve an extension
   * @param {String} extension
   * @returns {*}
   */
  getExtension(extension) {
    return this.extensions[extension.toLowerCase()]
  }

  /**
   * Retrieve whether an extension is enabled or not
   * @param {String} extension
   * @returns {Boolean}
   */
  isExtensionEnabled(extension) {
    return config.EXTENSIONS_ENABLED.indexOf(extension) > -1
  }
}