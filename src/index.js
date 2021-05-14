'use strict'
const SUBDOMAIN_REGX = /^([\w-]+)(\.[\w-.]+)?$/
const retryDomains = []
const reportFns = []

function retry(target) {
    // TODO: script的加载错误仍需要自行处理。为了避免冲突，忽略script加载错误的处理。
    if (target.tagName === 'SCRIPT') {
        return
    }

    const attr = target.src ? 'src' : target.href ? 'href' : ''
    const url = target[attr]
    let index = retryDomains.length

    while (index--) {
        const domain = retryDomains[index]
        const match = url.match(domain.regexp)

        if (match) {
            if (domain.selector && !target.matches(domain.selector)) {
                continue
            }

            let retryTimes = parseInt(target.dataset.retryTimes || '', 10) || 0
            if (retryTimes >= domain.count) {
                return
            }
            domain.cur = (domain.cur + 1) % domain.count
            const newSrc = url.replace(
                match[0],
                `${domain.subdomain}${domain.cur || ''}${domain.domain}`
            )
            target[attr] = newSrc
            target.dataset.retryTimes = String(++retryTimes)
            return true
        }
    }
    return false
}

function handleErrorEvent(evt) {
    const target = evt.target
    if (!target) {
        return
    }

    const attr = target.src ? 'src' : target.href ? 'href' : ''
    if (attr) {
        if (retry(target)) {
            evt.stopPropagation()
        } else {
            reportFns.forEach((fn) => {
                if (typeof fn === 'function') {
                    fn(target, evt)
                }
            })
        }
    }
}

/**
 * @param {string} domain 完整的 CDN 域名或域名前缀，如果只提供域名前缀则默认匹配${domain}.fbcontent.cn
 * @param {number} count alias 个数。例如 count 为 3 则会重试 a.b.com a1.b.com, a2.b.com
 * @param {string} [selector] CSS selector，仅匹配这个selector的元素才会重试
 */
export function addRetryDomain(domain, count, selector) {
    const match = domain.match(SUBDOMAIN_REGX)
    if (!match) {
        console.warn(`[@yuanfudao/resource-retry warning]: ${domain} is not a valid domain`)
        return
    }

    const subdomain = match[1],
        _domain = match[2] || '.fbcontent.cn'
    retryDomains.push({
        subdomain,
        domain: _domain,
        count,
        selector,
        regexp: new RegExp(`${subdomain}(\\d*)${_domain.replace('.', '\\.')}`),
        cur: 0
    })
}

/**
 * @deprecated 命名错误，将在未来移除，请使用registerReportFn
 * @param {function} fn 如果没有添加匹配的域名，就调用这个函数。
 */
export function registerReporFn(fn) {
    reportFns.push(fn)
}

/**
 * @param {function} fn 如果没有添加匹配的域名，就调用这个函数。
 */
export function registerReportFn(fn) {
    reportFns.push(fn)
}

/**
 * 调用次方法后才会真正开始资源重试
 */
export function startRetry() {
    if (Array.isArray(window._errs)) {
        window._errs.forEach(handleErrorEvent)
        window.removeEventListener('error', window._errs.fn)
    }

    window.addEventListener('error', handleErrorEvent, true)
}

