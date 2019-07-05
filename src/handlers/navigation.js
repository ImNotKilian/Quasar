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

    penguin.sendXt('lp', penguin.buildString(), penguin.coins, 0, 1440, time, penguin.age, 0, 1, '', 7)
    penguin.inWorld = true
    penguin.joinRandomRoom()
  },
  /**
   * Handle the join room request
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleJoinRoom: async (data, penguin) => {
    if (data.length !== 3 || isNaN(data[0]) || isNaN(data[1]) || isNaN(data[2])) {
      return penguin.disconnect()
    }

    penguin.removeFromRoom()

    const roomId = parseInt(data[0])

    if (roomId > 900) {
      penguin.gameRoomId = roomId

      return penguin.sendXt('jg', roomId)
    }

    try {
      const room = await penguin.getRoomById(roomId)

      if (penguin.isRoomFull(roomId)) {
        return penguin.sendError(210)
      }

      penguin.joinRoom(room, data[1], data[2])
    } catch (err) {
      penguin.sendError(213)
    }
  },
  /**
   * Handle the join player request
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleJoinPlayer: async (data, penguin) => {
    if (data.length !== 3 || isNaN(data[0]) || isNaN(data[1]) || isNaN(data[2])) {
      return penguin.disconnect()
    }

    penguin.removeFromRoom()

    const roomId = parseInt(data[0]) < 1000 ? parseInt(data[0]) + 1000 : parseInt(data[0])

    penguin.createIgloo(roomId)

    try {
      const room = await penguin.getRoomById(roomId)

      if (penguin.isRoomFull(roomId)) {
        return penguin.sendError(210)
      }

      penguin.joinRoom(room, data[1], data[2])
    } catch (err) {
      penguin.sendError(10011)
    }
  }
}
