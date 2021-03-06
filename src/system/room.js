'use strict'

/**
 * @exports
 * @class
 */
module.exports = class Room {
  /**
   * @constructor
   * @param {Object} roomObj
   */
  constructor(roomObj) {
    /**
     * Copy the properties
     */
    for (const key in roomObj) {
      this[key] = roomObj[key]
    }
    /**
     * The penguins in the room
     * @type {Object}
     */
    this.penguins = {}
  }

  /**
   * Add a penguin to a room
   * @param {Penguin} penguin
   * @param {Number} x
   * @param {Number} y
   */
  addPenguin(penguin, x, y) {
    penguin.room = this
    penguin.frame = 1
    penguin.x = parseInt(x) || ~~(Math.random() * 200)
    penguin.y = parseInt(y) || ~~(Math.random() * 200)

    this.penguins[penguin.id] = penguin
    this.sendXt('ap', penguin.buildString())

    // An igloo
    if (this.id > 1000) {
      penguin.sendXt('jp', this.id)
    }

    Object.keys(this.penguins).length > 0 ? penguin.sendXt('jr', this.id, this.buildString()) : penguin.sendXt('jr', this.id)

    // Only add the bot when it is enabled and the room is not a game/igloo
    if (penguin.server.extensionManager.isExtensionEnabled('bot') && this.id < 900) {
      penguin.sendXt('ap', penguin.server.extensionManager.getExtension('bot').buildString())
    }
  }

  /**
   * Build the room string
   * @returns {String}
   */
  buildString() {
    let str = ''

    for (const id in this.penguins) {
      str += `%${this.penguins[id].buildString()}`
    }

    return str.substr(1)
  }

  /**
   * Send raw data to the sockets
   * @param {String} data
   */
  send(data) {
    logger.outgoing(data)

    for (const id in this.penguins) {
      this.penguins[id].send(data, false)
    }
  }

  /**
   * Send xt data to the sockets
   * @param {Array} args
   */
  sendXt(...args) {
    args.splice(1, 0, -1)

    this.send(`%xt%${args.join('%')}%`)
  }

  /**
   * Removes a penguin from the room
   * @param {Penguin} penguin
   */
  removePenguin(penguin) {
    if (this.penguins[penguin.id]) {
      delete this.penguins[penguin.id]

      this.sendXt('rp', penguin.id)
    }
  }
}
