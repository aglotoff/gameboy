import { describe, expect, test } from "vitest";

import {
  getLSB,
  getMSB,
  makeWord,
  wrappingDecrementWord,
  wrappingIncrementByte,
  wrappingIncrementWord,
} from "./utils";

describe("utils", () => {
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

  test("makeWord restores word from LSB and MSB", () => {
    const originalWord = 0xd6ac;

    const lsb = getLSB(originalWord);
    const msb = getMSB(originalWord);
    const newWord = makeWord(msb, lsb);

    expect(newWord).toBe(originalWord);
  });

  test("wrappingIncrementByte", () => {
    let value = 0xfe;

    value = wrappingIncrementByte(value);
    expect(value).toBe(0xff);

    value = wrappingIncrementByte(value);
    expect(value).toBe(0x00);

    value = wrappingIncrementByte(value);
    expect(value).toBe(0x01);
  });

  test("wrappingIncrementWord", () => {
    let value = 0xfffe;

    value = wrappingIncrementWord(value);
    expect(value).toBe(0xffff);

    value = wrappingIncrementWord(value);
    expect(value).toBe(0x0000);

    value = wrappingIncrementWord(value);
    expect(value).toBe(0x0001);
  });

  test("wrappingDecrementWord", () => {
    let value = 0x0001;

    value = wrappingDecrementWord(value);
    expect(value).toBe(0x0000);

    value = wrappingDecrementWord(value);
    expect(value).toBe(0xffff);

    value = wrappingDecrementWord(value);
    expect(value).toBe(0xfffe);
  });
});
