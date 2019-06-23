'use strict'

/**
 * Validate the server type
 * @throws {Error}
 */
const validateType = () => {
  if (!process.argv[2]) throw new Error('Missing server type')

  const type = process.argv[2].toUpperCase()

  if (type !== 'LOGIN' && type !== 'WORLD') throw new Error('Invalid server type')
}

/**
 * Validate the server config
 * @throws {Error}
 */
const validateServerConfig = () => {
  if (!config.LOGIN) throw new Error('Missing login config')
  if (!config.WORLD) throw new Error('Missing world config')

  if (!config.LOGIN.HOST) throw new Error('Missing host for login')
  if (!config.LOGIN.PORT) throw new Error('Missing port for login')
  if (!config.WORLD.HOST) throw new Error('Missing host for world')
  if (!config.WORLD.PORT) throw new Error('Missing port for world')

  if (isNaN(config.LOGIN.PORT)) throw new Error('Invalid port for login')
  if (isNaN(config.WORLD.PORT)) throw new Error('Invalid port for world')

  if (config.LOGIN.PORT <= 1023) throw new Error('Invalid port range for login')
  if (config.WORLD.PORT <= 1023) throw new Error('Invalid port range for world')

  if (config.LOGIN.PORT === config.WORLD.PORT) throw new Error('Invalid port duplication')

  if (!config.LOGIN.MAX) throw new Error('Missing max for login')
  if (!config.WORLD.MAX) throw new Error('Missing max for world')

  if (isNaN(config.LOGIN.MAX)) throw new Error('Invalid max for login')
  if (isNaN(config.WORLD.MAX)) throw new Error('Invalid max for world')

  if (config.LOGIN.MAX <= 0) throw new Error('Invalid max range for login')
  if (config.WORLD.MAX <= 0) throw new Error('Invalid max range for world')
}

/**
 * Validate the database config
 * @throws {Error}
 */
const validateDatabaseConfig = () => {
  if (!config.DATABASE) throw new Error('Missing database config')

  if (!config.DATABASE.host) throw new Error('Missing host for database')
  if (!config.DATABASE.user) throw new Error('Missing user for database')
  if (!config.DATABASE.hasOwnProperty('password')) throw new Error('Missing password for database')
  if (!config.DATABASE.database) throw new Error('Missing database name for database')
}

try {
  global.serverType = process.argv[2].toUpperCase()
  global.logger = require('./utils/logger')
  global.config = require('../config/')

  validateType()
  validateServerConfig()
  validateDatabaseConfig()
} catch (err) {
  logger.error(`An error has occurred whilst starting Quasar: ${err.message}`)
  process.exit(1)
} finally {
  process.title = `Quasar@${process.argv[2].toUpperCase()}`

  const threads = require('os').cpus().length
  const { isMaster, fork } = require('cluster')

  if (isMaster) {
    for (let i = 0; i < threads; i++) {
      fork().send({ doLog: i === 0 })
    }
  } else {
    process.on('message', (message) => {
      if (message.doLog) {
        new (require('./server'))
      }
    })
  }
}
