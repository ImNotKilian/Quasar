'use strict'

/**
 * @exports
 * @class
 * @static
 */
module.exports = class Bot {
  /**
   * Build the bot string
   * @returns {String}
   */
  static buildString() {
    return [
      0, // Id
      'Bot', // Username
      1, // Language bitmask
      1, // Color
      122, // Head
      0, // Face
      0, // Neck
      276, // Body
      0, // Hand
      0, // Feet
      514, // Flag
      0, // Photo
      ~~(Math.random() * 200), // X
      ~~(Math.random() * 200), // Y
      1, // Frame
      1, // Is member
      876, // Membership badge
      '0xFF0000', // Name glow
      '0x000000', // Name color
      '', // Bubble color
      '', // Bubble text
      4, // Speed
      'Zaseth is hot.', // Mood
      '', // Bubble glow
      '0xFF0000', // Mood glow
      '0x000000', // Mood color
      0, // Walk on walls enabled
      100 // Size
    ].join('|')
  }

  /**
   * Send a message via the bot
   * @param {String} message
   * @param {Penguin} penguin
   */
  static sendMessage(message, penguin) {
    penguin.sendXt('sm', 0, message)
  }

  /**
   * Send a message to the penguins in the room
   * @param {String} message
   * @param {Penguin} penguin
   */
  static sendRoomMessage(message, penguin) {
    if (penguin.room) {
      penguin.room.sendXt('sm', 0, message)
    }
  }
}
