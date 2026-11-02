export function publicQueryPath(path: string): boolean;
export function swaggerAsset(parts?: string[], fetcher?: typeof fetch): Promise<Response>;
export function swaggerDocument(parts: string[], query?: string, fetcher?: typeof fetch): Promise<Response>;
