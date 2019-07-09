'use strict'

/**
 * @exports
 */
module.exports = {
  /**
   * Mute a penguin
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleMute: async (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0]) || !penguin.moderator || !penguin.room) {
      return penguin.disconnect()
    }

    const muteObj = penguin.server.getPenguinById(parseInt(data[0]))

    if (muteObj) {
      muteObj.muted = !muteObj.muted
      await muteObj.updateColumn(muteObj.id, 'muted', Number(muteObj.muted))
    } else {
      penguin.disconnect()
    }
  },
  /**
   * Kick a penguin
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleKick: (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0]) || !penguin.moderator || !penguin.room) {
      return penguin.disconnect()
    }

    const kickObj = penguin.server.getPenguinById(parseInt(data[0]))

    if (kickObj) {
      kickObj.sendError(5, true)
    } else {
      penguin.disconnect()
    }
  },
  /**
   * Add a ban
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleBan: async (data, penguin) => {
    if (data.length !== 2 || isNaN(data[0]) || !penguin.moderator || !penguin.room) {
      return penguin.disconnect()
    }

    const banObj = penguin.server.getPenguinById(parseInt(data[0]))

    if (banObj) {
      await banObj.updateColumn(banObj.id, 'ban', 1)

      banObj.sendXt('e', 610, data[1])
      banObj.disconnect()
    } else {
      penguin.disconnect()
    }
  }
}
