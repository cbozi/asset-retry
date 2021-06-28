import type { HTMLElementSupported, RetryInfo } from './types'
import { configuration } from './configuration'

const IGNORE_ATTRIBUTE = 'data-resource-retry-ignore'
export function getRetryInfo($target: HTMLElement | HTMLElementSupported): RetryInfo {
  let url: string
  if ($target instanceof HTMLImageElement || $target instanceof HTMLScriptElement) {
    url = $target.src
  } else if ($target instanceof HTMLLinkElement) {
    url = $target.href
  } else {
    return {
      $target: $target,
      shouldRetry: false,
      reason: 'excluded'
    }
  }

  const urlObj = new URL(url, location.href)
  const domain = urlObj.hostname
  return configuration.domainGroups.reduce(
    (result, group) => {
      if (result.shouldRetry) {
        return result
      }
      if (
        (group.selector && !$target.matches(group.selector)) ||
        $target.hasAttribute(IGNORE_ATTRIBUTE)
      ) {
        return {
          shouldRetry: false,
          reason: 'excluded'
        }
      }
      const index = group.domains.indexOf(domain)
      if (index === -1) {
        return result
      } else if (
        index === group.domains.length - 1 ||
        group.lastFailedIndex === group.domains.length - 1
      ) {
        return {
          url,
          $target: $target,
          shouldRetry: false,
          reason: 'reachLast'
        }
      } else {
        group.lastFailedIndex = Math.max(index, group.lastFailedIndex)
        urlObj.hostname = group.domains[group.lastFailedIndex + 1]
        return {
          url,
          $target: $target,
          shouldRetry: true,
          nextUrl: urlObj.href
        }
      }
    },
    {
      shouldRetry: false,
      reason: 'excluded'
    } as RetryInfo
  )
}

function doRetryScript($target: HTMLScriptElement, nextUrl: string) {
  const $newScript = document.createElement('script')
  $newScript.src = nextUrl
  for (let i = 0, attrs = $target.attributes; i < attrs.length; i++) {
    if (attrs[i].name !== 'src') {
      $newScript.setAttribute(attrs[i].name, attrs[i].value)
    }
  }
  document.body.appendChild($newScript)
}

function doRetry(info: RetryInfo & { shouldRetry: true }) {
  const { $target: $target, nextUrl } = info
  if ($target instanceof HTMLScriptElement) {
    doRetryScript($target, nextUrl)
  } else if ('src' in $target) {
    $target.src = nextUrl
  } else {
    $target.href = nextUrl
  }
}

function errorHandler(event: Event): void {
  const $target = event.target
  if (!($target instanceof HTMLElement)) {
    return
  }
  const info = getRetryInfo($target)
  if (info.shouldRetry) {
    doRetry(info)
  } else if (info.reason === 'reachLast') {
    configuration.report(info)
  }
}

export function initRetry(): void {
  window.addEventListener('error', errorHandler, true)
}
