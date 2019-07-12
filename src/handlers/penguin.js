'use strict'

/**
 * @exports
 */
module.exports = {
  /**
   * Handle the heartbeat, this happens every minute
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleHeartBeat: (data, penguin) => {
    penguin.sendXt('h')
  },
  /**
   * Handle u#sp
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleSendPosition: (data, penguin) => {
    if (data.length !== 2 || isNaN(data[0]) || isNaN(data[1]) || !penguin.room) {
      return penguin.disconnect()
    }

    penguin.x = parseInt(data[0])
    penguin.y = parseInt(data[1])

    if (penguin.coinsDug !== 0) {
      penguin.coinsDug = 0
    }

    penguin.room.sendXt('sp', penguin.id, penguin.x, penguin.y)
  },
  /**
   * Handle u#sb
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleSendSnowball: (data, penguin) => {
    if (data.length !== 2 || isNaN(data[0]) || isNaN(data[1]) || !penguin.room) {
      return penguin.disconnect()
    }

    penguin.room.sendXt('sb', penguin.id, data[0], data[1])
  },
  /**
   * Handle u#se
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleSendEmote: (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0]) || !penguin.room) {
      return penguin.disconnect()
    }

    penguin.room.sendXt('se', penguin.id, data[0])
  },
  /**
  * Handle u#sf
  * @param {Array} data
  * @param {Penguin} penguin
  */
  handleSendFrame: (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0]) || !penguin.room) {
      return penguin.disconnect()
    }

    penguin.frame = parseInt(data[0])
    penguin.room.sendXt('sf', penguin.id, penguin.frame)
  },
  /**
   * Handle u#ss
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleSendSafeMessage: (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0]) || !penguin.room) {
      return penguin.disconnect()
    }

    penguin.room.sendXt('ss', penguin.id, data[0])
  },
  /**
   * Handle u#sa
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleSendAction: (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0]) || !penguin.room) {
      return penguin.disconnect()
    }

    penguin.frame = 1
    penguin.room.sendXt('sa', penguin.id, data[0])
  },
  /**
   * Handle u#sg
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleSendGuide: (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0]) || !penguin.room) {
      return penguin.disconnect()
    }

    penguin.room.sendXt('sg', penguin.id, data[0])
  },
  /**
   * Handle u#sj
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleSendJoke: (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0]) || !penguin.room) {
      return penguin.disconnect()
    }

    penguin.room.sendXt('sj', penguin.id, data[0])
  },
  /**
   * Handle u#sma
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleSendMascotMessage: (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0]) || !penguin.room || !penguin.moderator) {
      return penguin.disconnect()
    }

    penguin.room.sendXt('sma', penguin.id, data[0])
  },
  /**
   * Handle u#sl
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleSendLine: (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0]) || !penguin.room) {
      return penguin.disconnect()
    }

    penguin.room.sendXt('sl', penguin.id, data[0])
  },
  /**
   * Handle u#sq
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleSendQuickMessage: (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0]) || !penguin.room) {
      return penguin.disconnect()
    }

    penguin.room.sendXt('sq', penguin.id, data[0])
  },
  /**
   * Handle u#glr
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleGetLatestRevision: (data, penguin) => {
    penguin.sendXt('glr', 'Quasar')
  },
  /**
   * Handle m#sm
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleSendMessage: (data, penguin) => {
    if (data.length !== 2 || isNaN(data[0]) || !penguin.room) {
      return penguin.disconnect()
    }

    const [id, message] = [parseInt(data[0]), data[1]]

    if (id !== penguin.id) {
      return penguin.disconnect()
    }

    if (message.length <= 0 || message.length > 48) {
      return penguin.sendError(5, true)
    }

    if (!penguin.muted) {
      if (message.charAt(0) === '!' && penguin.server.extensionManager.isExtensionEnabled('command')) {
        penguin.server.extensionManager.getExtension('command').handleCommand(message, penguin)
      } else {
        penguin.room.sendXt('sm', penguin.id, message)
      }
    }
  },
  /**
   * Handle the coin digging action
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleCoinDigUpdate: async (data, penguin) => {
    if (penguin.room && penguin.room.id === 813 && penguin.frame === 26 && penguin.coinsDug < 5) {
      const coins = ~~(Math.random() * 100) + 1

      await penguin.addCoins(coins)
      penguin.coinsDug++

      penguin.sendXt('cdu', coins, penguin.coins)
    }
  }
}
