'use strict'

/**
 * The commands
 * @constant
 */
const commands = {
  'jr': { 'enabled': true, 'func': 'joinRoom', 'len': 1, mod: true },
  'ai': { 'enabled': true, 'func': 'addItem', 'len': 1, mod: true },
  'ac': { 'enabled': true, 'func': 'addCoins', 'len': 1, mod: true },
  'rc': { 'enabled': true, 'func': 'removeCoins', 'len': 1, mod: true },
  'teleport': { 'enabled': true, 'func': 'teleportTo', 'len': 1, mod: true },
  'kick': { 'enabled': true, 'func': 'kickPenguin', 'len': 1, mod: true }
}

/**
 * @exports
 * @class
 * @static
 */
module.exports = class {
  /**
   * Handle a command
   * @param {Array} data
   * @param {Penguin} penguin
   */
  static handleCommand(data, penguin) {
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
      if (message.charAt(0) === '!') {
        const args = message.substr(1).split(' ')
        const command = args.shift()

        if (commands[command] && commands[command].enabled) {
          const { func, len, mod } = commands[command]

          if (args.length === len && penguin.moderator === mod) {
            this[func](len === 1 ? args[0] : args, penguin)
          }
        }
      } else {
        penguin.room.sendXt('sm', penguin.id, message)
      }
    }
  }

  /**
   * Handle the !jr command
   * @param {String} roomId
   * @param {Penguin} penguin
   */
  static joinRoom(roomId, penguin) {
    roomId = parseInt(roomId)

    if (roomId < 900) {
      penguin.removeFromRoom()

      const room = penguin.getRoomById(roomId)

      if (room && !penguin.isRoomFull(roomId)) {
        penguin.joinRoom(room)
      }
    }
  }

  /**
   * Handle the !ai command
   * @param {String} itemId
   * @param {Penguin} penguin
   */
  static async addItem(itemId, penguin) {
    itemId = parseInt(itemId)

    if (penguin.inventory.indexOf(itemId) === -1) {
      penguin.inventory.push(itemId)

      await penguin.server.database.knex('inventory').insert({ id: penguin.id, itemId })

      penguin.sendXt('ai', itemId, penguin.coins)
    } else {
      penguin.sendError(400)
    }
  }

  /**
   * Handle the !ac command
   * @param {String} amount
   * @param {Penguin} penguin
   */
  static async addCoins(amount, penguin) {
    await penguin.addCoins(parseInt(amount))
    penguin.sendXt('zo', penguin.coins, '', 0, 0, 0)
  }

  /**
   * Handle the !rc command
   * @param {String} amount
   * @param {Penguin} penguin
   */
  static async removeCoins(amount, penguin) {
    await penguin.removeCoins(parseInt(amount))
    penguin.sendXt('zo', penguin.coins, '', 0, 0, 0)
  }

  /**
   * Handle the !teleport command
   * @param {String} id
   * @param {Penguin} penguin
   */
  static teleportTo(id, penguin) {
    id = parseInt(id)

    if (id !== penguin.id) {
      const findObj = penguin.server.getPenguinById(id)

      if (findObj && findObj.room && !findObj.isRoomFull(findObj.room.id)) {
        penguin.removeFromRoom()
        penguin.joinRoom(findObj.room)
      }
    }
  }

  /**
   * Handle the !kick command
   * @param {String} id
   * @param {Penguin} penguin
   */
  static kickPenguin(id, penguin) {
    id = parseInt(id)

    if (id !== penguin.id) {
      const kickObj = penguin.server.getPenguinById(id)

      if (kickObj && kickObj.room) {
        kickObj.sendError(5, true)
      }
    }
  }
}
