'use strict'

const stamps = require('../crumbs/stamps')

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
  handleGetStampBookCoverDetails: async (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0])) {
      return penguin.disconnect()
    }

    const id = parseInt(data[0])

    if (penguin.id === id) {
      return penguin.sendXt('gsbcd', penguin.cover)
    }

    try {
      const penguinObj = await penguin.server.getPenguinById(id)

      penguin.sendXt('gsbcd', penguinObj.cover)
    } catch (err) {
      const result = await penguin.server.database.knex('penguins').select('cover').where('id', id)

      if (result) {
        penguin.sendXt('gsbcd', result[0].cover)
      }
    }
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
  handleSetStampBookCoverDetails: async (data, penguin) => {
    if (data.length < 4 || isNaN(data[0]) || isNaN(data[1]) || isNaN(data[2]) || isNaN(data[3])) {
      return penguin.disconnect()
    }

    let cover = data.splice(0, 4).join('%')

    if (data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        cover += `%${data[i]}`
      }
    }

    if (penguin.cover !== cover) {
      await penguin.updateColumn(penguin.id, 'cover', cover)
      penguin.cover = cover
    }

    penguin.sendXt('ssbcd')
  },
  /**
   * Add a stamp
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleAddStamp: async (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0])) {
      return penguin.disconnect()
    }

    const stampId = parseInt(data[0])

    if (penguin.stamps.indexOf(stampId) === -1) {
      if (stamps[stampId]) {
        penguin.stamps.push(stampId)

        await penguin.server.database.knex('stamps').insert({ id: penguin.id, stampId })

        penguin.sendXt('aabs', stampId)
      }
    }
  }
}
