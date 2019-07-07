'use strict'

/**
 * Class handlers
 * @constant
 */
const classHandlers = {}

/**
 * Xt packets
 * @constant
 */
const xtHandlers = {
  's': {
    'j#js': { klass: 'navigation', func: 'handleJoinServer' },
    'j#jr': { klass: 'navigation', func: 'handleJoinRoom' },
    'j#jp': { klass: 'navigation', func: 'handleJoinPlayer' },
    'j#grs': { klass: 'navigation', func: 'handleRoomRefresh' },

    'u#h': { klass: 'penguin', func: 'handleHeartBeat' },
    'u#sp': { klass: 'penguin', func: 'handleSendPosition' },
    'u#sb': { klass: 'penguin', func: 'handleSendSnowball' },
    'u#se': { klass: 'penguin', func: 'handleSendEmote' },
    'u#sf': { klass: 'penguin', func: 'handleSendFrame' },
    'u#ss': { klass: 'penguin', func: 'handleSendSafeMessage' },
    'u#sa': { klass: 'penguin', func: 'handleSendAction' },
    'u#sg': { klass: 'penguin', func: 'handleSendGuide' },
    'u#sj': { klass: 'penguin', func: 'handleSendJoke' },
    'u#sma': { klass: 'penguin', func: 'handleSendMascotMessage' },
    'u#sl': { klass: 'penguin', func: 'handleSendLine' },
    'u#sq': { klass: 'penguin', func: 'handleSendQuickMessage' },
    'u#glr': { klass: 'penguin', func: 'handleGetLatestRevision' },
    'm#sm': { klass: 'penguin', func: 'handleSendMessage' },
    'r#cdu': { klass: 'penguin', func: 'handleCoinDigUpdate' },

    'i#gi': { klass: 'inventory', func: 'handleGetInventory' },
    'i#ai': { klass: 'inventory', func: 'handleAddItem' },
    'u#gp': { klass: 'inventory', func: 'handleGetPenguin' },
    's#upc': { klass: 'inventory', func: 'handleUpdateClothing' },
    's#uph': { klass: 'inventory', func: 'handleUpdateClothing' },
    's#upf': { klass: 'inventory', func: 'handleUpdateClothing' },
    's#upn': { klass: 'inventory', func: 'handleUpdateClothing' },
    's#upb': { klass: 'inventory', func: 'handleUpdateClothing' },
    's#upa': { klass: 'inventory', func: 'handleUpdateClothing' },
    's#upe': { klass: 'inventory', func: 'handleUpdateClothing' },
    's#upl': { klass: 'inventory', func: 'handleUpdateClothing' },
    's#upp': { klass: 'inventory', func: 'handleUpdateClothing' },

    'n#gn': { klass: 'ignore', func: 'handleGetIgnored' },
    'n#an': { klass: 'ignore', func: 'handleAddIgnore' },
    'n#rn': { klass: 'ignore', func: 'handleRemoveIgnore' },

    'b#gb': { klass: 'buddy', func: 'handleGetBuddies' },
    'b#ba': { klass: 'buddy', func: 'handleAddBuddy' },
    'b#br': { klass: 'buddy', func: 'handleBuddyRequest' },
    'b#rb': { klass: 'buddy', func: 'handleBuddyRemove' },
    'b#bf': { klass: 'buddy', func: 'handleFindBuddy' },

    'o#m': { klass: 'moderation', func: 'handleMute' },
    'o#k': { klass: 'moderation', func: 'handleKick' },
    'o#b': { klass: 'moderation', func: 'handleBan' },

    'l#mst': { klass: 'mail', func: 'handleStartMail' },
    'l#mg': { klass: 'mail', func: 'handleGetMail' },
    'l#ms': { klass: 'mail', func: 'handleSendMail' },
    'l#mc': { klass: 'mail', func: 'handleCheckMail' },
    'l#md': { klass: 'mail', func: 'handleDeleteMail' },
    'l#mdp': { klass: 'mail', func: 'handleDeleteMailFromPenguin' },

    't#at': { klass: 'toy', func: 'handleAddToy' },
    't#rt': { klass: 'toy', func: 'handleRemoveToy' }
  },

  'z': {
    'zo': { klass: 'multiplayer', func: 'handleGameOver' }
  }
}

/**
 * Blacklisted xt packets
 * @constant
 */
const xtBlacklist = ['f#epfga', 'f#epfgr', 'f#epfgf']

/**
 * Xml packets
 * @constant
 */
const xmlHandlers = {
  verChk: 'handleVersionCheck',
  rndK: 'handleRandomKey',
  login: 'handleLogin'
}

/**
 * @exports
 * @class
 * @static
 */
module.exports = class Network {
  /**
   * Loads the handlers
   * @param {Function} callback
   */
  static async loadHandlers(callback) {
    const dir = `${process.cwd()}\\src\\handlers\\`

    try {
      if (serverType === 'LOGIN') {
        classHandlers['xml'] = require(`${dir}xml.js`)
      } else {
        const readdirAsync = require('util').promisify(require('fs').readdir)
        const handlers = await readdirAsync(dir)

        for (let i = 0; i < handlers.length; i++) {
          classHandlers[handlers[i].split('.')[0]] = require(`${dir}${handlers[i]}`)
        }
      }
    } catch (err) {
      logger.error(`An error has occurred whilst reading the handlers: ${err.message}`)
      process.kill(process.pid)
    } finally {
      callback(Object.keys(classHandlers).length)
    }
  }

  /**
   * Handles incoming data
   * @param {String} data
   * @param {Penguin} penguin
   */
  static handleData(data, penguin) {
    data = data.toString().split('\0')[0]

    const firstChar = data.charAt(0)
    const lastChar = data.charAt(data.length - 1)

    if (firstChar === '<' && lastChar === '>') {
      if (data === '<policy-file-request/>') {
        return penguin.send(`<cross-domain-policy><allow-access-from domain='*' to-ports='*' /></cross-domain-policy>`)
      }

      let action

      try {
        action = data.split(`='`)[2].split(`'`)[0]
      } catch (err) {
        penguin.disconnect()
      } finally {
        if (!xmlHandlers[action]) {
          logger.error(`Unknown xml data: ${data}`)
        } else {
          logger.incoming(data)

          classHandlers['xml'][xmlHandlers[action]](data, penguin)
        }
      }
    } else if (firstChar === '%' && lastChar === '%' && serverType === 'WORLD') {
      let xt, type, handler

      try {
        xt = data.split('%')

        if (xt.shift() === '' && xt.pop() === '' && xt.shift() === 'xt') {
          type = xt.shift()
          handler = xt.shift()

          xt.shift()
        } else {
          throw new Error('Incorrect data')
        }
      } catch (err) {
        penguin.disconnect()
      } finally {
        if (xtBlacklist.indexOf(handler) > -1) {
          return
        }

        if (!xtHandlers[type][handler]) {
          logger.error(`Unknown xt data: ${data}`)
        } else {
          logger.incoming(data)

          const { klass, func } = xtHandlers[type][handler]

          if (func.toString() === 'handleUpdateClothing') {
            xt.push(handler.split('#')[1])
          }

          classHandlers[klass][func](xt, penguin)
        }
      }
    } else {
      penguin.disconnect()
    }
  }
}
