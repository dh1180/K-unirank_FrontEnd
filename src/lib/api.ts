import "server-only";
import { notFound } from "next/navigation";
import type {
  AdmissionPage,
  GradeComparison,
  RankingResult,
  UniversityPage,
  UniversityDetail,
  UniversityOverview,
} from "@/lib/types";
import { toQuery } from "@/lib/query.mjs";

/**
 * Next.js server fetches Spring Boot's API over the private network.
 * In an unconfigured preview, return null and show an explicit error.
 * We deliberately do NOT point an unconfigured preview at production Django.
 */
export async function apiGet<T>(path: string, missingIs404 = false): Promise<T | null> {
  const base = process.env.API_INTERNAL_URL;
  if (!base) return null;
  let response: Response;
  try {
    const url = new URL(path, base);
    response = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return null;
  }
  // An upstream 404 is different from a network outage or invalid JSON.
  if (missingIs404 && response.status === 404) notFound();
  if (!response.ok) return null;
  try { return (await response.json()) as T; } catch { return null; }
}

export function searchAdmissions(
  params: Record<string, string | number | undefined>,
): Promise<AdmissionPage | null> {
  return apiGet<AdmissionPage>(`/api/v1/admissions/results?${toQuery(params)}`);
}

export function getUniversity(id: number): Promise<UniversityDetail | null> {
  return apiGet<UniversityDetail>(`/api/v1/universities/${id}`, true);
}
export function universityRegions():Promise<string[]|null> { return apiGet<string[]>("/api/v1/universities/regions"); }

export function universityOverview(
  id: number,
): Promise<UniversityOverview | null> {
  return apiGet<UniversityOverview>(`/api/v1/universities/${id}/overview`);
}

export function listUniversities(
  q: string,
  page: number,
  region?: string,
): Promise<UniversityPage | null> {
  return apiGet<UniversityPage>(
    `/api/v1/universities?${toQuery({ q, page, region, size: 20 })}`,
  );
}

export function compareGrades(
  params: Record<string, string | number | undefined>,
): Promise<GradeComparison | null> {
  return apiGet<GradeComparison>(
    `/api/v1/admissions/compare?${toQuery(params)}`,
  );
}

export function universityAdmissions(
  id: number,
  page: number,
  year?: number,
  metrics: string = "public",
  filters: { q?: string; phase?: string; track?: string } = {},
): Promise<AdmissionPage | null> {
  return apiGet<AdmissionPage>(
    `/api/v1/admissions/universities/${id}?${toQuery({ ...filters, page, size: 20, year, metrics })}`,
    true,
  );
}

export function unitAdmissions(
  id: number,
  page: number,
  year?: number,
  metrics: string = "public",
): Promise<AdmissionPage | null> {
  return apiGet<AdmissionPage>(
    `/api/v1/admissions/units/${id}?${toQuery({ page, size: 20, year, metrics })}`,
    true,
  );
}

export function ranking(
  slug: string,
  limit: number,
): Promise<RankingResult | null> {
  const safeSlug = encodeURIComponent(slug);
  return apiGet<RankingResult>(
    `/api/v1/boards/${safeSlug}/ranking?limit=${Math.min(200, Math.max(1, limit))}`,
  );
}
