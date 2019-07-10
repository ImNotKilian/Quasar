'use strict'

const { DATABASE, KEY, REGISTER } = require('../../config/')
const knex = require('knex')({ client: 'mysql2', connection: DATABASE })
const { hash } = require('bcryptjs')
const { createHash } = require('crypto')
const app = require('fastify')()

/**
 * Hashes a password
 * @param {String} password
 * @returns {String}
 */
const hashPassword = async (password) => {
  password = await createHash('md5').update(password).digest('hex').toUpperCase()
  password = password.substring(16) + password.substring(0, 16)

  password += KEY
  password += 'Y(02.>\'H}t":E1'

  password = await createHash('md5').update(password).digest('hex')
  password = password.substring(16) + password.substring(0, 16)

  password = await hash(password, 12)
  password = password.replace('$2a$12$', '$2y$12$')

  return password
}

app.post('/registerPost', async (req, res) => {
  if (Object.keys(req.body).length === 3) {
    let { username, password, color } = req.body

    if (!isNaN(color)) {
      color = parseInt(color)

      const matches = username.match(/^[a-zA-Z0-9 ]+$/)
      const allowedColors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15]

      if (username.length >= 4 && username.length <= 12 && matches) {
        if (password.length >= 4 && password.length <= 12) {
          if (allowedColors.indexOf(color) > -1) {
            try {
              password = await hashPassword(password)

              await knex('penguins').insert({ username, password, color })

              res.code(200).send('Your penguin is registered')
            } catch (err) {
              res.code(200).send('That username already exists')
            }
          }
        }
      }
    }
  }
})

const start = async () => {
  try {
    if (!KEY) throw new Error('Missing server key')

    if (!DATABASE) throw new Error('Missing database config')
    if (!DATABASE.host) throw new Error('Missing host for database')
    if (!DATABASE.user) throw new Error('Missing user for database')
    if (!DATABASE.hasOwnProperty('password')) throw new Error('Missing password for database')
    if (!DATABASE.database) throw new Error('Missing database name for database')

    if (!REGISTER) throw new Error('Missing register config')
    if (!REGISTER.HOST) throw new Error('Missing host for register')
    if (!REGISTER.PORT) throw new Error('Missing port for register')

    await app.register(require('fastify-static'), { root: require('path').join(__dirname, 'public') })
    await app.register(require('fastify-formbody'))

    await app.listen(REGISTER.PORT, REGISTER.HOST, (err, addr) => console.log(`Quasar register listening on ${addr}`))

    process.title = 'Quasar@REGISTER'
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

start()
