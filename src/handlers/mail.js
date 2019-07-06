'use strict'

/**
 * @exports
 */
module.exports = {
  /**
   * Starts the mail engine
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleStartMail: (data, penguin) => {
    if (Object.keys(penguin.mail).length === 0) {
      return penguin.sendXt('mst', 0, 0)
    }

    let unread = 0

    for (const id in penguin.mail) {
      if (!penguin.mail[id].read) {
        unread++
      }
    }

    penguin.sendXt('mst', unread, Object.keys(penguin.mail).length)
  },
  /**
   * Retrieve the mail
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleGetMail: (data, penguin) => {
    if (Object.keys(penguin.mail).length === 0) {
      return penguin.sendXt('mg', '')
    }

    const mailArr = []

    for (const id in penguin.mail) {
      const mail = penguin.mail[id]
      const mailDetails = [mail.senderName, mail.senderId, mail.type, '', mail.date, id]

      mailArr.push(mailDetails.join('|'))
    }

    penguin.sendXt('mg', mailArr.reverse().join('%'))
  },
  /**
   * Send mail
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleSendMail: async (data, penguin) => {
    if (data.length !== 2 || isNaN(data[0]) || isNaN(data[1]) || !penguin.room) {
      return penguin.disconnect()
    }

    const [recipientId, type] = [parseInt(data[0]), parseInt(data[1])]

    if (penguin.coins < 10) {
      return penguin.sendXt('ms', penguin.coins, 2)
    }

    try {
      const penguinObj = await penguin.server.getPenguinById(recipientId)
      const date = Date.now() / 1000 | 0

      if (Object.keys(penguinObj.mail).length > 99) {
        return penguin.sendXt('ms', penguin.coins, 0)
      }

      await penguin.removeCoins(10)
      penguin.sendXt('ms', penguin.coins, 1)

      const id = await penguin.server.database.knex('mail').insert({ recipientId, senderName: penguin.username, senderId: penguin.id, date, type })

      penguinObj.sendXt('mr', penguin.username, penguin.id, type, '', date, id[0])
      penguinObj.mail[id[0]] = {
        senderId: penguin.id,
        senderName: penguin.username,
        recipientId: penguinObj.id,
        type: type,
        date: date,
        read: false
      }
    } catch (err) {
      penguin.disconnect()
    }
  },
  /**
   * Set mail to checked
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleCheckMail: async (data, penguin) => {
    if (!penguin.room) {
      return penguin.disconnect()
    }

    await penguin.server.database.knex('mail').update('read', 1).where('recipientId', penguin.id)
    penguin.sendXt('mc')
  },
  /**
   * Delete mail
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleDeleteMail: async (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0]) || !penguin.room) {
      return penguin.disconnect()
    }

    const id = parseInt(data[0])

    if (penguin.mail[id]) {
      delete penguin.mail[id]
      await penguin.server.database.knex('mail').where({ id }).del()

      penguin.sendXt('md', id)
    }
  },
  /**
   * Delete mail from penguin
   * @param {Array} data
   * @param {Penguin} penguin
   */
  handleDeleteMailFromPenguin: async (data, penguin) => {
    if (data.length !== 1 || isNaN(data[0]) || !penguin.room) {
      return penguin.disconnect()
    }

    const senderId = parseInt(data[0])

    await penguin.server.database.knex('mail').where('recipientId', penguin.id).andWhere({ senderId }).del()

    for (const id in penguin.mail) {
      const mail = penguin.mail[id]

      if (mail.senderId === senderId) {
        delete penguin.mail[id]
      }
    }

    penguin.sendXt('mdp', Object.keys(penguin.mail).length)
  }
}
