'use strict'

const { createConnection } = require('net')

const client = createConnection(6112, '127.0.0.1')

client.setEncoding('utf8')

client.on('connect', () => {
  client.write(`<policy-file-request/>\0`)
})
client.on('close', () => console.log('Closed'))
client.on('data', (data) => console.log(data))
