const fs = require('fs')
const path = require('path')
const util = require('util')

const dir = util.promisify(fs.readdir)

module.exports = {
  run: async function (clients, message, args, logger) {
    logger.info('!help summoned')
    var culled = []
    if (args.length == 0) {
      var allcommandfiles = await dir('./commands')
      culled = allcommandfiles
        .filter(x => path.extname(x) == '.js')
        .map(x => '!' + path.basename(x, '.js'))
        .filter(x => x !== '!help')
      culled.unshift("Command List:")
    }
    else {
      culled = args.map((x) => {
        try {
          return require(`./${x}.js`).help
        } catch (err) {
          return '!' + x + ' command unknown'
        }
      })
      culled.unshift('Command Help List:')
    }
    message.reply(culled)
  }
}
