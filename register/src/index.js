'use strict'

const config = require('../../config/')

const knex = require('knex')({ client: 'mysql2', connection: config.DATABASE })

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

  password += config.KEY
  password += 'Y(02.>\'H}t":E1'

  password = await createHash('md5').update(password).digest('hex')
  password = password.substring(16) + password.substring(0, 16)

  password = await hash(password, 12)
  password = password.replace('$2a$12$', '$2y$12$')

  return password
}

const registerMiddleware = async () => {
  await app.register(require('fastify-static'), { root: require('path').join(__dirname, 'public') })
  await app.register(require('fastify-formbody'))
}

app.post('/registerPost', async (req, res) => {
  if (Object.keys(req.body).length === 3) {
    let { username, password, color } = req.body

    if (!isNaN(color)) {
      color = parseInt(color)

      if (username.length >= 4 && username.length <= 12 && encodeURIComponent(username) === username) {
        if (password.length >= 4 && password.length <= 12) {
          if (color >= 1 && color <= 13) {
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
    await registerMiddleware()
    await app.listen(config.REGISTER.PORT, config.REGISTER.HOST)

    process.title = 'Quasar@REGISTER'
    console.log('Quasar register listening')
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

start()
