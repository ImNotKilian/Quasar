'use strict'

const { isIP, createServer } = require('net')
const Penguin = require('./penguin')

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
     * The server type
     * @type {String}
     */
    this.type = process.argv[2].toUpperCase()
    /**
     * The config for the current server
     * @type {Object}
     */
    this.config = config[this.type]
    /**
     * The network class
     * @type {Network}
     */
    this.network = require('./system/network')
    /**
     * Start a new server
     */
    this.network.loadHandlers((len) => {
      logger.info(`Quasar finished loading ${len} handlers`)
      this.startServer()
    })
  }

  /**
   * Start a new server
   */
  startServer() {
    const { HOST, PORT, MAX } = this.config

    if (isIP(HOST) !== 4) {
      logger.error('Quasar has detected an invalid host config and will now be killed')
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

      socket.on('data', (data) => {
        data = data.toString().slice(0, -1)

        if (data === '<policy-file-request/>') {
          return penguin.send(`<cross-domain-policy><allow-access-from domain='*' to-ports='*' /></cross-domain-policy>`)
        } else {
          // Todo
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
    const idx = this.penguins.indexOf(penguin)

    if (idx > -1) {
      this.penguins.splice(idx, 1)

      penguin.socket.end()
      penguin.socket.destroy()

      logger.info('A penguino disconnected')
    }
  }
}
