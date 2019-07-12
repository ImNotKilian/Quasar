'use strict'

const { isIP, createServer } = require('net')
const Penguin = require('./penguin')
const network = require('./system/network')

/**
 * @exports
 * @class
 */
module.exports = class Server {
  /**
   * @constructor
   */
  constructor() {
    /**
     * The connected penguins
     * @type {Object}
     */
    this.penguins = {}
    /**
     * The config for the current server
     * @type {Object}
     */
    this.config = config[serverType]
    /**
     * The database class
     * @type {Database}
     */
    this.database = new (require('./system/database'))
    /**
     * The room manager class
     * @type {RoomManager}
     */
    if (serverType === 'WORLD') {
      this.roomManager = new (require('./managers/roomManager'))
    }
    /**
     * Start a new server
     */
    network.loadHandlers((len) => {
      logger.info(`Quasar has loaded ${len} handlers`)
      this.startServer()
    })
  }

  /**
   * Start a new server
   */
  startServer() {
    const { HOST, PORT } = this.config

    if (isIP(HOST) !== 4) {
      logger.error('Quasar has detected an invalid host and will now be killed')
      process.kill(process.pid)
    }

    createServer((socket) => {
      socket.setTimeout(600000)
      socket.setEncoding('utf8')

      const penguin = new Penguin(this, socket)
      logger.info('A penguino connected')

      socket.on('data', (data) => network.handleData(data, penguin))
      socket.on('timeout', () => penguin.sendError(2, true))
      socket.on('close', () => penguin.disconnect())
      socket.on('error', () => penguin.disconnect())
    }).listen(PORT, HOST, () => logger.info(`Quasar listening on ${HOST}:${PORT}`))
  }

  /**
   * Removes a penguin from the server
   * @param {Penguin} penguin
   */
  removePenguin(penguin) {
    if (this.penguins[penguin.id]) {
      delete this.penguins[penguin.id]
    }

    penguin.socket.end()
    penguin.socket.destroy()

    logger.info('A penguino disconnected')
  }

  /**
   * Retrieves a penguin by their id
   * @param {Number} id
   * @returns {Object}
   */
  getPenguinById(id) {
    return this.penguins[parseInt(id)]
  }

  /**
   * Retrieves whether a penguin is online or not
   * @param {Number} id
   * @returns {Boolean}
   */
  isPenguinOnline(id) {
    if (this.penguins[parseInt(id)]) {
      return true
    }

    return false
  }
}
