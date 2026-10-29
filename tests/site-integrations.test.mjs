import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  productionHost,
  pagePolicy,
  legacyPath,
  viewEvent,
  GA_ID,
  AD_CLIENT,
  AD_SLOT,
} from "../src/lib/site-policy.mjs";
import { requestDisplayAd } from "../src/lib/ad-request.mjs";
test("existing Google identities and ads.txt remain in the same account", () => {
  assert.equal(GA_ID, "G-5WK14ZDHSP");
  assert.equal(AD_CLIENT, "ca-pub-3862816878614020");
  assert.equal(AD_SLOT, "8829169633");
  assert.equal(
    readFileSync(new URL("../public/ads.txt", import.meta.url), "utf8").trim(),
    "google.com, pub-3862816878614020, DIRECT, f08c47fec0942fa0",
  );
  assert.ok(
    readFileSync(new URL("../public/brand/k-unirank.png", import.meta.url))
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
  );
});
test("preview and spoofed hosts cannot pollute production ads or metrics", () => {
  for (const host of [
    "localhost:3000",
    "frontend-production-86dd.up.railway.app",
    "k-unirank.com.attacker.test",
    null,
  ])
    assert.equal(productionHost(host), false);
  assert.equal(productionHost("www.k-unirank.com"), true);
  assert.equal(productionHost("k-unirank.com", "preview"), false);
  assert.equal(
    pagePolicy("k-unirank.com", "/universities/367/", false).index,
    true,
  );
  assert.equal(
    pagePolicy("k-unirank.com", "/universities/367/", true).index,
    false,
  );
  assert.equal(
    pagePolicy("k-unirank.com", "/accounts/me/", false).index,
    false,
  );
  assert.equal(pagePolicy("preview.test", "/", false).follow, false);
});
test("legacy URL compatibility covers existing accounts, votes, results and assets", () => {
  for (const path of [
    "/vs/overall/submit/",
    "/accounts/me/",
    "/support/",
    "/result/123/",
    "/static/css/app.css",
    "/admissions/results/",
    "/api/v1/boards/overall/vote/",
  ])
    assert.equal(legacyPath(path), true);
  for (const path of [
    "/universities/367/",
    "/api/vs/vote/",
    "/unknown/",
    "//attacker.test/",
  ])
    assert.equal(legacyPath(path), false);
  assert.equal(viewEvent("/admissions/compare/"), "admission_compare_view");
  assert.equal(viewEvent("/rankings/"), "ranking_hub_view");
});
test("ad requests wait for layout and never duplicate on resize or StrictMode", () => {
  let width = 0;
  const ad = { dataset: {}, getBoundingClientRect: () => ({ width }) };
  const queue = [];
  assert.equal(requestDisplayAd(ad, queue), false);
  width = 320;
  assert.equal(requestDisplayAd(ad, queue), true);
  assert.equal(requestDisplayAd(ad, queue), false);
  assert.equal(queue.length, 1);
  assert.equal(
    requestDisplayAd(
      {
        dataset: { adsbygoogleStatus: "done" },
        getBoundingClientRect: () => ({ width: 320 }),
      },
      queue,
    ),
    false,
  );
});
