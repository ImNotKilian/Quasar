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

    const coins = parseInt(data[0])
    const time = Date.now() / 1000 | 0

    let earned = 0

    if ([904, 905, 906, 912, 916, 917, 918, 919, 950, 952].indexOf(penguin.gameRoomId) > -1) {
      earned = coins
    } else {
      earned = Math.ceil(coins / 10)
    }

    if (penguin.lastGame > time - 30) {
      earned = 0
    }

    penguin.lastGame = time
    await penguin.addCoins(earned)
    penguin.sendXt('zo', penguin.coins, '', 0, 0, 0)
  }
}
