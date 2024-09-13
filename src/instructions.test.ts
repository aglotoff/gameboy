import { beforeEach, describe, expect, test } from "vitest";
import {
  getHighByte,
  getLowByte,
  readRegister,
  readRegisterPair,
  resetRegisters,
  writeRegister,
  writeRegisterPair,
} from "./cpu";
import {
  loadIndirectHLFromImmediateData,
  loadRegisterFromImmediate,
  loadRegisterFromRegister,
  loadRegisterFromIndirectHL,
  loadIndirectHLFromRegister,
  loadAccumulatorFromIndirectBC,
  loadAccumulatorFromIndirectDE,
  loadIndirectBCFromAccumulator,
  loadIndirectDEFromAccumulator,
  loadAccumulatorFromDirectWord,
  loadDirectWordFromAccumulator,
  loadAccumulatorFromIndirectC,
  loadIndirectCFromAccumulator,
  loadAccumulatorFromDirectByte,
  loadDirectByteFromAccumulator,
  loadAccumulatorFromIndirectHLDecrement,
  loadAccumulatorFromIndirectHLIncrement,
  loadIndirectHLDecrementFromAccumulator,
  loadIndirectHLIncrementFromAccumulator,
} from "./instructions";
import * as Memory from "./memory";

beforeEach(() => {
  resetRegisters();
  Memory.reset();
});

describe("8-bit load instructions", () => {
  test("LD r,r'", () => {
    writeRegister("B", 0x3c);
    writeRegister("D", 0x5c);

    loadRegisterFromRegister("A", "B");
    loadRegisterFromRegister("B", "D");

    expect(readRegister("A")).toBe(0x3c);
    expect(readRegister("B")).toBe(0x5c);
  });

  test("LD r,n", () => {
    Memory.write(0, 0x24);

    loadRegisterFromImmediate("B");

    expect(readRegister("B")).toBe(0x24);
  });

  test("LD r,(HL)", () => {
    Memory.write(0x8ac5, 0x5c);
    writeRegisterPair("HL", 0x8ac5);

    loadRegisterFromIndirectHL("H");

    expect(readRegister("H")).toBe(0x5c);
  });

  test("LD (HL),r", () => {
    writeRegister("A", 0x3c);
    writeRegisterPair("HL", 0x8ac5);

    loadIndirectHLFromRegister("A");

    expect(Memory.read(0x8ac5)).toBe(0x3c);
  });

  test("LD (HL),n", () => {
    writeRegisterPair("HL", 0x8ac5);
    Memory.write(0, 0x3c);

    loadIndirectHLFromImmediateData();

    expect(Memory.read(0x8ac5)).toBe(0x3c);
  });

  test("LD A,(BC)", () => {
    writeRegisterPair("BC", 0x8ac5);
    Memory.write(0x8ac5, 0x2f);

    loadAccumulatorFromIndirectBC();

    expect(readRegister("A")).toBe(0x2f);
  });

  test("LD A,(DE)", () => {
    writeRegisterPair("DE", 0x8ac5);
    Memory.write(0x8ac5, 0x5f);

    loadAccumulatorFromIndirectDE();

    expect(readRegister("A")).toBe(0x5f);
  });

  test("LD (BC),A", () => {
    writeRegisterPair("BC", 0x205f);
    writeRegister("A", 0x56);

    loadIndirectBCFromAccumulator();

    expect(Memory.read(0x205f)).toBe(0x56);
  });

  test("LD (DE),A", () => {
    writeRegisterPair("DE", 0x205c);
    writeRegister("A", 0xaa);

    loadIndirectDEFromAccumulator();

    expect(Memory.read(0x205c)).toBe(0xaa);
  });

  test("LD A,(nn)", () => {
    Memory.write(0, getLowByte(0x8000));
    Memory.write(1, getHighByte(0x8000));
    Memory.write(0x8000, 0x5c);

    loadAccumulatorFromDirectWord();

    expect(readRegister("A")).toBe(0x5c);
  });

  test("LD (nn),A", () => {
    Memory.write(0, getLowByte(0x8000));
    Memory.write(1, getHighByte(0x8000));
    writeRegister("A", 0x2f);

    loadDirectWordFromAccumulator();

    expect(Memory.read(0x8000)).toBe(0x2f);
  });

  test("LD A,(C)", () => {
    Memory.write(0xff95, 0x2c);
    writeRegister("C", 0x95);

    loadAccumulatorFromIndirectC();

    expect(readRegister("A")).toBe(0x2c);
  });

  test("LD (C),A", () => {
    writeRegister("A", 0x5c);
    writeRegister("C", 0x9f);

    loadIndirectCFromAccumulator();

    expect(Memory.read(0xff9f)).toBe(0x5c);
  });

  test("LD A,(n)", () => {
    Memory.write(0, getLowByte(0x34));
    Memory.write(0xff34, 0x5f);

    loadAccumulatorFromDirectByte();

    expect(readRegister("A")).toBe(0x5f);
  });

  test("LD (n),A", () => {
    Memory.write(0, getLowByte(0x34));
    writeRegister("A", 0x2f);

    loadDirectByteFromAccumulator();

    expect(Memory.read(0xff34)).toBe(0x2f);
  });

  test("LD A,(HLD)", () => {
    writeRegisterPair("HL", 0x8a5c);
    Memory.write(0x8a5c, 0x3c);

    loadAccumulatorFromIndirectHLDecrement();

    expect(readRegister("A")).toBe(0x3c);
    expect(readRegisterPair("HL")).toBe(0x8a5b);
  });

  test("LD A,(HLI)", () => {
    writeRegisterPair("HL", 0x1ff);
    Memory.write(0x1ff, 0x56);

    loadAccumulatorFromIndirectHLIncrement();

    expect(readRegister("A")).toBe(0x56);
    expect(readRegisterPair("HL")).toBe(0x200);
  });

  test("LD (HLD),A", () => {
    writeRegisterPair("HL", 0x4000);
    writeRegister("A", 0x5);

    loadIndirectHLDecrementFromAccumulator();

    expect(Memory.read(0x4000)).toBe(0x5);
    expect(readRegisterPair("HL")).toBe(0x3fff);
  });

  test("LD (HLI),A", () => {
    writeRegisterPair("HL", 0xffff);
    writeRegister("A", 0x56);

    loadIndirectHLIncrementFromAccumulator();

    expect(Memory.read(0xffff)).toBe(0x56);
    expect(readRegisterPair("HL")).toBe(0x0);
  });
});
