import { DataRanking } from "@/components/DataRanking";
import type { RankSearch } from "@/lib/rankings";
import { notFound } from "next/navigation";
const slugs = [
  "employment-rate",
  "average-tuition",
  "scholarship-per-student",
  "dormitory-capacity-rate",
  "education-cost-per-student",
  "students-per-faculty",
  "faculty-securing-rate",
];
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RankSearch>;
}) {
  const { slug } = await params;
  if (!slugs.includes(slug)) notFound();
  return <DataRanking slug={slug} search={await searchParams} />;
}
