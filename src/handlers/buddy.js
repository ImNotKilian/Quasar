'use strict'

/**
 * @exports
 */
module.exports = {
  /**
   * Retrieve buddy list
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleGetBuddies: async (data, penguin) => {
    if (Object.keys(penguin.buddies).length === 0) {
      return penguin.sendXt('gb', '')
    }

    let buddyStr = ''

    for (const buddyId in penguin.buddies) {
      const buddyUsername = penguin.buddies[buddyId]

      buddyStr += `${buddyId}|${buddyUsername}|`

      try {
        const buddyObj = await penguin.server.getPenguinById(buddyId)

        buddyObj.sendXt('bon', penguin.id)
        buddyStr += '1%'
      } catch (err) {
        buddyStr += '0%'
      }
    }

    penguin.sendXt('gb', buddyStr.slice(0, -1))
  },
  /**
   * Add a buddy
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleAddBuddy: async (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0])) {
      return penguin.disconnect()
    }

    await penguin.addBuddy(parseInt(data[0]))
  },
  /**
   * Remove a buddy
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleBuddyRemove: async (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0])) {
      return penguin.disconnect()
    }

    await penguin.removeBuddy(parseInt(data[0]))
  },
  /**
   * Handle the buddy request for adding
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleBuddyRequest: async (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0])) {
      return penguin.disconnect()
    }

    const buddyId = parseInt(data[0])

    if (buddyId !== penguin.id) {
      if (Object.keys(penguin.buddies).length >= 500) {
        return penguin.sendError(901)
      }

      try {
        const buddyObj = await penguin.server.getPenguinById(buddyId)

        if (Object.keys(buddyObj.buddies).length < 500) {
          if (buddyObj.requests.indexOf(penguin.id) === -1) {
            buddyObj.requests.push(penguin.id)
            buddyObj.sendXt('br', penguin.id, penguin.username)
          }
        }
      } catch (err) {
        // Do nothing
      }
    }
  },
  /**
   * Find a buddy
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleFindBuddy: async (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0])) {
      return penguin.disconnect()
    }

    try {
      const buddyObj = await penguin.server.getPenguinById(parseInt(data[0]))

      if (buddyObj.room) {
        penguin.sendXt('bf', buddyObj.room.id)
      }
    } catch (err) {
      // Do nothing
    }
  }
}
