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
  async setPenguin(result) {
    const date = new Date().toISOString().split('T')[0].split('-').join('')

    delete result.password
    delete this.stage

    for (const key in result) {
      this[key] = result[key]
    }

    delete this.created

    this.moderator = Boolean(this.moderator)
    this.muted = Boolean(this.muted)
    this.age = Number(date - result.created)

    this.x = this.y = this.coinsDug = 0
    this.frame = 1
    this.requests = []

    this.inventory = await this.server.database.knex('inventory').pluck('itemId').where('id', this.id)
    this.ignored = await this.server.database.knex('ignore').select('ignoreId', 'ignoreUsername').where('id', this.id)
    this.buddies = await this.server.database.knex('buddy').select('buddyId', 'buddyUsername').where('id', this.id)
    this.mail = await this.server.database.knex('mail').select('*').where('recipientId', this.id)

    if (this.ignored.length > 0) this.ignored = this.ignored.reduce((o, i) => (o[i.ignoreId] = i.ignoreUsername, o), {})
    else this.ignored = {}

    if (this.buddies.length > 0) this.buddies = this.buddies.reduce((o, i) => (o[i.buddyId] = i.buddyUsername, o), {})
    else this.buddies = {}

    if (this.mail.length > 0) this.mail = this.mail.reduce((o, i) => (o[i.id] = JSON.parse(JSON.stringify(i)), o), {})
    else this.mail = {}
  }

  /**
   * Update the penguin's outfit
   * @param {String} itemType
   * @param {Number} itemId
   */
  async updateOutfit(itemType, itemId) {
    this[itemType] = itemId
    await this.updateColumn(this.id, itemType, itemId)
  }

  /**
   * Remove coins
   * @param {Number} amount
   */
  async removeCoins(amount) {
    this.coins = Math.min(1000000, Math.max(this.coins - amount, 0))
    await this.updateColumn(this.id, 'coins', this.coins)
  }

  /**
   * Add coins
   * @param {Number} amount
   */
  async addCoins(amount) {
    this.coins = Math.max(0, Math.min(this.coins + amount, 1000000))
    await this.updateColumn(this.id, 'coins', this.coins)
  }

  /**
   * Build the penguin string
   * @returns {String}
   */
  buildString() {
    return [
      this.id,
      this.username,
      1, // Is approved
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
      1, // Is member
      this.rank * 146 // Membership badge
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
    return this.server.roomManager.createIgloo(id)
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
   * Go offline if we have buddies
   */
  async buddyOffline() {
    if (Object.keys(this.buddies).length > 0) {
      for (const buddyId in this.buddies) {
        try {
          const buddyObj = await this.server.getPenguinById(buddyId)

          buddyObj.sendXt('bof', this.id)
        } catch (err) {
          // Do nothing
        }
      }
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
    return new Promise((resolve, reject) => {
      const room = this.server.roomManager.getRoomById(id)

      room ? resolve(room) : reject(undefined)
    })
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
  async disconnect() {
    if (serverType !== 'LOGIN') {
      this.removeFromRoom()
      this.closeIgloo()

      await this.buddyOffline()
      await this.updateColumn(this.id, 'minutesPlayed', this.minutesPlayed)
    }

    this.server.removePenguin(this)
  }
}
