'use strict'

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
      penguin.send('<msg t="sys"><body action="rndK" r="-1"><k>Quasar</k></body></msg>')
    } else {
      penguin.disconnect()
    }
  },
  /**
   * Handle the login request
   * @param {String} data
   * @param {Penguin} penguin
   */
  handleLogin: (data, penguin) => {
    if (penguin.stage !== 2) {
      return penguin.disconnect()
    }

    const username = data.split('<nick><![CDATA[')[1].split(']]></nick>')[0]
    const password = data.split('<pword><![CDATA[')[1].split(']]></pword>')[0]

    if (encodeURIComponent(username) !== username) {
      return penguin.disconnect()
    }
  }
}
