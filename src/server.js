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
     * Leaky bucket
     * @type {Object}
     */
    this.bucket = {}
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
      this.extensionManager = new (require('./managers/extensionManager'))
    }
    /**
     * Start a new server
     */
    network.loadHandlers((len) => {
      if (serverType === 'WORLD') {
        this.extensionManager.loadExtensions((extLen, patchLen, bannedIPLen) => {
          logger.info(`Quasar has loaded ${len} handlers`)
          logger.info(`Quasar has loaded ${extLen} extensions`)
          logger.info(`Quasar has loaded ${patchLen} patched items`)
          logger.info(`Quasar has loaded ${bannedIPLen} banned IPs`)
        })
      } else {
        logger.info(`Quasar has loaded ${len} handlers`)
      }

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

      if (serverType === 'WORLD' && this.extensionManager.isBannedIP(socket.remoteAddress.split(':').pop())) {
        socket.end()
        socket.destroy()
        return
      }

      const penguin = new Penguin(this, socket)
      logger.info('A penguino connected')

      if (config.BUCKET.ENABLED) {
        this.bucket[socket] = { packets: config.BUCKET.MAX_PACKETS_ALLOWED, time: Date.now() / 1000 | 0 }
      }

      socket.on('data', (data) => {
        if (!config.BUCKET.ENABLED) {
          network.handleData(data, penguin)
        } else {
          if (this.getRemainingPackets(penguin.socket) >= config.BUCKET.CONSUME_RATE) {
            this.bucket[penguin.socket].packets -= config.BUCKET.CONSUME_RATE

            network.handleData(data, penguin)
          } else {
            penguin.disconnect()
          }
        }
      })
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

    if (this.idsByUsername[penguin.id]) delete this.idsByUsername[penguin.id]
    if (this.usernamesById[penguin.username]) delete this.usernamesById[penguin.username]
    if (this.bucket[penguin.socket]) delete this.bucket[penguin.socket]

    penguin.socket.end()
    penguin.socket.destroy()
  }

  /**
   * Retrieve how many packets the penguin can send
   * @param {net.Socket} socket
   * @returns {Number}
   */
  getRemainingPackets(socket) {
    const time = Date.now() / 1000 | 0

    if (this.bucket[socket] && this.bucket[socket].packets < config.BUCKET.MAX_PACKETS_ALLOWED) {
      const interval = config.BUCKET.FILL_RATE * (time - this.bucket[socket].time)

      this.bucket[socket].packets = Math.min(config.BUCKET.MAX_PACKETS_ALLOWED, this.bucket[socket].packets + interval)
    }

    this.bucket[socket].time = time

    return this.bucket[socket].packets
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
