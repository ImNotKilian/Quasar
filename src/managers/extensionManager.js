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
    /**
     * Patched items array
     * @type {Array}
     */
    this.patchedItems = config.PATCHED_ITEMS
  }

  /**
   * Load the extensions
   * @param {Function} callback
   */
  loadExtensions(callback) {
    const dir = `${process.cwd()}\\src\\extensions\\`

    require('util').promisify(require('fs').readdir)(dir).then((extensions) => {
      for (let i = 0; i < extensions.length; i++) {
        const extension = extensions[i]
        const [file, fileType] = extension.split('.')

        if (this.isExtensionEnabled(file) && fileType === 'js') {
          this.extensions[file] = require(`${dir}${extension}`)
        }
      }

      callback(Object.keys(this.extensions).length, this.patchedItems.length)
    }).catch((err) => {
      logger.error(`An error has occurred whilst reading the extensions: ${err.message}`)
      process.kill(process.pid)
    })
  }

  /**
   * Retrieve whether an item is patched or not
   * @param {Number} itemId
   * @returns {Boolean}
   */
  isPatchedItem(itemId) {
    return this.patchedItems.indexOf(parseInt(itemId)) > -1
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
   * Retrieve whether an extension is enabled or not from the config
   * @param {String} extension
   * @returns {Boolean}
   */
  isExtensionEnabled(extension) {
    return config.EXTENSIONS_ENABLED.indexOf(extension) > -1
  }
}
