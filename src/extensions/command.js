'use strict'

/**
 * The commands
 * @constant
 */
const commands = {
  'ping': { enabled: true, func: 'botPing', len: 0, mod: false },
  'fullest': { enabled: true, func: 'fullestRoom', len: 0, mod: false },
  'id': { enabled: true, func: 'getId', len: 0, mod: false },
  'online': { enabled: true, func: 'getOnlineCount', len: 0, mod: false },
  'find': { enabled: true, func: 'findPenguin', len: 1, mod: true },
  'jr': { enabled: true, func: 'joinRoom', len: 1, mod: true },
  'ai': { enabled: true, func: 'addItem', len: 1, mod: true },
  'ac': { enabled: true, func: 'addCoins', len: 1, mod: true },
  'rc': { enabled: true, func: 'removeCoins', len: 1, mod: true },
  'tp': { enabled: true, func: 'teleportTo', len: 1, mod: true },
  'summon': { enabled: true, func: 'summonPenguin', len: 1, mod: true },
  'summonto': { enabled: true, func: 'summonPenguinTo', len: 2, mod: true },
  'kick': { enabled: true, func: 'kickPenguin', len: 1, mod: true },
  'mute': { enabled: true, func: 'mutePenguin', len: 1, mod: true },
  'ban': { enabled: true, func: 'banPenguin', len: 1, mod: true },
  'uo': { enabled: true, func: 'updateOutfit', len: 2, mod: true }
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
  static handleCommand(message, penguin) {
    const args = message.substr(1).split(' ')
    const command = args.shift()

    if (commands[command] && commands[command].enabled && penguin.server.extensionManager.isExtensionEnabled('bot')) {
      const { func, len, mod } = commands[command]

      if (args.length === len) {
        if (mod && penguin.moderator) {
          this[func](len === 1 ? args[0] : args, penguin)
        } else if (!mod) {
          this[func](len === 1 ? args[0] : args, penguin)
        }
      }
    }
  }

  /**
   * Handle the !ping command
   * @param {undefined} nothing
   * @param {Penguin} penguin
   */
  static botPing(nothing, penguin) {
    const bot = penguin.server.extensionManager.getExtension('bot')

    bot.sendMessage('Pong!', penguin)
  }

  /**
   * Handle the !fullest command
   * @param {undefined} nothing
   * @param {Penguin} penguin
   */
  static fullestRoom(nothing, penguin) {
    const bot = penguin.server.extensionManager.getExtension('bot')

    const rooms = penguin.server.roomManager.rooms
    const sizes = Object.keys(rooms).sort((a, b) => Object.keys(rooms[b].penguins).length - Object.keys(rooms[a].penguins).length)
    const room = penguin.getRoomById(sizes[0])

    bot.sendMessage(`The fullest room is ${room.name} with ${Object.keys(room.penguins).length} penguino's`, penguin)
  }

  /**
   * Handle the !id command
   * @param {undefined} nothing
   * @param {Penguin} penguin
   */
  static getId(nothing, penguin) {
    const bot = penguin.server.extensionManager.getExtension('bot')

    bot.sendMessage(`Your id is: ${penguin.id}`, penguin)
  }

  /**
   * Handle the !online command
   * @param {undefined} nothing
   * @param {Penguin} penguin
   */
  static getOnlineCount(nothing, penguin) {
    const bot = penguin.server.extensionManager.getExtension('bot')

    bot.sendMessage(`There are currently ${Object.keys(penguin.server.penguins).length} penguino's online`, penguin)
  }

  /**
   * Handle the !find command
   * @param {String} param
   * @param {Penguin} penguin
   */
  static findPenguin(param, penguin) {
    const findObj = penguin.server.getPenguin(param)

    if (findObj && findObj.room) {
      const bot = penguin.server.extensionManager.getExtension('bot')

      bot.sendMessage(`${findObj.username} is in ${findObj.room.name}`, penguin)
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
   * Handle the !tp command
   * @param {String} param
   * @param {Penguin} penguin
   */
  static teleportTo(param, penguin) {
    const findObj = penguin.server.getPenguin(param)

    if (findObj && findObj.room && !findObj.isRoomFull(findObj.room.id)) {
      penguin.removeFromRoom()
      penguin.joinRoom(findObj.room)
    }
  }

  /**
   * Handle the !summon command
   * @param {String} param
   * @param {Penguin} penguin
   */
  static summonPenguin(param, penguin) {
    const summonObj = penguin.server.getPenguin(param)

    if (summonObj && summonObj.room && !penguin.isRoomFull(penguin.room.id)) {
      summonObj.removeFromRoom()
      summonObj.joinRoom(penguin.room)
    }
  }

  /**
   * Handle the !summonto command
   * @param {Array} data
   * @param {Penguin} penguin
   */
  static summonPenguinTo(data, penguin) {
    const [param, roomId] = data
    const summonObj = penguin.server.getPenguin(param)

    if (summonObj && summonObj.room) {
      const room = penguin.getRoomById(roomId)

      if (room && !penguin.isRoomFull(roomId)) {
        summonObj.removeFromRoom()
        summonObj.joinRoom(room)
      }
    }
  }

  /**
   * Handle the !kick command
   * @param {String} param
   * @param {Penguin} penguin
   */
  static kickPenguin(param, penguin) {
    const kickObj = penguin.server.getPenguin(param)

    if (kickObj && kickObj.room) {
      kickObj.sendError(5, true)
    }
  }

  /**
   * Handle the !mute command
   * @param {String} param
   * @param {Penguin} penguin
   */
  static async mutePenguin(param, penguin) {
    const muteObj = penguin.server.getPenguin(param)

    if (muteObj && muteObj.room) {
      muteObj.muted = true
      await muteObj.updateColumn(muteObj.id, 'muted', Number(muteObj.muted))
    }
  }

  /**
   * Handle the !ban command
   * @param {String} param
   * @param {Penguin} penguin
   */
  static async banPenguin(param, penguin) {
    const banObj = penguin.server.getPenguin(param)

    if (banObj && banObj.room) {
      await banObj.updateColumn(banObj.id, 'ban', 1)
      banObj.sendError(603, true)
    }
  }

  /**
   * Handle the !uo command
   * Note: The item is not added to inventory
   * @param {Array} data
   * @param {Penguin} penguin
   */
  static async updateOutfit(data, penguin) {
    const [type, itemId] = data
    const types = ['color', 'head', 'face', 'neck', 'body', 'hand', 'feet', 'flag', 'photo']

    if (types.indexOf(type) > -1) {
      const room = penguin.room

      await penguin.updateOutfit(type, parseInt(itemId))

      penguin.removeFromRoom()
      penguin.joinRoom(room)
    }
  }
}
