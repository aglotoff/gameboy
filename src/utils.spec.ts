import { describe, expect, test } from "vitest";

import {
  getLSB,
  getMSB,
  makeWord,
  resetBit,
  setBit,
  testBit,
  wrapDecrementWord,
  wrapIncrementByte,
  wrapIncrementWord,
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

  test("wrapIncrementByte", () => {
    let value = 0xfe;

    value = wrapIncrementByte(value);
    expect(value).toBe(0xff);

    value = wrapIncrementByte(value);
    expect(value).toBe(0x00);

    value = wrapIncrementByte(value);
    expect(value).toBe(0x01);
  });

  test("wrapIncrementWord", () => {
    let value = 0xfffe;

    value = wrapIncrementWord(value);
    expect(value).toBe(0xffff);

    value = wrapIncrementWord(value);
    expect(value).toBe(0x0000);

    value = wrapIncrementWord(value);
    expect(value).toBe(0x0001);
  });

  test("wrapDecrementWord", () => {
    let value = 0x0001;

    value = wrapDecrementWord(value);
    expect(value).toBe(0x0000);

    value = wrapDecrementWord(value);
    expect(value).toBe(0xffff);

    value = wrapDecrementWord(value);
    expect(value).toBe(0xfffe);
  });

  test("testBit", () => {
    let value = 0b01100111;

    expect(testBit(value, 0)).toBe(true);
    expect(testBit(value, 1)).toBe(true);
    expect(testBit(value, 2)).toBe(true);
    expect(testBit(value, 3)).toBe(false);
    expect(testBit(value, 4)).toBe(false);
    expect(testBit(value, 5)).toBe(true);
    expect(testBit(value, 6)).toBe(true);
    expect(testBit(value, 7)).toBe(false);
  });

  test("setBit", () => {
    let value = 0b10010110;

    expect(setBit(value, 0)).toBe(0b10010111);
    expect(setBit(value, 1)).toBe(0b10010110);
    expect(setBit(value, 2)).toBe(0b10010110);
    expect(setBit(value, 3)).toBe(0b10011110);
    expect(setBit(value, 4)).toBe(0b10010110);
    expect(setBit(value, 5)).toBe(0b10110110);
    expect(setBit(value, 6)).toBe(0b11010110);
    expect(setBit(value, 7)).toBe(0b10010110);
  });

  test("resetBit", () => {
    let value = 0b10011100;

    expect(resetBit(value, 0)).toBe(0b10011100);
    expect(resetBit(value, 1)).toBe(0b10011100);
    expect(resetBit(value, 2)).toBe(0b10011000);
    expect(resetBit(value, 3)).toBe(0b10010100);
    expect(resetBit(value, 4)).toBe(0b10001100);
    expect(resetBit(value, 5)).toBe(0b10011100);
    expect(resetBit(value, 6)).toBe(0b10011100);
    expect(resetBit(value, 7)).toBe(0b00011100);
  });
});
