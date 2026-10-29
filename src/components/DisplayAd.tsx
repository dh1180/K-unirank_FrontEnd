"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AD_CLIENT, AD_SLOT, productionHost } from "@/lib/site-policy.mjs";
import { requestDisplayAd } from "@/lib/ad-request.mjs";
function AdSlot() {
  const ref = useRef<HTMLModElement>(null);
  useEffect(() => {
    const ad = ref.current;
    if (!ad) return;
    const request = () => {
      requestDisplayAd(ad, (window.adsbygoogle ||= []));
    };
    const observer = new ResizeObserver(request);
    observer.observe(ad);
    request();
    return () => observer.disconnect();
  }, []);
  return (
    <aside className="display-ad" aria-label="광고">
      <span>광고</span>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
function ActiveAd() {
  const path = usePathname(),
    params = useSearchParams();
  const [enabled, setEnabled] = useState(false);
  useEffect(
    () =>
      setEnabled(
        productionHost(location.hostname) &&
          document.documentElement.dataset.siteProduction === "true",
      ),
    [],
  );
  return enabled ? <AdSlot key={`${path}?${params.toString()}`} /> : null;
}
export function DisplayAd() {
  return (
    <Suspense fallback={null}>
      <ActiveAd />
    </Suspense>
  );
}
