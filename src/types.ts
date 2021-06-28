export interface DomainGroup {
  domains: string[]
  lastFailedIndex: number
  selector?: string
}
export type HTMLElementSupported =
  | HTMLImageElement
  | HTMLScriptElement
  | HTMLLinkElement
export type RetryInfo =
  | {
      shouldRetry: false
      url?: string
      $target?: HTMLElement
      reason: 'excluded' | 'reachLast'
    }
  | {
      shouldRetry: true
      url: string
      $target: HTMLElementSupported
      nextUrl: string
    }
export type ReportFn = (info: RetryInfo) => void
