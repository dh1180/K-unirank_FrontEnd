export type VsSchool = { id: number; name: string; logo_path: string | null; region: string | null };
export type VsMatch = {
  board: { slug: string; name: string };
  pair: [VsSchool, VsSchool];
  challenge: string;
  voteCount: number;
};
export declare function vsVoteRequest(pair: VsMatch, selectedId: number | null): {
  university_a: number;
  university_b: number;
  selected_university: number | null;
  skipped: boolean;
  challenge: string;
};
