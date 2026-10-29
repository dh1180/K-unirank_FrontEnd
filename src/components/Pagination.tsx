import Link from "next/link";
import { toQuery } from "@/lib/query.mjs";

type Props = {
  href: string;
  page: number;
  hasNext: boolean;
  params: Record<string, string | number | undefined>;
  anchor?: string;
};

export function Pagination({
  href,
  page,
  hasNext,
  params,
  anchor = "results",
}: Props) {
  const prev =
    page > 0
      ? `${href}?${toQuery({ ...params, page: page - 1 })}#${anchor}`
      : null;
  const next = hasNext
    ? `${href}?${toQuery({ ...params, page: page + 1 })}#${anchor}`
    : null;
  return (
    <nav aria-label="페이지 이동" className="pagination">
      {prev ? (
        <Link href={prev}>이전</Link>
      ) : (
        <span aria-disabled="true">이전</span>
      )}
      <span>{page + 1} 페이지</span>
      {next ? (
        <Link href={next}>다음</Link>
      ) : (
        <span aria-disabled="true">다음</span>
      )}
    </nav>
  );
}
