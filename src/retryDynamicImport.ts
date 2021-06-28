import { configuration } from './configuration'

declare let __webpack_public_path__: string

interface InnerOpts {
  originalPublicPath?: string
  lastPublicPath?: string
}

export function retryDynamicImport<M = unknown>(
  importFn: () => Promise<M>,
  { originalPublicPath, lastPublicPath }: InnerOpts = {}
): Promise<M> {
  return importFn().catch((e) => {
    const publicPath = lastPublicPath || __webpack_public_path__
    originalPublicPath = originalPublicPath || publicPath
    const url = new URL(publicPath, location.href)
    const domain = url.host

    const group = configuration.domainGroups.filter((group) => {
      const index = group.domains.indexOf(domain)
      group.lastFailedIndex = Math.max(index, group.lastFailedIndex)
      return index !== -1 && group.lastFailedIndex !== group.domains.length
    })[0]
    if (group) {
      const nextDomain = group.domains[group.lastFailedIndex + 1]
      url.host = nextDomain
      const nextPublicPath = url.href
      __webpack_public_path__ = nextPublicPath
      const retryPromise = retryDynamicImport(importFn, {
        originalPublicPath,
        lastPublicPath: nextPublicPath
      })
      __webpack_public_path__ = originalPublicPath
      return retryPromise
    }

    throw e
  })
}
