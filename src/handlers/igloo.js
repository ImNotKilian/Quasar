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

    iglooStr.length > 1 ? penguin.sendXt('gr', iglooStr.substr(1)) : penguin.sendXt('gr')
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
  }
}
