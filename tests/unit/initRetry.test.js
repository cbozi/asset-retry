import { getRetryInfo } from '../../src/initRetry'
import { configuration } from '../../src/configuration'

describe('initRetry', () => {
  describe('getRetryInfo', () => {
    beforeAll(() => {
      configuration.addRetryDomain(['blocked.cdn.com', 'a1.cdn.com', 'a2.cdn.com'])
      configuration.addRetryDomain(['a.example.com', 'b.example.com'])
    })
    it('returns should retry when domain match', async () => {
      const $target = document.createElement('img')

      $target.src = '/path/to/image.png'
      const info = getRetryInfo($target)
      expect(info.shouldRetry).toBe(true)
      expect(info.nextUrl).toBe('https://b.example.com/path/to/image.png')

      $target.src = 'https://blocked.cdn.com/path/to/image.png'
      const info1 = getRetryInfo($target)
      expect(info.shouldRetry).toBe(true)
      expect(info1.nextUrl).toBe('https://a1.cdn.com/path/to/image.png')
    })

    it('only include elements matched by selector if selector is provided', () => {
      const $target = document.createElement('img')
      $target.src = 'https://blocked.cdn.com/path/to/image.png'
      $target.classList.add('included')
      document.body.appendChild($target)
      configuration.domainGroups[0].selector = '.included'
      expect(getRetryInfo($target).shouldRetry).toBe(true)
      $target.classList.remove('included')
      const info = getRetryInfo($target)
      expect(info.shouldRetry).toBe(false)
      expect(info.reason).toBe('excluded')

      configuration.domainGroups[0].selector = undefined
    })

    it('ignores element which has data-resource-retry-ignore attribute', () => {
      const $target = document.createElement('img')
      $target.src = 'https://blocked.cdn.com/path/to/image.png'
      $target.setAttribute('data-resource-retry-ignore', '')
      const info = getRetryInfo($target)
      expect(info.shouldRetry).toBe(false)
      expect(info.reason).toBe('excluded')
    })

    it('skips failed domains', () => {
      const $target = document.createElement('img')
      $target.src = 'https://blocked.cdn.com/path/to/image.png'
      getRetryInfo($target)
      $target.src = 'https://a1.cdn.com/path/to/image.png'
      getRetryInfo($target)
      $target.src = 'https://blocked.cdn.com/path/to/image.png'
      const info = getRetryInfo($target)
      expect(info.nextUrl).toBe('https://a2.cdn.com/path/to/image.png')
    })

    it("returns shouldn't retry when reached last domain", () => {
      const $target = document.createElement('img')
      $target.src = 'https://a2.cdn.com/path/to/image.png'
      const info = getRetryInfo($target)
      expect(info.shouldRetry).toBe(false)
      expect(info.reason).toBe('reachLast')
    })
  })
})
