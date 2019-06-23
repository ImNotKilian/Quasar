'use strict'

/**
 * Class handlers
 * @constant
 */
const classHandlers = {}

/**
 * Xt packets
 * @constant
 */
const xtHandlers = {}

/**
 * Xml packets
 * @constant
 */
const xmlHandlers = {}

/**
 * @exports
 * @class
 * @static
 */
module.exports = class Network {
  /**
   * Load the handlers
   * @param {Function} callback
   */
  static async loadHandlers(callback) {
    const dir = `${process.cwd()}\\src\\handlers\\`

    try {
      if (process.argv[2].toUpperCase() === 'LOGIN') {
        classHandlers['xml'] = require(`${dir}xml.js`)
      } else {
        const readdirAsync = require('util').promisify(require('fs').readdir)
        const handlers = await readdirAsync(dir)

        for (let i = 0; i < handlers.length; i++) {
          classHandlers[handlers[i].split('.')[0]] = require(`${dir}${handlers[i]}`)
        }
      }
    } catch (err) {
      logger.error(`An error has occurred whilst reading handlers: ${err.message}`)
      process.kill(process.pid)
    } finally {
      callback(Object.keys(classHandlers).length)
    }
  }
}
