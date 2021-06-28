import { configuration } from './configuration'

const addRetryDomain = configuration.addRetryDomain.bind(configuration)
const registerReportFn = configuration.registerReportFn.bind(configuration)

export { addRetryDomain, registerReportFn }
export { initRetry, initRetry as startRetry } from './initRetry'
export { retryDynamicImport } from './retryDynamicImport'
