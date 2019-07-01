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

    penguin.sendXt('gn', ignoreStr.slice(0, -1))
  },
  /**
   * Add an ignore
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleAddIgnore: async (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0])) {
      return penguin.disconnect()
    }

    const ignoreId = parseInt(data[0])

    await penguin.addIgnore(ignoreId)
    penguin.sendXt('an', ignoreId)
  },
  /**
   * Remove an ignore
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleRemoveIgnore: async (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0])) {
      return penguin.disconnect()
    }

    const ignoreId = parseInt(data[0])

    await penguin.removeIgnore(ignoreId)
    penguin.sendXt('rn', ignoreId)
  }
}
