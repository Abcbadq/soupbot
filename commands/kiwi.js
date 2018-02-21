const resources = require("./resources.json")
const snekfetch = require('snekfetch')

module.exports = {
    help: "!kiwi (update, outuput line amount): Finds profit made from buying a div card.",
    run: async function (client, message, args, logger) {

        logger.info('!kiwi summoned')

        const leaguename = await snekfetch.get(resources.gggleaguelist).then(x => x.body[4].id)

        const alldivcard = await snekfetch.get(`${resources.ninjalinks[0]}?League=${leaguename}`).then(x => x.body.lines)

        const allcurrency = await snekfetch.get(`${resources.ninjalinks[1]}?League=${leaguename}`).then(x => x.body.lines)

        var alluniques
        for (var i = 0; i < resources.ninjalinks.length; i++) {
            const pageofuniques = await snekfetch.get(`${resources.ninjalinks[i]}?League=${leaguename}`).then(x => x.body.lines)
            if (!alluniques) {
                alluniques = pageofuniques
            }
            else {
                alluniques = alluniques.concat(pageofuniques)
            }
        }

        /**
         * @param {Object} card Needs to have name, stackSize, chaosValue, and explicitModifiers.
         * @return {Object} Returns a new card object with relavent information kept. Will return undefined if necessary variables aren't found. 
         **/
        function stripcard(card) {
            if (typeof card.name == 'undefined' ||
                typeof card.stackSize == 'undefined' ||
                typeof card.chaosValue == 'undefined' ||
                typeof card.explicitModifiers == 'undefined') {
                console.log(`${card.name} is invalid`)
                return
            }
            const rewardtext = card.explicitModifiers[0].text
            var acard = {
                name: card.name,
                stackSize: parseInt(card.stackSize),
                cost: parseFloat(card.chaosValue).toFixed(2),
                type: rewardtext.slice(1, rewardtext.indexOf(">")),
                reward: rewardtext.slice(rewardtext.indexOf("{") + 1, rewardtext.indexOf("}")),
                quantity: 1
            }
            if (acard.type == 'currencyitem' && acard.type.indexOf('x ') >= 0) {
                acard.quantity = parseInt(acard.reward.slice(0, acard.reward.indexOf('x ')))
                acard.reward = acard.reward.slice(acard.reward.indexOf(' ') + 1)
            }
            return acard
        }

        function getitem(card) {
            var item
            if (card.type == 'currencyitem') {
                item = allcurrency.find(function (el) {
                    return card.reward == el.currencyTypeName
                })
                if (item) {
                    return { name: item.currencyTypeName, cost: parseFloat(item.chaosEquivalent).toFixed(2) }
                }
            }
            else if (card.type == 'divination') {
                item = alldivcard.find(function (el) {
                    return card.reward == el.name
                })

                if (item) {
                    return { name: item.name, cost: parseFloat(item.chaosValue).toFixed(2) }
                }
            }
            else if (card.type == 'uniqueitem') {
                item = alluniques.find(function (el) {
                    return card.reward == el.name && (typeof el.links == 'undefined' || ((el.links <= 4 && el.name !== 'Tabula Rasa') || (el.links == 6 && el.name == 'Tabula Rasa')))
                })

                if (item) {
                    return { name: item.name, cost: parseFloat(item.chaosValue).toFixed(2) }
                }
            }
        }

        function update(cardlist) {
            return cardlist.map((card) => {
                const thecard = stripcard(card)
                if (!thecard) {
                    return
                }
                const item = getitem(thecard)
                if (item) {
                    return { card: thecard, item: item }
                }
            }).filter(x => typeof x !== undefined)
        }

        if (!validcards || args[0] == 'update') {
            var validcards = update(alldivcard).filter(x => typeof x !== 'undefined')
            setInterval(() =>{
                validcards = undefined
            },resources.kiwitimeout)
        }

        validcards = validcards.map((x) => {
            return {
                name: `${x.card.name} (${x.item.name})`,
                value: parseFloat((x.item.cost * x.card.quantity - x.card.cost * x.card.stackSize) / x.card.stackSize).toFixed(2)
            }
        })

        validcards = validcards.sort(function (a, b) {
            return b.value - a.value
        })

        var outputsize = 5
        const sizerequest = parseInt(args[0])
        if (sizerequest > 0) {
            if(sizerequest > 20){
                outputsize = 20
            }
            else{
                outputsize = sizerequest
            }
        }
        message.reply(validcards.slice(0, outputsize).map(x => `${x.name} is worth ${x.value} c profit`))
    }
}