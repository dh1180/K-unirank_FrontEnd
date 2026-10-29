"use client";
import { useRouter } from "next/navigation";
import { toQuery } from "@/lib/query.mjs";

export function MetricToggle({
  href,
  params,
  publicOnly,
}: {
  href: string;
  params: Record<string, string | number | undefined>;
  publicOnly: boolean;
}) {
  const router = useRouter();
  return (
    <label className="metric-toggle">
      <input
        type="checkbox"
        checked={publicOnly}
        onChange={(event) =>
          router.push(
            `${href}?${toQuery({ ...params, metrics: event.target.checked ? "public" : "all", page: 0 })}`,
          )
        }
      />
      <span>입결 지표 있는 결과만 보기</span>
    </label>
  );
}
