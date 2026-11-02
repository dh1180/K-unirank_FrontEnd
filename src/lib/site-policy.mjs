export const SITE_ORIGIN = "https://k-unirank.com";
export const SOCIAL_IMAGE =
  SITE_ORIGIN + "/static/university/K-uniran.c8e568b20f96.png";
export const GA_ID = "G-5WK14ZDHSP";
export const AD_CLIENT = "ca-pub-3862816878614020";
export const AD_SLOT = "8829169633";
// Django's sitemap renders local calendar dates in TIME_ZONE=Asia/Seoul.
export function sitemapDate(value) {
  return new Date(new Date(value).getTime() + 9 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}
export function productionHost(host, mode = "auto") {
  return (
    mode !== "preview" &&
    ["k-unirank.com", "www.k-unirank.com"].includes(
      (host || "").toLowerCase().split(":")[0],
    )
  );
}
export function privatePath(path) {
  return /^\/(api|api-docs|swagger-ui|swagger-ui.html|admin|mypage|health|accounts|login|register|favorites|ai|vs|result|support)(\/|$)/.test(
    path,
  );
}
export function legacyPath(path) {
  if (/^\/admin\/?$/.test(path) || /^\/accounts\/(login|me)\/?$/.test(path)) return false;
  return (
    /^\/(accounts|support|result|static|admin)(\/|$)/.test(path) ||
    /^\/vs\/[^/]+\/submit\/?$/.test(path) ||
    /^\/api\/v1\/boards\/[^/]+\/(next|vote|ranking)\/?$/.test(path) ||
    path === "/admissions/results/" ||
    (path.startsWith("/ranking/") && path !== "/ranking/")
  );
}
export function pagePolicy(host, path, hasQuery, mode = "auto") {
  const production = productionHost(host, mode);
  const index = production && !hasQuery && !privatePath(path);
  return {
    production,
    index,
    follow:
      production &&
      !/^\/(api|admin|mypage|accounts|login|register|favorites|result)(\/|$)/.test(path),
    canonical: SITE_ORIGIN + path,
  };
}
export function viewEvent(path) {
  if (path === "/") return "admission_overview_view";
  if (path === "/admissions/compare/") return "admission_compare_view";
  if (path === "/rankings/") return "ranking_hub_view";
  if (path.startsWith("/ranking/")) return "ranking_view";
  if (path === "/admissions/ranking/") return "admission_ranking_view";
  if (path.startsWith("/universities/indicators/"))
    return "official_indicator_ranking_view";
  if (path === "/universities/") return "university_list_view";
  if (/^\/universities\/\d+\/$/.test(path)) return "university_view";
  if (
    path.startsWith("/admissions/university/") ||
    path.startsWith("/admissions/unit/")
  )
    return "admission_view";
  return null;
}
