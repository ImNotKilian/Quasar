'use strict'

const { createConnection } = require('net')

const client = createConnection(6112, '127.0.0.1')

client.setEncoding('utf8')

client.on('connect', () => console.log('Connected'))
client.on('close', () => console.log('Closed'))
client.on('data', (data) => console.log(data))
