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
     * Store ids by username
     * @type {Object}
     */
    this.idsByUsername = {}
    /**
     * Store usernames by id
     * @type {Object}
     */
    this.usernamesById = {}
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
      if (serverType === 'WORLD') {
        this.extensionManager = new (require('./managers/extensionManager'))

        this.extensionManager.loadExtensions((extLen) => {
          logger.info(`Quasar has loaded ${len} handlers`)
          logger.info(`Quasar has loaded ${extLen} extensions`)

          this.startServer()
        })
      } else {
        logger.info(`Quasar has loaded ${len} handlers`)

        this.startServer()
      }
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

      logger.info('A penguino disconnected')
    }

    if (this.idsByUsername[penguin.id]) {
      delete this.idsByUsername[penguin.id]
    }

    if (this.usernamesById[penguin.username]) {
      delete this.usernamesById[penguin.username]
    }

    penguin.socket.end()
    penguin.socket.destroy()
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
   * Retrieves a penguin by their username
   * @param {String} username
   * @returns {Object}
   */
  getPenguinByUsername(username) {
    return this.getPenguinById(this.usernamesById[username.toLowerCase()])
  }

  /**
   * Retrieves a penguin and decide whether it's a username or id
   * @param {String|Number} param
   * @returns {Object}
   */
  getPenguin(param) {
    return isNaN(param) ? this.getPenguinByUsername(param) : this.getPenguinById(param)
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
