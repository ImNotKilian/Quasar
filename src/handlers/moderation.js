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
    if (data.length !== 1 || isNaN(data[0]) || !penguin.moderator) {
      return penguin.disconnect()
    }

    try {
      const muteObj = await penguin.server.getPenguinById(parseInt(data[0]))

      muteObj.muted = !muteObj.muted
      await muteObj.updateColumn(muteObj.id, 'muted', Number(muteObj.muted))
    } catch (err) {
      // Do nothing
    }
  },
  /**
   * Kick a penguin
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleKick: async (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0]) || !penguin.moderator) {
      return penguin.disconnect()
    }

    try {
      const kickObj = await penguin.server.getPenguinById(parseInt(data[0]))

      kickObj.sendError(5, true)
    } catch (err) {
      // Do nothing
    }
  },
  /**
   * Add a ban
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleBan: async (data, penguin) => {
    if (data.length !== 2 || isNaN(data[0]) || !penguin.moderator) {
      return penguin.disconnect()
    }

    try {
      const banObj = await penguin.server.getPenguinById(parseInt(data[0]))

      await banObj.updateColumn(banObj.id, 'ban', 1)

      banObj.sendXt('e', 610, data[1])
      banObj.disconnect()
    } catch (err) {
      // Do nothing
    }
  }
}
