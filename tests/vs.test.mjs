import test from "node:test";
import assert from "node:assert/strict";
import { vsVoteRequest } from "../src/lib/vs.mjs";

const pair = {
  pair: [{ id: 1, name: "A" }, { id: 2, name: "B" }],
  challenge: "signed-token",
};

test("selected candidate creates the exact signed vote payload", () => {
  assert.deepEqual(vsVoteRequest(pair, 2), {
    university_a: 1, university_b: 2, selected_university: 2,
    skipped: false, challenge: "signed-token",
  });
});
test("skip does not send a selected university", () => {
  assert.deepEqual(vsVoteRequest(pair, null), {
    university_a: 1, university_b: 2, selected_university: null,
    skipped: true, challenge: "signed-token",
  });
});
test("invalid pair and unknown selection are rejected before sending", () => {
  assert.throws(() => vsVoteRequest(pair, 3));
  assert.throws(() => vsVoteRequest({ ...pair, pair: [pair.pair[0], pair.pair[0]] }, null));
  assert.throws(() => vsVoteRequest(null, null));
});
