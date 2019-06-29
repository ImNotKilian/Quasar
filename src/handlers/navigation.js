'use strict'

/**
 * @exports
 */
module.exports = {
  /**
   * Handle the join server request
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleJoinServer: (data, penguin) => {
    if (data.length !== 3 || parseInt(data[0]) !== penguin.id || data[1] !== penguin.loginkey || penguin.inWorld) {
      return penguin.disconnect()
    }

    penguin.sendXt('js', 0, 0, Number(penguin.moderator), 0)
    penguin.sendXt('gps', '')

    const time = Date.now() / 1000 | 0 * 1000

    penguin.sendXt('lp', penguin.buildString(), penguin.coins, 0, 1440, time, penguin.age, 0, 0, '', 7)
    penguin.inWorld = true
    penguin.joinRandomRoom()
  },
  /**
   * Handle the join room request
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleJoinRoom: (data, penguin) => {
    if (data.length !== 3 || isNaN(data[0]) || isNaN(data[1]) || isNaN(data[2])) {
      return penguin.disconnect()
    }

    penguin.removeFromRoom()

    const roomId = parseInt(data[0])

    if (roomId > 900) {
      return penguin.sendXt('jg', roomId)
    }

    const room = penguin.getRoomById(roomId)

    if (room) {
      if (penguin.isRoomFull(roomId)) {
        return penguin.sendError(210)
      }

      penguin.joinRoom(room, data[1], data[2])
    } else {
      penguin.sendError(213)
    }
  },
  /**
   * Handle the join player request
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleJoinPlayer: (data, penguin) => {
    if (data.length !== 3 || isNaN(data[0]) || isNaN(data[1]) || isNaN(data[2])) {
      return penguin.disconnect()
    }

    penguin.removeFromRoom()

    const roomId = parseInt(data[0]) < 1000 ? parseInt(data[0]) + 1000 : parseInt(data[0])

    penguin.createIgloo(roomId)

    const room = penguin.getRoomById(roomId)

    if (room) {
      penguin.joinRoom(room, data[1], data[2])
    } else {
      penguin.sendError(210)
    }
  }
}
