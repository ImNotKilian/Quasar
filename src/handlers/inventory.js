'use strict'

const items = require('../crumbs/items')

/**
 * @exports
 */
module.exports = {
  /**
   * Handle the inventory request
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleGetInventory: (data, penguin) => {
    if (penguin.inventory.length === 1) {
      return penguin.sendXt('gi', penguin.inventory[0])
    }

    penguin.sendXt('gi', penguin.inventory.join('%'))
  },
  /**
  * Handle the penguin request
  * @param {Array} data
  * @param {Penguin} penguin
  */
  handleGetPenguin: async (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0])) {
      return penguin.disconnect()
    }

    const id = parseInt(data[0])

    try {
      const penguinObj = await penguin.server.getPenguinById(id)
      const string = penguinObj.buildString().split('|').slice(0, 12).join('|') + '|'

      penguin.sendXt('gp', string)
    } catch (err) {
      const result = await penguin.server.database.knex('penguins').first('*').where({ id })

      if (!result) {
        return penguin.disconnect()
      }

      const string = [
        result.id,
        result.username,
        1,
        result.color,
        result.head,
        result.face,
        result.neck,
        result.body,
        result.hand,
        result.feet,
        result.flag,
        result.photo
      ]

      penguin.sendXt('gp', string.join('|') + '|')
    }
  },
  /**
   * Handle the clothing update
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleUpdateClothing: async (data, penguin) => {
    if (data.length !== 2 || isNaN(data[0])) {
      return penguin.disconnect()
    }

    const [itemId, itemType] = [parseInt(data[0]), data[1].toString().toLowerCase()]
    const types = {
      upc: 'color',
      uph: 'head',
      upf: 'face',
      upn: 'neck',
      upb: 'body',
      upa: 'hand',
      upe: 'feet',
      upl: 'flag',
      upp: 'photo'
    }

    if (!types[itemType] || penguin.inventory.indexOf(itemId) === -1 && itemId !== 0) {
      return penguin.disconnect()
    }

    penguin.room.sendXt(itemType, penguin.id, itemId)
    await penguin.updateOutfit(types[itemType], itemId)
  },
  /**
   * Handle item adding
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleAddItem: async (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0])) {
      return penguin.disconnect()
    }

    const itemId = parseInt(data[0])
    const itemCrumb = items[itemId]

    if (!itemCrumb) {
      return penguin.sendError(402)
    }

    if (penguin.inventory.indexOf(itemId) > -1) {
      return penguin.sendError(400)
    }

    const cost = itemCrumb.cost

    if (penguin.coins < cost) {
      return penguin.sendError(401)
    }

    if (penguin.inventory.indexOf(itemId) === -1) {
      await penguin.removeCoins(cost)

      penguin.inventory.push(itemId)

      await penguin.server.database.knex('inventory').insert({ id: penguin.id, itemId })

      penguin.sendXt('ai', itemId, penguin.coins)
    } else {
      penguin.sendError(400)
    }
  }
}
