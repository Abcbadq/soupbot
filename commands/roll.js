const resources = require('./resources.json')
const specialmenu = ['coin', 'color', 'toast']
module.exports = {

  help: "!roll [arg1(,arg2)]: Rolls a dice.\n If one arg it will roll between 1-arg1 inclusive.\n If two args it will roll between arg1-arg2 inclusive",
  run: function (clients, message, args, logger) {
    logger.info('!roll summoned')
    if (args.length == 0 || args.length > 2) {
      return
    }
    if (args.length == 1) {
      if (args[0].toLowerCase() == 'specialmenu') {
        message.reply(specialmenu.join(','))
        return
      }
      else if (specialmenu.indexOf(args[0]) !== -1) {
        switch (specialmenu.indexOf(args[0])) {
          case (0):
            if (Math.random <= .5) {
              message.reply('Heads')
            }
            else {
              message.reply('Tails')
            }
            break;
          case (1):
            message.reply(resources.colors[Math.floor(Math.random() * resources.colors.length)])
            break;
          case (2):
            if (message.author.username == 'tralamazza') {
              message.reply('Jam side down')
            }
            else {
              message.reply('Jam side up')
            }
            break;
        }
        return
      }
      else {
        args.unshift('1')
      }
    }
    const newargs = args.map((x) => {
      try {
        return parseInt(x)
      }
      catch (err) {
        return NaN
      }
    })
    if (!(args[0] + args[2])) {
      message.reply('An input is NaN')
    }
    else if (newargs[0] == newargs[1]) {
      message.reply(newargs[0])
    }
    else {
      message.reply(Math.floor(Math.random() * (newargs[1] - newargs[0] + 1)) + newargs[0])
    }
  }
}
