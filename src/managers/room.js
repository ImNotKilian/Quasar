'use strict'

const Room = require('../system/room')
const rooms = require('../crumbs/rooms')

/**
 * @exports
 * @class
 */
module.exports = class RoomManager {
  /**
   * @constructor
   */
  constructor() {
    /**
     * The rooms
     * @type {Object<Room>}
     */
    this.rooms = {}
    /**
     * Load the rooms
     */
    this.loadRooms()
  }

  /**
   * Load the rooms
   */
  loadRooms() {
    for (const id in rooms) {
      if (id < 900) {
        const roomObj = rooms[id]

        roomObj.id = parseInt(id)
        roomObj.penguins = {}

        this.rooms[id] = new Room(roomObj)
      }
    }

    logger.info(`Quasar has loaded ${Object.keys(this.rooms).length} rooms`)
  }

  /**
   * Create a new igloo
   * @param {Number} id
   */
  createIgloo(id) {
    if (!this.rooms[id]) {
      this.rooms[id] = new Room({ id, penguins: {}, name: `Igloo#${id}`, open: false, max: 30 })
    }
  }

  /**
   * Check if an igloo is open
   * @param {Number} id
   * @returns {Boolean}
   */
  checkIgloo(id) {
    if (this.rooms[id]) {
      return this.rooms[id].open
    }
  }

  /**
   * Close an igloo
   * @param {Number} id
   */
  closeIgloo(id) {
    if (this.rooms[id]) {
      this.rooms[id].open = false
    }
  }

  /**
   * Join a random room
   * @param {Penguin} penguin
   */
  joinRandomRoom(penguin) {
    for (const id in this.rooms) {
      const room = this.rooms[id]

      if (!this.isRoomFull(room.id)) {
        room.addPenguin(penguin)
        break
      }
    }
  }

  /**
   * Return a room
   * @param {Number} id
   * @returns {Room}
   */
  getRoomById(id) {
    return this.rooms[id]
  }

  /**
   * Return if a room is full or not
   * @param {Number} id
   * @returns {Boolean}
   */
  isRoomFull(id) {
    const room = this.getRoomById(id)

    if (room) {
      return Object.keys(room.penguins).length >= room.max
    }
  }
}
