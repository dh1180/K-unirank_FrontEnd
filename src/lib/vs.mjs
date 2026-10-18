/**
 * Client request builder. The server remains the sole authority for signed
 * matchups and vote validity.
 */
export function vsVoteRequest(pair, selectedId) {
  if (!pair || !Array.isArray(pair.pair) || pair.pair.length !== 2
      || typeof pair.challenge !== "string") {
    throw new Error("유효한 대학 대진이 없습니다.");
  }
  const [a, b] = pair.pair.map(x => x.id);
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b) || a === b) {
    throw new Error("비교 대학 정보가 올바르지 않습니다.");
  }
  const skipped = selectedId === null;
  if (!skipped && selectedId !== a && selectedId !== b) {
    throw new Error("대진에 없는 대학을 선택했습니다.");
  }
  return {
    university_a: a,
    university_b: b,
    selected_university: skipped ? null : selectedId,
    skipped,
    challenge: pair.challenge,
  };
}
