const puppeteer = require('puppeteer')
const resources = require('./resources.json')

module.exports = {
  help: "!google [arg1(,arg2,...)]: Counts the number of google hits an image gets from a google reverse image search",
  run: async function (client, message, args, logger) {
    logger.info("!google summoned")

    var theurl = args[0]

    if (!(theurl.startsWith('https://')) || resources.imagefiletypes.indexOf(theurl.split('.').pop()) == -1) {
      logger.info('Invalid link')
      message.reply('Please use a valid url resource (.png,.gif,.jpg,.mp3,.mp4)')
      return
    }

    if (!this.browser) {
      this.browser = await puppeteer.launch({
        ignoreHTTPSErrors: true,
        headless: true,
        timeout: 10000,
        handleSIGHUP: true
      })
    }

    const page = await this.browser.newPage()

    await page.goto(resources.googleimage)

    await page.click('a.gsst_a')

    await page.$eval('input#qbui.lst.ktf', (el, theurl) => { el.value = theurl }, theurl)

    await Promise.all([
      page.click("input.gbqfb.kpbb"),
      page.waitForNavigation()
    ])

    var pages = await page.$eval('table#nav', el => el.rows[0].cells.length - 2)

    var resulturl = ''
    if (pages !== 0) {
      resulturl = await page.$$eval('div#rso ._NId', el => el[2].childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].href)
    }

    var googlereply = ''

    if (pages >= 10) {
      googlereply += "Over 100 results found!"
    }
    else if (pages == 0) {
      googlereply += "No results found!"
    }
    else {
      googlereply += `~ ${pages * 10} results found.`
    }
    if (resulturl) {
      googlereply += '\n' + resulturl
    }
    message.reply(googlereply)
    logger.info(`${pages * 10} results found`)
    page.close()
  }
}
