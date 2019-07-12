'use strict'

/**
 * The config object
 * @exports
 */
module.exports = {
  KEY: 'Quasar',

  EXTENSIONS: {
    'command': { 'enabled': true, 'handler': 'm#sm', 'func': 'handleCommand' }
  },

  REGISTER: { HOST: '127.0.0.1', PORT: 1337 },

  LOGIN: { HOST: '127.0.0.1', PORT: 6112 },

  WORLD: { HOST: '127.0.0.1', PORT: 9875, MAX: 200 },

  DATABASE: { host: '127.0.0.1', user: 'root', password: '', database: 'quasar' }
}
