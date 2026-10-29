import "server-only";
import { apiGet } from "@/lib/api";
import { toQuery } from "@/lib/query.mjs";
export type RankMetric = {
  slug: string;
  code: string;
  label: string;
  category: string;
  kind: string;
  ascending: boolean;
  description: string;
};
export type RankCard = {
  metric: RankMetric;
  year: number | null;
  universityCount: number;
};
export type DataRankPage = {
  metric: RankMetric;
  selectedYear: number | null;
  availableYears: number[];
  regions: string[];
  totalCount: number;
  page: number;
  size: number;
  hasNext: boolean;
  items: Array<{
    rank: number;
    universityId: number;
    name: string;
    logoPath: string | null;
    region: string;
    value: number;
    sampleCount: number;
    sourceUrl: string;
    year: number;
  }>;
};
export type RankSearch = {
  year?: string;
  q?: string;
  region?: string;
  kind?: string;
  phase?: string;
  page?: string;
};
export function rankingCatalog() {
  return apiGet<RankCard[]>("/api/v1/rankings/catalog");
}
export function dataRanking(
  slug: string,
  params: Record<string, string | number | undefined>,
) {
  return apiGet<DataRankPage>(
    `/api/v1/rankings/${slug === "admissions" ? "admissions" : `indicators/${encodeURIComponent(slug)}`}?${toQuery(params)}`,
  );
}
