'use strict'

/**
 * @exports
 */
module.exports = {
  /**
   * Retrieve stamps
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleGetStamps: async (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0])) {
      return penguin.disconnect()
    }

    const id = parseInt(data[0])

    if (penguin.id === id) {
      return penguin.sendXt('gps', id, penguin.stamps.length === 0 ? '' : penguin.stamps.join('|'))
    }

    try {
      const penguinObj = await penguin.server.getPenguinById(id)

      penguin.sendXt('gps', id, penguinObj.stamps.length === 0 ? '' : penguinObj.stamps.join('|'))
    } catch (err) {
      const stamps = await penguin.server.database.knex('stamps').pluck('stampId').where('id', id)

      penguin.sendXt('gps', id, stamps.length === 0 ? '' : stamps.join('|'))
    }
  },
  /**
   * Retrieve stampbook cover details
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleGetStampBookCoverDetails: (data, penguin) => {
    // Todo
  },
  /**
   * Retrieve recently earned stamps
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleGetMyRecentlyEarnedStamps: (data, penguin) => {
    // Todo, maybe later
    penguin.sendXt('gmres', '')
  },
  /**
   * Set stampbook cover details
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleSetStampBookCoverDetails: (data, penguin) => {
    // Todo
  },
  /**
   * Add a stamp
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleAddStamp: async (data, penguin) => {
    // Todo
  }
}
