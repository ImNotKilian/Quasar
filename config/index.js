'use strict'

/**
 * The config object
 * @exports
 */
module.exports = {
  KEY: 'Quasar',

  EXTENSIONS_ENABLED: ['command', 'bot'],
  EXTENSIONS_DISABLED: [],

  PATCHED_ITEMS: [],
  BANNED_IPS: [],

  BUCKET: {
    ENABLED: true,
    MAX_PACKETS_ALLOWED: 50, // When the bucket fills
    CONSUME_RATE: 1, // The rate of consumption
    FILL_RATE: 5 // Amount of seconds the bucket will fill with consume rate
  },

  LOGIN: { HOST: '127.0.0.1', PORT: 6112 },
  WORLD: { HOST: '127.0.0.1', PORT: 9875, MAX: 200 },
  DATABASE: { host: '127.0.0.1', user: 'root', password: '', database: 'quasar' }
}
