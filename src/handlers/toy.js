'use strict'

/**
 * @exports
 */
module.exports = {
  /**
   * Handle t#at
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleAddToy: (data, penguin) => {
    if (!penguin.room) {
      return penguin.disconnect()
    }

    penguin.room.sendXt('at', penguin.id, 1, 1)
  },

  /**
   * Handle t#rt
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleRemoveToy: (data, penguin) => {
    if (!penguin.room) {
      return penguin.disconnect()
    }

    penguin.room.sendXt('rt', penguin.id)
  }
}
