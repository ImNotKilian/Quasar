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

    const muteObj = penguin.server.getPenguinById(parseInt(data[0]))

    if (muteObj) {
      muteObj.muted = !muteObj.muted
      await muteObj.updateColumn(muteObj.id, 'muted', Number(muteObj.muted))
    }
  },
  /**
   * Kick a penguin
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleKick: (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0]) || !penguin.moderator) {
      return penguin.disconnect()
    }

    const kickObj = penguin.server.getPenguinById(parseInt(data[0]))

    if (kickObj) {
      kickObj.sendError(5, true)
    }
  }
}
