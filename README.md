# @fenbi/resource-retry

CDN 资源加载错误重试

我们的每一个域名都会伴随着一个或多个 Alias，这些域名之间完全等价。例如对于域名 a.b.com，它的 alias 组域名是 a1.b.com。对端上来说两个域名完全等价，请求其中的任意一个都应该获得正确的结果。

例如访问 a.fbcontent.cn 上的资源失败，那么重试 a1.fbcontent.cn 域名，如果再失败，则回到 a.b.com。这样可以起到抗 DNS 污染的作用。

## 技术实现

监听所有有 src 或 href 属性的元素的 onerror 事件

## Install

```
npm install --save @fenbi/resource-retry
```

## Usage

#### `addRetryDomain(domain, count, [selector])`

-   domain : 完整的 CDN 域名或域名前缀，如果只提供域名前缀则默认匹配${domain}.fbcontent.cn
-   count : alias 个数。例如 count 为 3 则会重试 a.b.com a1.b.com, a2.b.com
-   selector: optional，CSS selector，仅匹配这个 selector 的元素才会重试

#### `registerReportFn(evt)`

-   fn : (evt: Event) => void
    如果没有添加匹配的域名，就调用这个函数。

### Example

```javascript
import { addRetryDomain, registerReportFn } from '@fenbi/resource-retry'
import { captureMessage } from '@sentry/browser'

if (process.env.NODE_ENV === 'production') {
    addRetryDomain('gallery.fbcontent.cn', 3)
    addRetryDomain('ydfa', 3) // 只传前缀，相当于ydfa.fbcontent.cn
} else {
    addRetryDomain('ytkgallery.yuanfudao.biz', 3)
}

registerReportFn((target) => {
    if (process.env.NODE_ENV === 'production') {
        navigator.onLine &&
            captureMessage('Load Error ' + target.tagName + ': ' + target.src || target.href, {
                tags: { errType: 'ERR_LOAD' }
            })
    }
})
```

加载错误可能在 JS 执行前发生，因此建议在 html 文件头部添加

```html
<script>
    window._errs = []
    window.addEventListener(
        'error',
        (window._errs.fn = function (e) {
            window._errs.push(e)
        }),
        true
    )
</script>
```

问题：

-   script 入口文件的加载错误需要在 HTML 中单独处理。