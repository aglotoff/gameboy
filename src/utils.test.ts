import { expect, test } from "vitest";

import { getLSB, getMSB, makeWord } from "./utils";

test("getLSB", () => {
  const value = 0x1234;
  expect(getLSB(value)).toBe(0x34);
});

test("getMSB", () => {
  const value = 0x1234;
  expect(getMSB(value)).toBe(0x12);
});

test("makeWord", () => {
  const lsb = 0xaf;
  const msb = 0x18;

  expect(makeWord(msb, lsb)).toBe(0x18af);
});
