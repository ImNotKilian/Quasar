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
    if (data.length !== 1 || isNaN(data[0]) || !penguin.room) {
      return penguin.disconnect()
    }

    const buddyId = parseInt(data[0])

    if (Object.keys(penguin.buddies).length >= 500) {
      return penguin.sendError(901)
    }

    const idx = penguin.requests.indexOf(buddyId)

    if (!penguin.ignored[buddyId] && !penguin.buddies[buddyId] && idx > -1) {
      try {
        const buddyObj = await penguin.server.getPenguinById(buddyId)

        if (!buddyObj.buddies[penguin.id]) {
          const buddyUsername = buddyObj.username

          penguin.buddies[buddyId] = buddyUsername
          buddyObj.buddies[penguin.id] = penguin.username

          await penguin.server.database.knex('buddy').insert({ id: penguin.id, buddyId, buddyUsername })
          await penguin.server.database.knex('buddy').insert({ id: buddyId, buddyId: penguin.id, buddyUsername: penguin.username })

          buddyObj.sendXt('ba', penguin.id, penguin.username)

          penguin.requests.splice(idx, 1)
        }
      } catch (err) {
        penguin.disconnect()
      }
    }
  },
  /**
   * Remove a buddy
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleBuddyRemove: async (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0]) || !penguin.room) {
      return penguin.disconnect()
    }

    const buddyId = parseInt(data[0])

    if (penguin.buddies[buddyId]) {
      delete penguin.buddies[buddyId]
      await penguin.server.database.knex('buddy').where('buddyId', buddyId).andWhere('id', penguin.id).del()

      try {
        const buddyObj = await penguin.server.getPenguinById(buddyId)

        if (buddyObj.buddies[penguin.id]) {
          delete buddyObj.buddies[penguin.id]
        }

        await penguin.server.database.knex('buddy').where('buddyId', penguin.id).del()
        buddyObj.sendXt('rb', penguin.id, penguin.username)
      } catch (err) {
        await penguin.server.database.knex('buddy').where('buddyId', penguin.id).del()
      }
    }
  },
  /**
   * Handle the buddy request for adding
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleBuddyRequest: async (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0]) || !penguin.room) {
      return penguin.disconnect()
    }

    const buddyId = parseInt(data[0])

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
      penguin.disconnect()
    }
  },
  /**
   * Find a buddy
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleFindBuddy: async (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0]) || !penguin.room) {
      return penguin.disconnect()
    }

    try {
      const buddyObj = await penguin.server.getPenguinById(parseInt(data[0]))

      if (buddyObj.room) {
        penguin.sendXt('bf', buddyObj.room.id)
      }
    } catch (err) {
      penguin.disconnect()
    }
  }
}
