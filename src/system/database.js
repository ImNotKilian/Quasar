'use strict'

/**
 * @exports
 * @class
 */
module.exports = class Database {
  /**
   * @constructor
   */
  constructor() {
    /**
     * Create the connection
     */
    this.knex = require('knex')({
      client: 'mysql2',
      connection: config.DATABASE,
      pool: { min: 0, max: 10 }
    })
  }
}
