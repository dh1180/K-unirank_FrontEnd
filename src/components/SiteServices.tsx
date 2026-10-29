import Script from "next/script";
import { Suspense } from "react";
import { headers } from "next/headers";
import { productionHost, GA_ID, AD_CLIENT } from "@/lib/site-policy.mjs";
import { AnalyticsEvents } from "@/components/AnalyticsEvents";
export async function SiteServices() {
  const host = (await headers()).get("host");
  if (!productionHost(host, process.env.SITE_MODE)) return null;
  return (
    <>
      <Script
        id="kunirank-ga-config"
        strategy="afterInteractive"
      >{`window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};window.gtag('js',new Date());window.gtag('config','${GA_ID}');window.kuniTrack=function(name,params){if(name)window.gtag('event',name,params||{})};`}</Script>
      <Script
        id="kunirank-ga-loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="kunirank-adsense-loader"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <Suspense fallback={null}>
        <AnalyticsEvents />
      </Suspense>
    </>
  );
}
