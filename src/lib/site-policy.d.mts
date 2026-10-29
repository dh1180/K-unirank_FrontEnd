export const SITE_ORIGIN: string;
export const GA_ID: string;
export const AD_CLIENT: string;
export const AD_SLOT: string;
export function productionHost(host: string | null, mode?: string): boolean;
export function privatePath(path: string): boolean;
export function legacyPath(path: string): boolean;
export function pagePolicy(
  host: string | null,
  path: string,
  hasQuery: boolean,
  mode?: string,
): { production: boolean; index: boolean; follow: boolean; canonical: string };
export function viewEvent(path: string): string | null;
