'use strict'

/**
 * @exports
 */
module.exports = {
  /**
   * When a game ends
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleGameOver: async (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0]) || !penguin.gameRoomId) {
      return penguin.disconnect()
    }

    const nonDiv = [904, 905, 906, 912, 916, 917, 918, 919, 950, 952]
    const earned = nonDiv.indexOf(penguin.gameRoomId) > -1 ? parseInt(data[0]) : Math.floor(parseInt(data[0]) / 4)

    delete penguin.gameRoomId

    await penguin.addCoins(earned)
    penguin.sendXt('zo', penguin.coins, '', 0, 0, 0)
  }
}
