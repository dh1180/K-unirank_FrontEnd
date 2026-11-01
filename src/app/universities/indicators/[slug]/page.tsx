import { DataRanking } from "@/components/DataRanking";
import type { RankSearch } from "@/lib/rankings";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
const labels: Record<string,string> = {
  "employment-rate":"취업률",
  "average-tuition":"평균 등록금",
  "scholarship-per-student":"학생 1인당 장학금",
  "dormitory-capacity-rate":"기숙사 수용률",
  "education-cost-per-student":"학생 1인당 교육비",
  "students-per-faculty":"전임교원 1인당 학생 수",
  "faculty-securing-rate":"전임교원 확보율",
};
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata> {
  const {slug}=await params;
  if(!Object.hasOwn(labels,slug)) notFound();
  const label=labels[slug];
  if(!label) notFound();
  return {title:`${label} 대학 순위`,description:`대학알리미 공식 ${label} 지표를 연도·지역·대학별로 비교하세요.`,alternates:{canonical:`/universities/indicators/${slug}/`}};
}
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RankSearch>;
}) {
  const { slug } = await params;
  if (!Object.hasOwn(labels,slug)) notFound();
  return <DataRanking slug={slug} search={await searchParams} />;
}
