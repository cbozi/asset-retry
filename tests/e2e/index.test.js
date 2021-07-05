const jestPuppeteerConfig = require('../jest-puppeteer.config')

describe('Retry', () => {
  beforeAll(async () => {
    await page.setRequestInterception(true)
    page.on('request', (request) => {
      const urlObj =new URL(request.url()) 
      if (urlObj.hostname === 'blocked.cdn.com' && urlObj.pathname !== '/') {
        request.abort()
      } else {
        request.continue()
      }
    })
    await page.goto('http://blocked.cdn.com/')
  })

  it('should retry img load error', async () => {
    const imgSrc = await page.$eval('#test-img', ($img) => $img.src)
    expect(imgSrc).toMatch(/fallback.cdn.com/)
  })

  it('should retry style load error', async () => {
    const isStyleLoaded = await page.$eval(
      'h1',
      ($el) => getComputedStyle($el).color === 'rgb(255, 0, 0)'
    )
    expect(isStyleLoaded).toBe(true)
  })

  it('should retry script load error', async () => {
    const isScriptLoaded = await page.$eval('#test-script', ($el) => !!$el)
    expect(isScriptLoaded).toBe(true)
  })

  it('should retry dynamic import load error', async () => {
    const testButton = await page.waitForSelector('#test-button')
    await testButton.click()
    const loaded = await page.waitForSelector('#test-dynamic-import')
    expect(!!loaded).toBe(true)
  })
})
