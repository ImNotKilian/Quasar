'use strict'

/**
 * @exports
 * @class
 */
module.exports = class Penguin {
  /**
   * @constructor
   * @param {Server} server
   * @param {Socket} socket
   */
  constructor(server, socket) {
    /**
     * The server
     * @type {Server}
     */
    this.server = server
    /**
     * The socket
     * @type {Socket}
     */
    this.socket = socket
    /**
     * The xml stage
     * @type {Number}
     */
    this.stage = 0
  }

  /**
   * Set the penguin
   * @param {Object} result
   */
  setPenguin(result) {
    const date = new Date().toISOString().split('T')[0].split('-').join('')

    delete result.password
    delete this.stage

    for (const key in result) {
      this[key] = result[key]
    }

    delete this.created

    this.moderator = Boolean(this.moderator)
    this.age = Number(date - result.created)

    this.x = this.y = 0
    this.frame = 1
  }

  /**
   * Build the penguin string
   * @returns {String}
   */
  buildString() {
    return [
      this.id,
      this.username,
      1,
      this.color,
      this.head,
      this.face,
      this.neck,
      this.body,
      this.hand,
      this.feet,
      this.flag,
      this.photo,
      this.x,
      this.y,
      this.frame,
      1,
      this.rank * 146
    ].join('|')
  }

  /**
  * Send raw data to the socket
  * @param {String} data
  * @param {Boolean} log
  */
  send(data, log = true) {
    if (this.socket && this.socket.writable) {
      if (log) {
        logger.outgoing(data)
      }

      this.socket.write(data + '\0')
    }
  }

  /**
   * Send xt data to the socket
   * @param {Array} args
   */
  sendXt(...args) {
    args.splice(1, 0, -1)

    this.send(`%xt%${args.join('%')}%`)
  }

  /**
   * Send an error to the penguin
   * @param {Number} err
   * @param {Boolean} disconnect
   */
  sendError(err, disconnect = false) {
    this.sendXt('e', err)

    if (disconnect) {
      this.disconnect()
    }
  }

  /**
   * Updates a column
   * @param {Number|String} value
   * @param {String} column
   * @param {Number|String} columnValue
   */
  async updateColumn(value, column, columnValue) {
    const type = isNaN(value) ? 'username' : 'id'

    try {
      await this.server.database.knex('penguins').update(column, columnValue).where(type, value)
    } catch (err) {
      this.disconnect()
    }
  }

  /**
   * Join a random room
   */
  joinRandomRoom() {
    this.server.roomManager.joinRandomRoom(this)
  }

  /**
   * Create a new igloo
   * @param {Number} id
   */
  createIgloo(id) {
    this.server.roomManager.createIgloo(id)
  }

  /**
   * Join a room
   * @param {Room} room
   * @param {Number} x
   * @param {Number} y
   */
  joinRoom(room, x, y) {
    room.addPenguin(this, x, y)
  }

  /**
   * Removes the penguin from the room
   */
  removeFromRoom() {
    if (this.room) {
      this.room.removePenguin(this)
    }
  }

  /**
   * Close the penguin's igloo
   */
  closeIgloo() {
    const iglooId = this.id + 1000

    if (this.server.roomManager.checkIgloo(iglooId)) {
      this.server.roomManager.closeIgloo(iglooId)
    }
  }

  /**
   * Return the room
   * @param {Number} id
   * @returns {Room}
   */
  getRoomById(id) {
    return this.server.roomManager.getRoomById(id)
  }

  /**
   * Return if a room is full or not
   * @param {Number} id
   * @returns {Boolean}
   */
  isRoomFull(id) {
    return this.server.roomManager.isRoomFull(id)
  }

  /**
   * Disconnects the penguin
   */
  disconnect() {
    if (serverType !== 'LOGIN') {
      this.removeFromRoom()
      this.closeIgloo()
    }

    this.server.removePenguin(this)
  }
}
