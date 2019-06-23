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
const xtHandlers = {
  's': {
    'j#js': { 'klass': 'navigation', 'func': 'handleJoinServer' }
  }
}

/**
 * Xml packets
 * @constant
 */
const xmlHandlers = {
  'verChk': 'handleVersionCheck',
  'rndK': 'handleRandomKey',
  'login': 'handleLogin'
}

/**
 * @exports
 * @class
 * @static
 */
module.exports = class Network {
  /**
   * Loads the handlers
   * @param {Function} callback
   */
  static async loadHandlers(callback) {
    const dir = `${process.cwd()}\\src\\handlers\\`

    try {
      if (serverType === 'LOGIN') {
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

  /**
   * Parses incoming data
   * @param {String} data
   * @param {Function} callback
   */
  static parseData(data, callback) {
    const firstChar = data.charAt(0)
    const lastChar = data.charAt(data.length - 1)

    if (firstChar === '<' && lastChar === '>') {
      const action = data.split(`='`)[2].split(`'`)[0]

      callback(['xml', action, data])
    } else if (firstChar === '%' && lastChar === '%' && serverType === 'WORLD') {
      const xt = data.split('%')

      xt.shift() // Remove first %
      xt.pop() // Remove last %
      xt.shift() // Remove xt

      const type = xt.shift()
      const handler = xt.shift()

      xt.shift() // Remove -1

      callback(['xt', type, handler, xt])
    } else {
      penguin.disconnect()
    }
  }

  /**
   * Handles parsed data
   * @param {Array} parsed
   * @param {Penguin} penguin
   */
  static handleData(parsed, penguin) {
    const dataType = parsed.shift()

    if (dataType === 'xml') {
      const [action, data] = parsed

      if (!xmlHandlers[action]) {
        return logger.error(`Unknown xml data: ${data}`)
      } else {
        logger.incoming(data)

        classHandlers['xml'][xmlHandlers[action]](data, penguin)
      }
    } else {
      const [type, handler, xt] = parsed
      const data = `${type}%${handler}%${xt.join('%')}`

      if (!xtHandlers[type][handler]) {
        return logger.error(`Unknown xt data: ${data}`)
      } else {
        logger.incoming(data)

        const { klass, func } = xtHandlers[type][handler]

        classHandlers[klass][func](xt, penguin)
      }
    }
  }
}
