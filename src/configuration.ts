import type { DomainGroup, RetryInfo, ReportFn } from './types'

declare global {
  interface Window {
    __RESOURCE_RETRY_CONFIGURATION__?: Configuration
  }
}

const SUBDOMAIN_REGX = /^([\w-]+)(\.[\w-.]+)?$/

class Configuration {
  domainGroups: DomainGroup[] = []
  reportFns: ReportFn[] = []
  reportInfosCache: RetryInfo[] = []

  addRetryDomain(domains: string[], selector?: string): void
  addRetryDomain(baseDomain: string, domainsCount: number, selector?: string): void
  addRetryDomain(
    domain: string | string[],
    countOrSelector?: number | string,
    selector?: string
  ): void {
    let domains: string[] = []
    if (typeof domain === 'string' && typeof countOrSelector === 'number') {
      const count = countOrSelector
      const match = domain.match(SUBDOMAIN_REGX)
      if (!match) {
        console.warn(`[@yuanfudao/resource-retry]: ${domain} is not a valid domain`)
        return
      }
      const subdomain = match[1]
      const restPart = match[2] || '.fbcontent.cn'
      domains = []
      for (let i = 0; i < count; i++) {
        domains.push(`${subdomain}${i || ''}${restPart}`)
      }
    } else if (Array.isArray(domain)) {
      domains = Array.from(domain)
      if (typeof countOrSelector === 'string') {
        selector = countOrSelector
      }
    } else {
      console.warn(`[@yuanfudao/resource-retry]: addRetryDomain received unexpected arguments`)
      return
    }

    this.domainGroups.push({
      domains,
      lastFailedIndex: -1,
      selector
    })
  }

  registerReportFn(fn: ReportFn): void {
    if (this.reportFns.length === 0) {
      this.reportInfosCache.forEach((info) => fn(info))
      this.reportFns = []
    }
    this.reportFns.push(fn)
  }

  report(info: RetryInfo): void {
    if (this.reportFns.length === 0) {
      this.reportInfosCache.push(info)
    }
    this.reportFns.forEach((fn) => fn(info))
  }
}

const configuration = window.__RESOURCE_RETRY_CONFIGURATION__
  ? window.__RESOURCE_RETRY_CONFIGURATION__
  : new Configuration()
window.__RESOURCE_RETRY_CONFIGURATION__ = configuration

export { configuration, Configuration }
