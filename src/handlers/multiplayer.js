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

    const time = Date.now() / 1000 | 0
    const coins = penguin.lastGame > time - 30 ? 0 : parseInt(Math.round(data[0] / 4))

    penguin.lastGame = time
    await penguin.addCoins(coins)
    penguin.sendXt('zo', penguin.coins)
  }
}
