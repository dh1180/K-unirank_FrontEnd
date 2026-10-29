import { DataRanking } from "@/components/DataRanking";
import type { RankSearch } from "@/lib/rankings";
export const metadata = { title: "대학 입결 순위" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<RankSearch>;
}) {
  return <DataRanking slug="admissions" search={await searchParams} />;
}
