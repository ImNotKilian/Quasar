'use strict'

const { createConnection } = require('net')

const client = createConnection(6112, '127.0.0.1')

client.setEncoding('utf8')

client.on('connect', () => {
  client.write(`<msg t='sys'><body action='verChk' r='0'><ver v='153' /></body></msg>\0`)
  //client.write(`%xt%s%j#js%-1%Hi%\0`) on port 6113
})
client.on('close', () => console.log('Closed'))
client.on('data', (data) => console.log(data))
