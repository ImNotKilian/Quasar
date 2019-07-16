'use strict'

/**
 * @exports
 */
module.exports = {
  /**
   * Retrieve igloo list
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleGetIglooList: (data, penguin) => {
    let iglooStr = ''

    for (const id in penguin.server.roomManager.rooms) {
      const room = penguin.server.roomManager.rooms[id]

      if (id > 1000 && room.open) {
        const penguinObj = penguin.server.getPenguinById(id - 1000)

        if (penguinObj) {
          iglooStr += `%${penguinObj.id}|${penguinObj.username}`
        }
      }
    }

    // Avoid undefined in open igloo list
    iglooStr.length > 0 ? penguin.sendXt('gr', iglooStr.substr(1)) : penguin.sendXt('gr')
  },
  /**
   * Retrieve an igloo
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleGetIgloo: (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0])) {
      return penguin.disconnect()
    }

    const id = parseInt(data[0])

    // Todo
  },
  /**
   * Open an igloo
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleOpenIgloo: (data, penguin) => {
    if (data.length !== 2 || isNaN(data[0])) {
      return penguin.disconnect()
    }

    const iglooId = parseInt(data[0])
    const username = data[1]

    if (iglooId === penguin.id && penguin.room && username === penguin.username) {
      penguin.room.open = true
    }
  },
  /**
   * Close an igloo
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleCloseIgloo: (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0])) {
      return penguin.disconnect()
    }

    const iglooId = parseInt(data[0])

    if (iglooId === penguin.id && penguin.room) {
      penguin.room.open = false
    }
  }
}
