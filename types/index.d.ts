export type HTMLElementWithSrcOrHref = HTMLElement & { src?: string, href?: string };
export declare function addRetryDomain(domain: string, count: number, selector?: string): void;
export declare function registerReporFn(fn: (target: HTMLElementWithSrcOrHref, event: Event) => void): void;
export declare function registerReportFn(fn: (target: HTMLElementWithSrcOrHref, event: Event) => void): void;
export declare function startRetry(): void;
