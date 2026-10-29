import Link from "next/link";
import { rankingCatalog } from "@/lib/rankings";
import { Icon } from "@/components/Icon";
import { Notice } from "@/components/Notice";
export const metadata = { title: "대학 순위 · 입결·선호도·공시 지표" };
export default async function RankingsHub() {
  const cards = await rankingCatalog();
  return (
    <>
      <section className="directory-heading" data-ga-view="ranking_hub_view">
        <div>
          <p className="eyebrow">RANKINGS</p>
          <h1>대학 순위</h1>
          <p>입결, 사용자 선호도와 주요 공시 지표를 기준별로 비교해 보세요.</p>
        </div>
        <span className="heading-stamp">
          <Icon name="chart" size={32} />
          <span>기준을 알면 선택이 보여요</span>
        </span>
      </section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">MAIN</p>
          <h2>주요 순위</h2>
        </div>
      </div>
      <div className="ranking-hub-primary">
        <Link href="/admissions/ranking/" className="hub-main-card">
          <span className="hub-icon">
            <Icon name="book" size={26} />
          </span>
          <div>
            <small>입시</small>
            <h2>입결 순위</h2>
            <p>4년제·전문대 수시·정시 공개 입시결과를 비교합니다.</p>
          </div>
          <Icon name="arrow" />
        </Link>
        <Link href="/ranking/" className="hub-main-card">
          <span className="hub-icon navy">
            <Icon name="chart" size={26} />
          </span>
          <div>
            <small>선호도</small>
            <h2>대학 선호도 순위</h2>
            <p>사용자 VS 선택으로 만들어지는 대학 선호도입니다.</p>
          </div>
          <Icon name="arrow" />
        </Link>
      </div>
      <div className="voting-entry-banner">
        <div>
          <strong>내 선택으로 만드는 대학 선호도</strong>
          <p>두 대학 중 더 선호하는 대학을 골라보세요.</p>
        </div>
        <Link className="button primary" href="/vs/">
          대학 투표 참여하기 →
        </Link>
      </div>
      <div className="section-heading">
        <div>
          <p className="eyebrow">OFFICIAL DATA</p>
          <h2>공시 지표 순위</h2>
          <p>
            취업, 비용, 장학, 생활·교육 환경을 같은 연도 기준으로 살펴보세요.
          </p>
        </div>
      </div>
      {cards ? (
        <div className="indicator-card-grid">
          {cards.map(({ metric, year, universityCount }) => (
            <Link
              key={metric.code}
              className="indicator-card"
              href={`/universities/indicators/${metric.slug}/${year ? `?year=${year}` : ""}`}
            >
              <div>
                <span className="badge purple">{metric.category}</span>
                <small>{metric.ascending ? "낮은 순" : "높은 순"}</small>
              </div>
              <h3>{metric.label}</h3>
              <p>{metric.description}</p>
              <footer>
                <span>
                  {year
                    ? `${year}년 공시 · ${universityCount}개 대학`
                    : "공개 자료 확인"}
                </span>
                <strong>순위 보기 →</strong>
              </footer>
            </Link>
          ))}
        </div>
      ) : (
        <Notice>공시 지표 목록을 불러오지 못했어요.</Notice>
      )}
    </>
  );
}
