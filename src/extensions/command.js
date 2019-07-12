'use strict'

/**
 * The commands
 * @constant
 */
const commands = {
  'jr': { 'func': 'joinRoom', 'len': 1, mod: false }
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

        if (commands[command]) {
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
}
