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
     * @type {Array<Penguin>}
     */
    this.penguins = []
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
    if (serverType !== 'LOGIN') {
      this.roomManager = new (require('./managers/room'))
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
    const { HOST, PORT, MAX } = this.config

    if (isIP(HOST) !== 4) {
      logger.error('Quasar has detected an invalid host and will now be killed')
      process.kill(process.pid)
    }

    createServer((socket) => {
      socket.setTimeout(600000)
      socket.setEncoding('utf8')

      if (this.penguins.length >= MAX) {
        socket.end()
        socket.destroy()
        return
      }

      const penguin = new Penguin(this, socket)
      this.penguins.push(penguin)
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
    const idx = this.penguins.indexOf(penguin)

    if (idx > -1) {
      this.penguins.splice(idx, 1)

      penguin.socket.end()
      penguin.socket.destroy()

      logger.info('A penguino disconnected')
    }
  }

  /**
   * Retrieves a penguin by their id
   * @param {Number} id
   * @returns {Object}
   */
  getPenguinById(id) {
    for (let i = 0; i < this.penguins.length; i++) {
      const penguin = this.penguins[i]

      if (penguin.id && penguin.id === parseInt(id)) {
        return penguin
      }
    }
  }
}
