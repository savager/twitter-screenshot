const puppeteer = require('puppeteer')
const puppeteerExtra = require('puppeteer-extra')
const pluginStealth = require('puppeteer-extra-plugin-stealth')
const imageminPngquant = require('imagemin-pngquant')

const selector = "article[data-testid][tabindex='-1']"
const mediaSelector =
  'article[data-testid][tabindex="-1"] div[data-testid="tweetPhoto"]'

;(async () => {
 
  puppeteerExtra.use(pluginStealth())
  const browser = await puppeteer.launch({ headless: false })
  try {
    const page = await browser.newPage()
    page.setViewport({
      width: 3600,
      height: 2400
    })
    await page.emulateMediaFeatures([
      {
        name: 'prefers-color-scheme',
        value: 'light'
      }
    ])
    await page.goto('https://twitter.com/NathieVR/status/1588988665564647427')

    await page.waitForSelector(mediaSelector)

    const rect = await page.evaluate(selector => {
      const element = document.querySelector(selector)
      const { x, y, width, height } = element.getBoundingClientRect()
      return { left: x, top: y, width, height, id: element.id }
    }, selector)

    await page.screenshot({
      clip: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      },
      path: 'test.png'
    })

    const imagemin = await import('imagemin').then( async imagemin => {
      console.log(imagemin)
      await imagemin.default(['test.png'], {
        destination: './',
        plugins: [imageminPngquant()]
      })
    })

  } catch (e) {
    console.log(e)
  } finally {
    await browser.close()
  }
})()
