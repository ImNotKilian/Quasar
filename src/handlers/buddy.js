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
  handleGetBuddies: (data, penguin) => {
    if (Object.keys(penguin.buddies).length === 0) {
      return penguin.sendXt('gb', '')
    }

    let buddyStr = ''

    for (const buddyId in penguin.buddies) {
      const buddyUsername = penguin.buddies[buddyId]

      buddyStr += `${buddyId}|${buddyUsername}|`

      const buddyObj = penguin.server.getPenguinById(buddyId)

      if (buddyObj) {
        buddyObj.sendXt('bon', penguin.id)
        buddyStr += '1%'
      } else {
        buddyStr += '0%'
      }
    }

    buddyStr.length > 0 ? penguin.sendXt('gb', buddyStr.slice(0, -1)) : penguin.sendXt('gb')
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

    if (Object.keys(penguin.buddies).length >= 100) {
      return penguin.sendError(901)
    }

    const idx = penguin.requests.indexOf(buddyId)

    if (!penguin.ignored[buddyId] && !penguin.buddies[buddyId] && idx > -1) {
      const buddyObj = penguin.server.getPenguinById(buddyId)

      if (buddyObj && !buddyObj.buddies[penguin.id]) {
        const buddyUsername = buddyObj.username

        penguin.buddies[buddyId] = buddyUsername
        buddyObj.buddies[penguin.id] = penguin.username

        try {
          await penguin.server.database.knex('buddy').insert({ id: penguin.id, buddyId, buddyUsername })
          await penguin.server.database.knex('buddy').insert({ id: buddyId, buddyId: penguin.id, buddyUsername: penguin.username })

          buddyObj.sendXt('ba', penguin.id, penguin.username)

          penguin.requests.splice(idx, 1)
        } catch (err) {
          penguin.disconnect()
        }
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

      const buddyObj = penguin.server.getPenguinById(buddyId)

      if (buddyObj) {
        if (buddyObj.buddies[penguin.id]) {
          delete buddyObj.buddies[penguin.id]
        }

        await penguin.server.database.knex('buddy').where('buddyId', penguin.id).andWhere('id', buddyId).del()
        buddyObj.sendXt('rb', penguin.id, penguin.username)
      } else {
        await penguin.server.database.knex('buddy').where('buddyId', penguin.id).andWhere('id', buddyId).del()
      }
    }
  },
  /**
   * Handle the buddy request for adding
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleBuddyRequest: (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0]) || !penguin.room) {
      return penguin.disconnect()
    }

    const buddyId = parseInt(data[0])

    if (Object.keys(penguin.buddies).length >= 100) {
      return penguin.sendError(901)
    }

    const buddyObj = penguin.server.getPenguinById(buddyId)

    if (buddyObj) {
      if (Object.keys(buddyObj.buddies).length < 100) {
        if (buddyObj.requests.indexOf(penguin.id) === -1) {
          buddyObj.requests.push(penguin.id)
          buddyObj.sendXt('br', penguin.id, penguin.username)
        }
      }
    } else {
      penguin.disconnect()
    }
  },
  /**
   * Find a buddy
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleFindBuddy: (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0]) || !penguin.room) {
      return penguin.disconnect()
    }

    const buddyObj = penguin.server.getPenguinById(parseInt(data[0]))

    if (buddyObj && buddyObj.room) {
      penguin.sendXt('bf', buddyObj.room.id)
    } else {
      penguin.disconnect()
    }
  }
}
