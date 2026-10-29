"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
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
  const [checked, setChecked] = useState(publicOnly);
  const [pending, startTransition] = useTransition();
  useEffect(() => setChecked(publicOnly), [publicOnly]);
  return (
    <label className="metric-toggle" aria-busy={pending}>
      <input
        type="checkbox"
        checked={checked}
        disabled={pending}
        onChange={(event) => {
          const next = event.target.checked;
          setChecked(next);
          startTransition(() =>
            router.push(
              `${href}?${toQuery({ ...params, metrics: next ? "public" : "all", page: 0 })}`,
              { scroll: false },
            ),
          );
        }}
      />
      <span>입결 지표 있는 결과만 보기</span>
    </label>
  );
}
