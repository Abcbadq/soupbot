const resources = require("./resources.json")
const snekfetch = require('snekfetch')

module.exports = {
    help: "!price [args1]: Runs a search on the price of the item in standard challenge league",
    run: async function (client, message, args, logger) {
        logger.info("!price summoned")

        if (args.length == 0) {
            return;
        }

        const leagues = await snekfetch.get(resources.gggleaguelist)
            .then((x) => { return x.body })
        const leaguename = leagues[4].id
        const uniquelinks = resources.ninjalinks.map(link => `${link}?League=${leaguename}`)

        function reduce(wordarray) {
            return wordarray.map(word => word.toLowerCase())
                .filter(word => resources.commonconnectorwords.indexOf(word) == -1)
                .join(" ").replace(/[^a-z]/g, '')
        }
        var iteminput = reduce(args)
        var itemsearch

        for (var i = 0; i < uniquelinks.length && !itemsearch; i++) {
            const uniquepage = await snekfetch.get(uniquelinks[i])
                .then((x) => { return x.body.lines })
            for (var itemnumber = 0; itemnumber < uniquepage.length; itemnumber++) {
                if (reduce(uniquepage[itemnumber].name.toLowerCase().split(" ")) == iteminput) {
                    itemsearch = uniquepage[itemnumber]
                }
            }
        }
        if (itemsearch) {
            message.reply(`${itemsearch.name} is ${itemsearch.chaosValue}c`)
        }
        else {
            message.reply("Item is unknown or has no value")
        }
    }
}