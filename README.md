# @yuanfudao/resource-retry

CDN 资源加载错误重试

我们的每一个域名都会伴随着一个或多个 Alias，这些域名之间完全等价。例如对于域名 a.b.com，它的 alias 组域名是 a1.b.com。对端上来说两个域名完全等价，请求其中的任意一个都应该获得正确的结果。

例如访问 a.fbcontent.cn 上的资源失败，那么重试 a1.fbcontent.cn 域名，如果再失败，则回到 a.b.com。这样可以起到抗 DNS 污染的作用。

## 技术实现

监听所有有 src 或 href 属性的元素的 onerror 事件

## Install

```
npm install --save @yuanfudao/resource-retry
```

## Usage

### `initRetry`

调用此方法后才会真正开始资源重试

### `addRetryDomain`
`(baseDomain: string, domainsCount: number, selector?: string | undefined): void;`
-   baseDomain : 完整的 CDN 域名或域名前缀，如果只提供域名前缀则默认匹配${domain}.fbcontent.cn
-   domainsCount : alias 个数。例如 count 为 3 则会重试 a.b.com a1.b.com, a2.b.com
-   selector: optional，CSS selector，仅匹配这个 selector 的元素才会重试
`addRetryDomain(domains: string[], selector?: string | undefined): void;`
- domains: 域名列表，前一个域名加载失败按顺序重试下一个，直到最后一个
-   selector: optional，CSS selector，仅匹配这个 selector 的元素才会重试

### `registerReportFn`

`registerReportFn: (fn: (info: RetryInfo) => void;) => void;`
```
interface RetryInfo {
    url?: string;
    $target?: HTMLElement;
}
```
如果重试过所有域名直到最后一个，最后一个也加载错误则调用传入的函数进行上报。

### `retryDynamicImport`

使用：
```js
import { retryDynamicImport } from '@yuanfudao/resource-retry'
// import('./hello.js').then()
// modify original code to 
retryDynamicImport(() => import('./hello.js')).then()
```
需要在这之前调用addRetryDomain配置重试的域名，如果已经在HTML中配置过则不需要重复配置。


### Example

详情查看example目录

为了能够重试js文件的加载错误，推荐在HTML文件中写入index.umd.min.js的代码。

index.pug
```pug
head
  meta(charset='UTF-8')
  meta(http-equiv='X-UA-Compatible' content='IE=edge')
  meta(name='viewport' content='width=device-width, initial-scale=1.0')
  title Test
  script.
    !{resourceRetryScript} // avoid escaping
  script.
    var ResourceRetry = window['@yuanfudao/resource-retry']
    if (ResourceRetry) {
      ResourceRetry.addRetryDomain(['blocked.cdn.com', 'fallback.cdn.com'])
      ResourceRetry.initRetry()
    }
  link(rel='stylesheet' href='http://blocked.cdn.com/index.css')
body
  main
    img(src='http://blocked.cdn.com/logo.png')
  script(src='http://blocked.cdn.com/index.js')
```

webpack.config.js
```js
const fs = require("fs");
const HtmlPlugin = require("html-webpack-plugin");
const resourceRetryScript = fs.readFileSync(
  require.resolve("@yuanfudao/resource-retry/dist/index.umd.min.js")
);

module.exports = {
  plugins: [
    new HtmlPlugin({
      filename: 'index.html',
      template: "!!pug-loader!index.pug",
      templateParameters: { resourceRetryScript },
    }),
  ]
}
```

## Change Log

### 3.0
- feat: addRetryDomain 新增传入一个域名列表的调用方式
- feat: registerReportFn 触发逻辑修改，忽略未配置重试的域名
- feat: 新增retryDynamicImport 
- feat: 忽略带有data-resource-retry-ignore属性的元素
