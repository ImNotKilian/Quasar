'use strict'

const { compare } = require('bcryptjs')
const { randomBytes, createHash } = require('crypto')

/**
 * @exports
 */
module.exports = {
  /**
   * Handle the version check
   * @param {String} data
   * @param {Penguin} penguin
   */
  handleVersionCheck: (data, penguin) => {
    if (penguin.stage === 0) {
      penguin.stage = 1
      penguin.send('<msg t="sys"><body action="apiOK" r="0"></body></msg>')
    } else {
      penguin.disconnect()
    }
  },
  /**
   * Handle the random key request
   * @param {String} data
   * @param {Penguin} penguin
   */
  handleRandomKey: (data, penguin) => {
    if (penguin.stage === 1) {
      penguin.stage = 2
      penguin.send(`<msg t="sys"><body action="rndK" r="-1"><k>${config.KEY}</k></body></msg>`)
    } else {
      penguin.disconnect()
    }
  },
  /**
   * Handle the login request
   * @param {String} data
   * @param {Penguin} penguin
   */
  handleLogin: async (data, penguin) => {
    if (penguin.stage !== 2) {
      return penguin.disconnect()
    }

    const username = data.split('<nick><![CDATA[')[1].split(']]></nick>')[0]
    const password = data.split('<pword><![CDATA[')[1].split(']]></pword>')[0]

    if (encodeURIComponent(username) !== username) {
      return penguin.disconnect()
    }

    const result = await penguin.server.database.knex('penguins').first('*').where({ username })

    if (!result) {
      return penguin.sendError(100, true)
    }

    if (serverType === 'LOGIN') {
      const isSame = await compare(password, result.password)

      if (!isSame) {
        return penguin.sendError(101, true)
      }

      if (Boolean(result.ban)) {
        return penguin.sendError(603, true)
      }

      const loginkey = await randomBytes(15).toString('hex')

      const pop = penguin.server.penguins.length
      const max = penguin.server.config.MAX
      const bars = pop >= max ? 6 : Math.round(pop * 5 / max)

      await penguin.updateColumn(username, 'loginkey', loginkey)

      /**
       * I know I know, '' should be the buddy world, which is 100
       * This is only when the penguin has a buddy and that buddy must be online
       * This enables the buddy smiley thing
       * I just don't like why it had to be done like this...
       * Maybe add it later?
       */
      penguin.sendXt('l', result.id, loginkey, '', `100,${bars}`)
    } else {
      if (!result.loginkey || penguin.server.isPenguinOnline(result.id)) {
        return penguin.disconnect()
      }

      let hash = await createHash('md5').update(result.loginkey + config.KEY).digest('hex')
      hash = hash.substring(16) + hash.substring(0, 16) + result.loginkey

      if (password !== hash) {
        return penguin.sendError(101, true)
      }

      if (Boolean(result.ban)) {
        return penguin.sendError(603, true)
      }

      await penguin.setPenguin(result)
      penguin.sendXt('l', 'Zaseth')
    }
  }
}
