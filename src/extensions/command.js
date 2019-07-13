'use strict'

/**
 * The commands
 * @constant
 */
const commands = {
  'ping': { enabled: true, func: 'botPing', mod: false },
  'fullest': { enabled: true, func: 'fullestRoom', mod: false },
  'id': { enabled: true, func: 'getId', mod: false },
  'online': { enabled: true, func: 'getOnlineCount', mod: false },
  'find': { enabled: true, func: 'findPenguin', mod: true },
  'jr': { enabled: true, func: 'joinRoom', mod: true },
  'ai': { enabled: true, func: 'addItem', mod: true },
  'ac': { enabled: true, func: 'addCoins', mod: true },
  'rc': { enabled: true, func: 'removeCoins', mod: true },
  'tp': { enabled: true, func: 'teleportTo', mod: true },
  'summon': { enabled: true, func: 'summonPenguin', mod: true },
  'summonto': { enabled: true, func: 'summonPenguinTo', mod: true },
  'kick': { enabled: true, func: 'kickPenguin', mod: true },
  'mute': { enabled: true, func: 'mutePenguin', mod: true },
  'ban': { enabled: true, func: 'banPenguin', mod: true },
  'uo': { enabled: true, func: 'updateOutfit', mod: true },
  'ng': { enabled: true, func: 'setNameglow', mod: false },
  'nc': { enabled: true, func: 'setNamecolor', mod: false },
  'bc': { enabled: true, func: 'setBubblecolor', mod: false },
  'bt': { enabled: true, func: 'setBubbletext', mod: false },
  'speed': { enabled: true, func: 'setSpeed', mod: false },
  'mood': { enabled: true, func: 'setMood', mod: false },
  'bg': { enabled: true, func: 'setBubbleglow', mod: false },
  'mg': { enabled: true, func: 'setMoodglow', mod: false },
  'mc': { enabled: true, func: 'setMoodcolor', mod: false },
  'walls': { enabled: true, func: 'setWalls', mod: false },
  'size': { enabled: true, func: 'setSize', mod: false }
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
      const { func, mod } = commands[command]

      if (mod && penguin.moderator) {
        this[func](args.length === 1 ? args[0] : args, penguin)
      } else if (!mod) {
        this[func](args.length === 1 ? args[0] : args, penguin)
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
   * @param {String|Array} param
   * @param {Penguin} penguin
   */
  static findPenguin(param, penguin) {
    if (Array.isArray(param)) {
      param = param.join(' ')
    }

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
    if (isNaN(roomId)) {
      return
    }

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
    if (isNaN(itemId)) {
      return
    }

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
    if (isNaN(amount)) {
      return
    }

    await penguin.addCoins(parseInt(amount))
    penguin.sendXt('zo', penguin.coins, '', 0, 0, 0)
  }

  /**
   * Handle the !rc command
   * @param {String} amount
   * @param {Penguin} penguin
   */
  static async removeCoins(amount, penguin) {
    if (isNaN(amount)) {
      return
    }

    await penguin.removeCoins(parseInt(amount))
    penguin.sendXt('zo', penguin.coins, '', 0, 0, 0)
  }

  /**
   * Handle the !tp command
   * @param {String|Array} param
   * @param {Penguin} penguin
   */
  static teleportTo(param, penguin) {
    if (Array.isArray(param)) {
      param = param.join(' ')
    }

    const findObj = penguin.server.getPenguin(param)

    if (findObj && findObj.room && !findObj.isRoomFull(findObj.room.id)) {
      penguin.removeFromRoom()
      penguin.joinRoom(findObj.room)
    }
  }

  /**
   * Handle the !summon command
   * @param {String|Array} param
   * @param {Penguin} penguin
   */
  static summonPenguin(param, penguin) {
    if (Array.isArray(param)) {
      param = param.join(' ')
    }

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
    if (data.length < 2) {
      return
    }

    const roomId = data.shift()

    if (isNaN(roomId)) {
      return
    }

    const summonObj = penguin.server.getPenguin(data.length > 1 ? data.join(' ') : data[0])

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
   * @param {String|Array} param
   * @param {Penguin} penguin
   */
  static kickPenguin(param, penguin) {
    if (Array.isArray(param)) {
      param = param.join(' ')
    }

    const kickObj = penguin.server.getPenguin(param)

    if (kickObj && kickObj.room) {
      kickObj.sendError(5, true)
    }
  }

  /**
   * Handle the !mute command
   * @param {String|Array} param
   * @param {Penguin} penguin
   */
  static async mutePenguin(param, penguin) {
    if (Array.isArray(param)) {
      param = param.join(' ')
    }

    const muteObj = penguin.server.getPenguin(param)

    if (muteObj && muteObj.room) {
      muteObj.muted = true
      await muteObj.updateColumn(muteObj.id, 'muted', Number(muteObj.muted))
    }
  }

  /**
   * Handle the !ban command
   * @param {String|Array} param
   * @param {Penguin} penguin
   */
  static async banPenguin(param, penguin) {
    if (Array.isArray(param)) {
      param = param.join(' ')
    }

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
    if (isNaN(data[1])) {
      return
    }

    const [type, itemId] = data
    const types = ['color', 'head', 'face', 'neck', 'body', 'hand', 'feet', 'flag', 'photo']

    if (types.indexOf(type) > -1) {
      const room = penguin.room

      await penguin.updateOutfit(type, parseInt(itemId))

      penguin.removeFromRoom()
      penguin.joinRoom(room)
    }
  }

  /**
   * Handle the !ng command
   * @param {String} hex
   * @param {Penguin} penguin
   */
  static async setNameglow(hex, penguin) {
    if (hex.length !== 6 || /^[0-9A-F]{6}$/i.test(hex)) {
      return
    }

    hex = `0x${hex}`

    penguin.nameglow = hex
    await penguin.updateColumn(penguin.id, 'nameglow', hex)
    penguin.sendXt('up', penguin.buildString())

    const room = penguin.room

    penguin.removeFromRoom()
    penguin.joinRoom(room)
  }

  /**
   * Handle the !nc command
   * @param {String} hex
   * @param {Penguin} penguin
   */
  static async setNamecolor(hex, penguin) {
    if (hex.length !== 6 || /^[0-9A-F]{6}$/i.test(hex)) {
      return
    }

    hex = `0x${hex}`

    penguin.namecolor = hex
    await penguin.updateColumn(penguin.id, 'namecolor', hex)
    penguin.sendXt('up', penguin.buildString())

    const room = penguin.room

    penguin.removeFromRoom()
    penguin.joinRoom(room)
  }

  /**
   * Handle the !bc command
   * @param {String} hex
   * @param {Penguin} penguin
   */
  static async setBubblecolor(hex, penguin) {
    if (hex.length !== 6 || /^[0-9A-F]{6}$/i.test(hex)) {
      return
    }

    hex = `0x${hex}`

    penguin.bubblecolor = hex
    await penguin.updateColumn(penguin.id, 'bubblecolor', hex)
    penguin.sendXt('up', penguin.buildString())

    const room = penguin.room

    penguin.removeFromRoom()
    penguin.joinRoom(room)
  }

  /**
   * Handle the !bt command
   * @param {String} hex
   * @param {Penguin} penguin
   */
  static async setBubbletext(hex, penguin) {
    if (hex.length !== 6 || /^[0-9A-F]{6}$/i.test(hex)) {
      return
    }

    hex = `0x${hex}`

    penguin.bubbletext = hex
    await penguin.updateColumn(penguin.id, 'bubbletext', hex)
    penguin.sendXt('up', penguin.buildString())

    const room = penguin.room

    penguin.removeFromRoom()
    penguin.joinRoom(room)
  }

  /**
   * Handle the !speed command
   * @param {String} value
   * @param {Penguin} penguin
   */
  static async setSpeed(value, penguin) {
    if (isNaN(value)) {
      return
    }

    value = Math.abs(parseInt(value))

    if (value > 100) {
      return
    }

    penguin.speed = value
    await penguin.updateColumn(penguin.id, 'speed', value)
    penguin.sendXt('up', penguin.buildString())

    const room = penguin.room

    penguin.removeFromRoom()
    penguin.joinRoom(room)
  }

  /**
   * Handle the !mood command
   * @param {Array} mood
   * @param {Penguin} penguin
   */
  static async setMood(mood, penguin) {
    if (Array.isArray(mood)) {
      mood = mood.join(' ')
    }

    if (!mood.match(/^[a-zA-Z0-9 .,!?]+$/) || mood.length > 255) {
      return
    }

    penguin.mood = mood
    await penguin.updateColumn(penguin.id, 'mood', mood)
    penguin.sendXt('up', penguin.buildString())

    const room = penguin.room

    penguin.removeFromRoom()
    penguin.joinRoom(room)
  }

  /**
   * Handle the !bg command
   * @param {String} hex
   * @param {Penguin} penguin
   */
  static async setBubbleglow(hex, penguin) {
    if (hex.length !== 6 || /^[0-9A-F]{6}$/i.test(hex)) {
      return
    }

    hex = `0x${hex}`

    penguin.bubbleglow = hex
    await penguin.updateColumn(penguin.id, 'bubbleglow', hex)
    penguin.sendXt('up', penguin.buildString())

    const room = penguin.room

    penguin.removeFromRoom()
    penguin.joinRoom(room)
  }

  /**
   * Handle the !mg command
   * @param {String} hex
   * @param {Penguin} penguin
   */
  static async setMoodglow(hex, penguin) {
    if (hex.length !== 6 || /^[0-9A-F]{6}$/i.test(hex)) {
      return
    }

    hex = `0x${hex}`

    penguin.moodglow = hex
    await penguin.updateColumn(penguin.id, 'moodglow', hex)
    penguin.sendXt('up', penguin.buildString())

    const room = penguin.room

    penguin.removeFromRoom()
    penguin.joinRoom(room)
  }

  /**
   * Handle the !mc command
   * @param {String} hex
   * @param {Penguin} penguin
   */
  static async setMoodcolor(hex, penguin) {
    if (hex.length !== 6 || /^[0-9A-F]{6}$/i.test(hex)) {
      return
    }

    hex = `0x${hex}`

    penguin.moodcolor = hex
    await penguin.updateColumn(penguin.id, 'moodcolor', hex)
    penguin.sendXt('up', penguin.buildString())

    const room = penguin.room

    penguin.removeFromRoom()
    penguin.joinRoom(room)
  }

  /**
   * Handle the !walls command
   * @param {String} value
   * @param {Penguin} penguin
   */
  static async setWalls(value, penguin) {
    if (isNaN(value)) {
      return
    }

    value = parseInt(value)

    if (value !== 1 && value !== 0) {
      return
    }

    penguin.walls = value
    await penguin.updateColumn(penguin.id, 'walls', value)
    penguin.sendXt('up', penguin.buildString())

    const room = penguin.room

    penguin.removeFromRoom()
    penguin.joinRoom(room)
  }

  /**
   * Handle the !size command
   * @param {String} value
   * @param {Penguin} penguin
   */
  static async setSize(value, penguin) {
    if (isNaN(value)) {
      return
    }

    value = Math.abs(parseInt(value))

    if (value > 200) {
      return
    }

    penguin.size = value
    await penguin.updateColumn(penguin.id, 'size', value)
    penguin.sendXt('up', penguin.buildString())

    const room = penguin.room

    penguin.removeFromRoom()
    penguin.joinRoom(room)
  }
}
