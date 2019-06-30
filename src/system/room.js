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

    this.penguins.push(penguin)

    this.sendXt('ap', penguin.buildString())

    if (this.id > 1000) {
      penguin.sendXt('jp', this.id)
    }

    this.penguins.length > 0 ? penguin.sendXt('jr', this.id, this.buildString()) : penguin.sendXt('jr', this.id)
  }

  /**
   * Build the room string
   * @returns {String}
   */
  buildString() {
    let str = ''

    for (let i = 0; i < this.penguins.length; i++) {
      str += `%${this.penguins[i].buildString()}`
    }

    return str.substr(1)
  }

  /**
   * Send raw data to the sockets
   * @param {String} data
   */
  send(data) {
    for (let i = 0; i < this.penguins.length; i++) {
      this.penguins.length === 1 ? this.penguins[i].send(data, true) : this.penguins[i].send(data, i === 0)
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
    const idx = this.penguins.indexOf(penguin)

    if (idx > -1) {
      this.penguins.splice(idx, 1)

      this.sendXt('rp', penguin.id)
    }
  }
}
