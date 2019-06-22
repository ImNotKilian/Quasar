'use strict'

/**
 * Validate the server type
 * @param {String} type
 * @throws {Error}
 */
const validateType = (type) => {
  if (!type) {
    throw new Error('Missing server type.')
  }

  type = type.toUpperCase()

  if (type !== 'LOGIN' && type !== 'WORLD') {
    throw new Error('Invalid server type.')
  }
}

/**
 * Validate the server config
 * @throws {Error}
 */
const validateServerConfig = () => {
  if (!config.LOGIN || !config.WORLD) {
    const type = !config.LOGIN ? 'login' : 'world'

    throw new Error(`Missing config for ${type}.`)
  }

  const mustHaveProps = ['HOST', 'PORT']

  for (let i = 0; i < mustHaveProps.length; i++) {
    const mustHaveProp = mustHaveProps[i]

    if (isNaN(config.LOGIN.PORT) || isNaN(config.WORLD.PORT)) {
      const type = isNaN(config.LOGIN.PORT) ? 'login' : 'world'

      throw new Error(`The config property port must be a number for ${type}.`)
    }

    if (!config.LOGIN[mustHaveProp] || !config.WORLD[mustHaveProp]) {
      const type = config.LOGIN[mustHaveProp] ? 'login' : 'world'

      throw new Error(`Missing config property ${mustHaveProp} for ${type}.`)
    }
  }
}

/**
 * Validate the database config
 * @throws {Error}
 */
const validateDatabaseConfig = () => {
  if (!config.DATABASE) {
    throw new Error('Missing database config.')
  }

  const db = config.DATABASE
  const mustHaveProps = ['host', 'user', 'password', 'database']

  for (let i = 0; i < mustHaveProps.length; i++) {
    const mustHaveProp = mustHaveProps[i]

    if (!db.hasOwnProperty(mustHaveProp)) {
      throw new Error(`Missing database config property ${mustHaveProp}.`)
    }
  }

  if (db.password === '') {
    logger.info('Quasar has detected an empty database password.')
  }
}

try {
  global.logger = require('./utils/logger')
  global.config = require('../config/')

  validateType(process.argv[2])
  validateServerConfig()
  validateDatabaseConfig()
} catch (err) {
  logger.error(`An error has occurred whilst starting Quasar: ${err.message}`)
  process.exit(1)
} finally {
  process.title = `Quasar@${process.argv[2].toUpperCase()}`
}
