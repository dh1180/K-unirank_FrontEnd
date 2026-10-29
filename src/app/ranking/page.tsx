import { DisplayAd } from "@/components/DisplayAd";
import type { Metadata } from "next";
import Link from "next/link";
import { ranking } from "@/lib/api";
import { Notice } from "@/components/Notice";
import { UniversityLogo } from "@/components/UniversityLogo";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = { title: "대학 선호도 순위" };
export default async function RankingPage() {
  const data = await ranking("overall", 100);
  return (
    <>
      <section
        className="directory-heading"
        data-ga-view="ranking_view"
        data-ga-param-board="overall"
      >
        <div>
          <p className="eyebrow">COMMUNITY RANKING</p>
          <h1>대학 선호도 순위</h1>
          <p>여러분의 선택으로 만들어지는, 또 하나의 대학 이야기.</p>
        </div>
        <span className="heading-stamp">
          <Icon name="chart" size={32} />
          <span>함께 만드는 순위</span>
        </span>
      </section>
      <DisplayAd />
      <div className="ranking-notice">
        <span className="status-dot" />
        사용자 VS 투표 기반 선호도입니다. 공식 대학평가나 입결 순위와는
        다릅니다.
      </div>
      {!data ? (
        <Notice>잠시 순위를 불러오지 못했어요.</Notice>
      ) : !data.ranking.length ? (
        <Notice>아직 표시할 순위가 없어요.</Notice>
      ) : (
        <>
          <div className="podium-grid">
            {data.ranking.slice(0, 3).map((item) => (
              <Link
                className={`podium-card podium-${item.rank}`}
                data-ga-event="ranking_university_open"
                data-ga-param-board="overall"
                data-ga-param-rank={item.rank}
                data-ga-param-university={item.name}
                href={`/universities/${item.university_id}/`}
                key={item.university_id}
              >
                <span className="podium-rank">
                  0{item.rank}{" "}
                  <span>{item.rank === 1 ? "TOP CHOICE" : "MOST LOVED"}</span>
                </span>
                <UniversityLogo
                  id={item.university_id}
                  name={item.name}
                  size="large"
                />
                <h2>{item.name}</h2>
                <p>
                  <b>
                    {item.rating.toLocaleString("ko-KR", {
                      maximumFractionDigits: 2,
                    })}
                  </b>{" "}
                  <span>점</span>
                </p>
                <small>
                  {item.match_count.toLocaleString("ko-KR")}번의 선택이 모였어요
                </small>
              </Link>
            ))}
          </div>
          <section className="ranking-panel">
            <div className="ranking-table-heading">
              <h2>전체 선호도 순위</h2>
              <span>Glicko-2 Rating 기준</span>
            </div>
            <ol className="ranking-list">
              {data.ranking.map((item) => (
                <li className="ranking-row" key={item.university_id}>
                  <span
                    className={`rank-number ${item.rank <= 3 ? "top" : ""}`}
                  >
                    {item.rank}
                  </span>
                  <UniversityLogo id={item.university_id} name={item.name} />
                  <div>
                    <Link
                      data-ga-event="ranking_university_open"
                      data-ga-param-board="overall"
                      data-ga-param-rank={item.rank}
                      data-ga-param-university={item.name}
                      href={`/universities/${item.university_id}/`}
                    >
                      {item.name}
                    </Link>
                    <small>
                      {item.match_count.toLocaleString("ko-KR")}전 ·{" "}
                      {item.win_count.toLocaleString("ko-KR")}승 ·{" "}
                      {item.loss_count.toLocaleString("ko-KR")}패
                    </small>
                  </div>
                  <span className="rank-rating">
                    {item.rating.toFixed(2)}
                    <small>Rating</small>
                  </span>
                </li>
              ))}
            </ol>
          </section>
          {data.ranking.length >= 12 && <DisplayAd />}
        </>
      )}
    </>
  );
}
