'use strict'

/**
 * @exports
 */
module.exports = {
  /**
   * Retrieve ignored list
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleGetIgnored: (data, penguin) => {
    if (Object.keys(penguin.ignored).length === 0) {
      return penguin.sendXt('gn', '')
    }

    let ignoreStr = ''

    for (const ignoreId in penguin.ignored) {
      const ignoreUsername = penguin.ignored[ignoreId]

      ignoreStr += `${ignoreId}|${ignoreUsername}%`
    }

    ignoreStr.length > 0 ? penguin.sendXt('gn', ignoreStr.slice(0, -1)) : penguin.sendXt('gn')
  },
  /**
   * Add an ignore
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleAddIgnore: async (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0]) || !penguin.room) {
      return penguin.disconnect()
    }

    const ignoreId = parseInt(data[0])

    if (!penguin.ignored[ignoreId]) {
      const ignoreObj = penguin.server.getPenguinById(ignoreId)

      if (ignoreObj) {
        const ignoreUsername = ignoreObj.username

        penguin.ignored[ignoreId] = ignoreUsername
        await penguin.server.database.knex('ignore').insert({ id: penguin.id, ignoreId, ignoreUsername })
      } else {
        const result = await penguin.server.database.knex('penguins').select('username').first('*').where({ id: ignoreId })

        if (!result) {
          return penguin.disconnect()
        }

        const ignoreUsername = result[0].username

        penguin.ignored[ignoreId] = ignoreUsername
        await penguin.server.database.knex('ignore').insert({ id: penguin.id, ignoreId, ignoreUsername })
      }
    }
  },
  /**
   * Remove an ignore
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleRemoveIgnore: async (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0]) || !penguin.room) {
      return penguin.disconnect()
    }

    const ignoreId = parseInt(data[0])

    if (penguin.ignored[ignoreId]) {
      delete penguin.ignored[ignoreId]
      await penguin.server.database.knex('ignore').where('ignoreId', ignoreId).andWhere('id', penguin.id).del()
    }
  }
}
