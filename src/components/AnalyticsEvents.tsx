"use client";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { GA_ID, productionHost, viewEvent } from "@/lib/site-policy.mjs";
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    kuniTrack?: (name: string, params?: Record<string, unknown>) => void;
    adsbygoogle?: Record<string, unknown>[];
  }
}
export function AnalyticsEvents() {
  const path = usePathname(),
    query = useSearchParams().toString();
  const lastView = useRef("");
  useEffect(() => {
    if (!productionHost(location.hostname)) return;
    const key = path + "?" + query;
    if (lastView.current === key) return;
    const previous = lastView.current;
    lastView.current = key;
    const params = new URLSearchParams(query);
    const properties = Object.fromEntries(
      ["year", "kind", "phase", "region"].map((k) => [k, params.get(k) || ""]),
    );
    const track = (name: string) => {
      window.dataLayer ||= [];
      window.gtag ||= function (...args: unknown[]) {
        window.dataLayer.push(args);
      };
      window.gtag("event", name, { ...properties, send_to: GA_ID });
    };
    const name = viewEvent(path);
    if (name) {
      const section = document.querySelector<HTMLElement>(
        `[data-ga-view="${name}"]`,
      );
      if (section)
        Object.assign(
          properties,
          Object.fromEntries(
            Object.entries(section.dataset)
              .filter(([key]) => key.startsWith("gaParam"))
              .map(([key, value]) => [
                key
                  .slice(7)
                  .replace(/[A-Z]/g, (m) => "_" + m.toLowerCase())
                  .replace(/^_/, ""),
                value || "",
              ]),
          ),
        );
      track(name);
    }
    if (previous && path === "/") track("admission_async_filter");
    // The existing GA4 stream uses enhanced history measurement. Do not also
    // send manual page_view events: this would double-count Next.js navigation.
  }, [path, query]);
  useEffect(() => {
    if (!productionHost(location.hostname)) return;
    function parameters(element: HTMLElement) {
      return Object.fromEntries(
        Object.entries(element.dataset)
          .filter(([k]) => k.startsWith("gaParam"))
          .map(([k, v]) => [
            k
              .slice(7)
              .replace(/[A-Z]/g, (m) => "_" + m.toLowerCase())
              .replace(/^_/, ""),
            v,
          ]),
      );
    }
    function click(event: MouseEvent) {
      const element = (event.target as Element)?.closest<HTMLElement>(
        "[data-ga-event]",
      );
      if (element?.dataset.gaEvent) {
        window.gtag?.("event", element.dataset.gaEvent, parameters(element));
        return;
      }
      const link = (event.target as Element)?.closest<HTMLAnchorElement>(
        "a[href]",
      );
      if (!link) return;
      const target = new URL(link.href, location.href);
      if (location.pathname === "/rankings/") {
        const ranking =
          target.pathname === "/admissions/ranking/"
            ? "admissions"
            : target.pathname === "/ranking/"
              ? "preference"
              : target.pathname.includes("/indicators/")
                ? target.pathname.split("/")[3]
                : null;
        if (ranking) window.gtag?.("event", "ranking_hub_open", { ranking });
      }
      if (
        location.pathname === "/universities/" &&
        /^\/universities\/\d+\/$/.test(target.pathname)
      )
        window.gtag?.("event", "university_open", {
          university:
            link.querySelector("h2")?.textContent ||
            link.textContent?.trim().slice(0, 100),
        });
      if (
        location.pathname === "/universities/" &&
        link.classList.contains("chip")
      )
        window.gtag?.("event", "university_region_filter", {
          region: target.searchParams.get("region") || "전체",
        });
      if (
        location.pathname === "/ranking/" &&
        /^\/universities\/\d+\/$/.test(target.pathname)
      )
        window.gtag?.("event", "ranking_university_open", {
          board: "overall",
          university: link.textContent?.trim().slice(0, 100),
        });
      if (
        /^\/admissions\/university\//.test(location.pathname) &&
        /^\/universities\/\d+\/$/.test(target.pathname)
      )
        window.gtag?.("event", "university_open_from_admission", {
          university: document
            .querySelector("h1")
            ?.textContent?.replace("입시결과", "")
            .trim(),
        });
    }
    function submit(event: SubmitEvent) {
      const form = event.target as HTMLFormElement;
      if (!form.dataset.gaSubmit) return;
      const params: Record<string, unknown> = parameters(form);
      const field = form.dataset.gaSearchField;
      if (field) {
        const input = form.elements.namedItem(field) as HTMLInputElement;
        if (input?.value.trim())
          params.search_term = input.value.trim().slice(0, 100);
      }
      window.gtag?.("event", form.dataset.gaSubmit, params);
    }
    document.addEventListener("click", click);
    document.addEventListener("submit", submit);
    return () => {
      document.removeEventListener("click", click);
      document.removeEventListener("submit", submit);
    };
  }, []);
  return null;
}
