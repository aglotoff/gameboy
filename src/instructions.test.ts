import { beforeEach, describe, expect, test } from "vitest";
import {
  getHighByte,
  getLowByte,
  readRegister8,
  readRegister16,
  readRegisterPair,
  resetRegisters,
  writeRegister8,
  writeRegister16,
  writeRegisterPair,
  isSetFlag,
  writeFlag,
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
  loadRegisterPair,
  loadDirectFromStackPointer,
  loadStackPointerFromHL,
  pushToStack,
  popFromStack,
  loadHLFromAdjustedStackPointer,
  addRegister,
  addIndirectHL,
  addRegisterWithCarry,
  addImmediate,
  addImmediateWithCarry,
  addIndirectHLWithCarry,
  subtractRegister,
  subtractIndirectHL,
  subtractImmediate,
  subtractRegisterWithCarry,
  subtractIndirectHLWithCarry,
  subtractImmediateWithCarry,
  compareRegister,
  compareIndirectHL,
  compareImmediate,
  incrementRegister,
  incrementIndirectHL,
  decrementRegister,
  decrementIndirectHL,
  andRegister,
  andIndirectHL,
  andImmediate,
  orRegister,
  orIndirectHL,
  orImmediate,
  xorRegister,
  xorIndirectHL,
  xorImmediate,
  complementCarryFlag,
  setCarryFlag,
  decimalAdjustAccumulator,
  complementAccumulator,
} from "./instructions";
import * as Memory from "./memory";

beforeEach(() => {
  resetRegisters();
  Memory.reset();
});

describe("8-bit load instructions", () => {
  test("LD r,r'", () => {
    writeRegister8("B", 0x3c);
    writeRegister8("D", 0x5c);

    loadRegisterFromRegister("A", "B");
    loadRegisterFromRegister("B", "D");

    expect(readRegister8("A")).toBe(0x3c);
    expect(readRegister8("B")).toBe(0x5c);
  });

  test("LD r,n", () => {
    Memory.write(0, 0x24);

    loadRegisterFromImmediate("B");

    expect(readRegister8("B")).toBe(0x24);
  });

  test("LD r,(HL)", () => {
    Memory.write(0x8ac5, 0x5c);
    writeRegisterPair("HL", 0x8ac5);

    loadRegisterFromIndirectHL("H");

    expect(readRegister8("H")).toBe(0x5c);
  });

  test("LD (HL),r", () => {
    writeRegister8("A", 0x3c);
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

    expect(readRegister8("A")).toBe(0x2f);
  });

  test("LD A,(DE)", () => {
    writeRegisterPair("DE", 0x8ac5);
    Memory.write(0x8ac5, 0x5f);

    loadAccumulatorFromIndirectDE();

    expect(readRegister8("A")).toBe(0x5f);
  });

  test("LD (BC),A", () => {
    writeRegisterPair("BC", 0x205f);
    writeRegister8("A", 0x56);

    loadIndirectBCFromAccumulator();

    expect(Memory.read(0x205f)).toBe(0x56);
  });

  test("LD (DE),A", () => {
    writeRegisterPair("DE", 0x205c);
    writeRegister8("A", 0xaa);

    loadIndirectDEFromAccumulator();

    expect(Memory.read(0x205c)).toBe(0xaa);
  });

  test("LD A,(nn)", () => {
    Memory.write(0, getLowByte(0x8000));
    Memory.write(1, getHighByte(0x8000));
    Memory.write(0x8000, 0x5c);

    loadAccumulatorFromDirectWord();

    expect(readRegister8("A")).toBe(0x5c);
  });

  test("LD (nn),A", () => {
    Memory.write(0, getLowByte(0x8000));
    Memory.write(1, getHighByte(0x8000));
    writeRegister8("A", 0x2f);

    loadDirectWordFromAccumulator();

    expect(Memory.read(0x8000)).toBe(0x2f);
  });

  test("LD A,(C)", () => {
    Memory.write(0xff95, 0x2c);
    writeRegister8("C", 0x95);

    loadAccumulatorFromIndirectC();

    expect(readRegister8("A")).toBe(0x2c);
  });

  test("LD (C),A", () => {
    writeRegister8("A", 0x5c);
    writeRegister8("C", 0x9f);

    loadIndirectCFromAccumulator();

    expect(Memory.read(0xff9f)).toBe(0x5c);
  });

  test("LD A,(n)", () => {
    Memory.write(0, getLowByte(0x34));
    Memory.write(0xff34, 0x5f);

    loadAccumulatorFromDirectByte();

    expect(readRegister8("A")).toBe(0x5f);
  });

  test("LD (n),A", () => {
    Memory.write(0, getLowByte(0x34));
    writeRegister8("A", 0x2f);

    loadDirectByteFromAccumulator();

    expect(Memory.read(0xff34)).toBe(0x2f);
  });

  test("LD A,(HLD)", () => {
    writeRegisterPair("HL", 0x8a5c);
    Memory.write(0x8a5c, 0x3c);

    loadAccumulatorFromIndirectHLDecrement();

    expect(readRegister8("A")).toBe(0x3c);
    expect(readRegisterPair("HL")).toBe(0x8a5b);
  });

  test("LD A,(HLI)", () => {
    writeRegisterPair("HL", 0x1ff);
    Memory.write(0x1ff, 0x56);

    loadAccumulatorFromIndirectHLIncrement();

    expect(readRegister8("A")).toBe(0x56);
    expect(readRegisterPair("HL")).toBe(0x200);
  });

  test("LD (HLD),A", () => {
    writeRegisterPair("HL", 0x4000);
    writeRegister8("A", 0x5);

    loadIndirectHLDecrementFromAccumulator();

    expect(Memory.read(0x4000)).toBe(0x5);
    expect(readRegisterPair("HL")).toBe(0x3fff);
  });

  test("LD (HLI),A", () => {
    writeRegisterPair("HL", 0xffff);
    writeRegister8("A", 0x56);

    loadIndirectHLIncrementFromAccumulator();

    expect(Memory.read(0xffff)).toBe(0x56);
    expect(readRegisterPair("HL")).toBe(0x0);
  });
});

describe("16-bit load instructions", () => {
  test("LD dd,nn", () => {
    Memory.write(0x00, 0x5b);
    Memory.write(0x01, 0x3a);

    loadRegisterPair("HL");

    expect(readRegister8("H")).toBe(0x3a);
    expect(readRegister8("L")).toBe(0x5b);
  });

  test("LD (nn),SP", () => {
    writeRegister16("SP", 0xfff8);
    Memory.write(0x00, 0x00);
    Memory.write(0x01, 0xc1);

    loadDirectFromStackPointer();

    expect(Memory.read(0xc100)).toBe(0xf8);
    expect(Memory.read(0xc101)).toBe(0xff);
  });

  test("LD SP,HL", () => {
    writeRegisterPair("HL", 0x3a5b);

    loadStackPointerFromHL();

    expect(readRegister16("SP")).toBe(0x3a5b);
  });

  test("PUSH qq", () => {
    writeRegister16("SP", 0xfffe);
    writeRegisterPair("BC", 0x8ac5);

    pushToStack("BC");

    expect(Memory.read(0xfffd)).toBe(0x8a);
    expect(Memory.read(0xfffc)).toBe(0xc5);
    expect(readRegister16("SP")).toBe(0xfffc);
  });

  test("POP qq", () => {
    writeRegister16("SP", 0xfffc);
    Memory.write(0xfffc, 0x5f);
    Memory.write(0xfffd, 0x3c);

    popFromStack("BC");

    expect(readRegisterPair("BC")).toBe(0x3c5f);
    expect(readRegister16("SP")).toBe(0xfffe);
  });

  test("LDHL SP,e", () => {
    writeRegister16("SP", 0xfff8);
    Memory.write(0x00, 0x2);

    loadHLFromAdjustedStackPointer();

    expect(readRegisterPair("HL")).toBe(0xfffa);
    expect(isSetFlag("Z")).toBe(false);
    expect(isSetFlag("H")).toBe(false);
    expect(isSetFlag("N")).toBe(false);
    expect(isSetFlag("CY")).toBe(false);
  });
});

describe("8-bit arithmetic and logical instructions", () => {
  test("ADD A,r", () => {
    writeRegister8("A", 0x3a);
    writeRegister8("B", 0xc6);

    addRegister("B");

    expect(readRegister8("A")).toBe(0);
    expect(isSetFlag("Z")).toBe(true);
    expect(isSetFlag("H")).toBe(true);
    expect(isSetFlag("N")).toBe(false);
    expect(isSetFlag("CY")).toBe(true);
  });

  test("ADD A,(HL)", () => {
    writeRegister8("A", 0x3c);
    writeRegisterPair("HL", 0x3ab6);
    Memory.write(0x3ab6, 0x12);

    addIndirectHL();

    expect(readRegister8("A")).toBe(0x4e);
    expect(isSetFlag("Z")).toBe(false);
    expect(isSetFlag("H")).toBe(false);
    expect(isSetFlag("N")).toBe(false);
    expect(isSetFlag("CY")).toBe(false);
  });

  test("ADD A,n", () => {
    writeRegister8("A", 0x3c);
    Memory.write(0, 0xff);

    addImmediate();

    expect(readRegister8("A")).toBe(0x3b);
    expect(isSetFlag("Z")).toBe(false);
    expect(isSetFlag("H")).toBe(true);
    expect(isSetFlag("N")).toBe(false);
    expect(isSetFlag("CY")).toBe(true);
  });

  test("ADC A,r", () => {
    writeRegister8("A", 0xe1);
    writeRegister8("E", 0x0f);
    writeFlag("CY", true);

    addRegisterWithCarry("E");

    expect(readRegister8("A")).toBe(0xf1);
    expect(isSetFlag("Z")).toBe(false);
    expect(isSetFlag("H")).toBe(true);
    expect(isSetFlag("N")).toBe(false);
    expect(isSetFlag("CY")).toBe(false);
  });

  test("ADC A,(HL)", () => {
    writeRegister8("A", 0xe1);
    writeRegisterPair("HL", 0x8ac5);
    Memory.write(0x8ac5, 0x1e);
    writeFlag("CY", true);

    addIndirectHLWithCarry();

    expect(readRegister8("A")).toBe(0x00);
    expect(isSetFlag("Z")).toBe(true);
    expect(isSetFlag("H")).toBe(true);
    expect(isSetFlag("N")).toBe(false);
    expect(isSetFlag("CY")).toBe(true);
  });

  test("ADC A,n", () => {
    writeRegister8("A", 0xe1);
    Memory.write(0, 0x3b);
    writeFlag("CY", true);

    addImmediateWithCarry();

    expect(readRegister8("A")).toBe(0x1d);
    expect(isSetFlag("Z")).toBe(false);
    expect(isSetFlag("H")).toBe(false);
    expect(isSetFlag("N")).toBe(false);
    expect(isSetFlag("CY")).toBe(true);
  });

  test("SUB r", () => {
    writeRegister8("A", 0x3e);
    writeRegister8("E", 0x3e);

    subtractRegister("E");

    expect(readRegister8("A")).toBe(0);
    expect(isSetFlag("Z")).toBe(true);
    expect(isSetFlag("H")).toBe(false);
    expect(isSetFlag("N")).toBe(true);
    expect(isSetFlag("CY")).toBe(false);
  });

  test("SUB (HL)", () => {
    writeRegister8("A", 0x3e);
    writeRegisterPair("HL", 0x8ac5);
    Memory.write(0x8ac5, 0x40);

    subtractIndirectHL();

    expect(readRegister8("A")).toBe(0xfe);
    expect(isSetFlag("Z")).toBe(false);
    expect(isSetFlag("H")).toBe(false);
    expect(isSetFlag("N")).toBe(true);
    expect(isSetFlag("CY")).toBe(true);
  });

  test("SUB n", () => {
    writeRegister8("A", 0x3e);
    Memory.write(0, 0x0f);

    subtractImmediate();

    expect(readRegister8("A")).toBe(0x2f);
    expect(isSetFlag("Z")).toBe(false);
    expect(isSetFlag("H")).toBe(true);
    expect(isSetFlag("N")).toBe(true);
    expect(isSetFlag("CY")).toBe(false);
  });

  test("SBC A,r", () => {
    writeRegister8("A", 0x3b);
    writeRegister8("H", 0x2a);
    writeFlag("CY", true);

    subtractRegisterWithCarry("H");

    expect(readRegister8("A")).toBe(0x10);
    expect(isSetFlag("Z")).toBe(false);
    expect(isSetFlag("H")).toBe(false);
    expect(isSetFlag("N")).toBe(true);
    expect(isSetFlag("CY")).toBe(false);
  });

  test("SBC A,(HL)", () => {
    writeRegister8("A", 0x3b);
    writeRegisterPair("HL", 0x8ac5);
    Memory.write(0x8ac5, 0x4f);
    writeFlag("CY", true);

    subtractIndirectHLWithCarry();

    expect(readRegister8("A")).toBe(0xeb);
    expect(isSetFlag("Z")).toBe(false);
    expect(isSetFlag("H")).toBe(true);
    expect(isSetFlag("N")).toBe(true);
    expect(isSetFlag("CY")).toBe(true);
  });

  test("SBC A,n", () => {
    writeRegister8("A", 0x3b);
    Memory.write(0, 0x3a);
    writeFlag("CY", true);

    subtractImmediateWithCarry();

    expect(readRegister8("A")).toBe(0x00);
    expect(isSetFlag("Z")).toBe(true);
    expect(isSetFlag("H")).toBe(false);
    expect(isSetFlag("N")).toBe(true);
    expect(isSetFlag("CY")).toBe(false);
  });

  test("CP r", () => {
    writeRegister8("A", 0x3c);
    writeRegister8("B", 0x2f);

    compareRegister("B");

    expect(isSetFlag("Z")).toBe(false);
    expect(isSetFlag("H")).toBe(true);
    expect(isSetFlag("N")).toBe(true);
    expect(isSetFlag("CY")).toBe(false);
  });

  test("CP (HL)", () => {
    writeRegister8("A", 0x3c);
    writeRegisterPair("HL", 0x3ab6);
    Memory.write(0x3ab6, 0x40);

    compareIndirectHL();

    expect(isSetFlag("Z")).toBe(false);
    expect(isSetFlag("H")).toBe(false);
    expect(isSetFlag("N")).toBe(true);
    expect(isSetFlag("CY")).toBe(true);
  });

  test("CP n", () => {
    writeRegister8("A", 0x3c);
    Memory.write(0, 0x3c);

    compareImmediate();

    expect(isSetFlag("Z")).toBe(true);
    expect(isSetFlag("H")).toBe(false);
    expect(isSetFlag("N")).toBe(true);
    expect(isSetFlag("CY")).toBe(false);
  });

  test("INC r", () => {
    writeRegister8("A", 0xff);

    incrementRegister("A");

    expect(readRegister8("A")).toBe(0x00);
    expect(isSetFlag("Z")).toBe(true);
    expect(isSetFlag("H")).toBe(true);
    expect(isSetFlag("N")).toBe(false);
  });

  test("INC (HL)", () => {
    writeRegisterPair("HL", 0x8ac5);
    Memory.write(0x8ac5, 0x50);

    incrementIndirectHL();

    expect(Memory.read(readRegisterPair("HL"))).toBe(0x51);
    expect(isSetFlag("Z")).toBe(false);
    expect(isSetFlag("H")).toBe(false);
    expect(isSetFlag("N")).toBe(false);
  });

  test("DEC r", () => {
    writeRegister8("L", 0x01);

    decrementRegister("L");

    expect(readRegister8("L")).toBe(0x00);
    expect(isSetFlag("Z")).toBe(true);
    expect(isSetFlag("H")).toBe(false);
    expect(isSetFlag("N")).toBe(true);
  });

  test("DEC (HL)", () => {
    writeRegisterPair("HL", 0xff34);
    Memory.write(0xff34, 0x00);

    decrementIndirectHL();

    expect(Memory.read(readRegisterPair("HL"))).toBe(0xff);
    expect(isSetFlag("Z")).toBe(false);
    expect(isSetFlag("H")).toBe(true);
    expect(isSetFlag("N")).toBe(true);
  });

  test("AND r", () => {
    writeRegister8("A", 0x5a);
    writeRegister8("L", 0x3f);

    andRegister("L");

    expect(readRegister8("A")).toBe(0x1a);
    expect(isSetFlag("Z")).toBe(false);
    expect(isSetFlag("H")).toBe(true);
    expect(isSetFlag("N")).toBe(false);
    expect(isSetFlag("CY")).toBe(false);
  });

  test("AND (HL)", () => {
    writeRegister8("A", 0x5a);
    writeRegisterPair("HL", 0x8ac5);
    Memory.write(0x8ac5, 0x00);

    andIndirectHL();

    expect(readRegister8("A")).toBe(0x00);
    expect(isSetFlag("Z")).toBe(true);
    expect(isSetFlag("H")).toBe(true);
    expect(isSetFlag("N")).toBe(false);
    expect(isSetFlag("CY")).toBe(false);
  });

  test("AND n", () => {
    writeRegister8("A", 0x5a);
    Memory.write(0, 0x38);

    andImmediate();

    expect(readRegister8("A")).toBe(0x18);
    expect(isSetFlag("Z")).toBe(false);
    expect(isSetFlag("H")).toBe(true);
    expect(isSetFlag("N")).toBe(false);
    expect(isSetFlag("CY")).toBe(false);
  });

  test("OR r", () => {
    writeRegister8("A", 0x5a);

    orRegister("A");

    expect(readRegister8("A")).toBe(0x5a);
    expect(isSetFlag("Z")).toBe(false);
    expect(isSetFlag("H")).toBe(false);
    expect(isSetFlag("N")).toBe(false);
    expect(isSetFlag("CY")).toBe(false);
  });

  test("OR (HL)", () => {
    writeRegister8("A", 0x5a);
    writeRegisterPair("HL", 0x8ac2);
    Memory.write(0x8ac2, 0x0f);

    orIndirectHL();

    expect(readRegister8("A")).toBe(0x5f);
    expect(isSetFlag("Z")).toBe(false);
    expect(isSetFlag("H")).toBe(false);
    expect(isSetFlag("N")).toBe(false);
    expect(isSetFlag("CY")).toBe(false);
  });

  test("OR n", () => {
    writeRegister8("A", 0x5a);
    Memory.write(0, 0x3);

    orImmediate();

    expect(readRegister8("A")).toBe(0x5b);
    expect(isSetFlag("Z")).toBe(false);
    expect(isSetFlag("H")).toBe(false);
    expect(isSetFlag("N")).toBe(false);
    expect(isSetFlag("CY")).toBe(false);
  });

  test("XOR r", () => {
    writeRegister8("A", 0xff);

    xorRegister("A");

    expect(readRegister8("A")).toBe(0x00);
    expect(isSetFlag("Z")).toBe(true);
    expect(isSetFlag("H")).toBe(false);
    expect(isSetFlag("N")).toBe(false);
    expect(isSetFlag("CY")).toBe(false);
  });

  test("XOR (HL)", () => {
    writeRegister8("A", 0xff);
    writeRegisterPair("HL", 0x8ac5);
    Memory.write(0x8ac5, 0x8a);

    xorIndirectHL();

    expect(readRegister8("A")).toBe(0x75);
    expect(isSetFlag("Z")).toBe(false);
    expect(isSetFlag("H")).toBe(false);
    expect(isSetFlag("N")).toBe(false);
    expect(isSetFlag("CY")).toBe(false);
  });

  test("XOR n", () => {
    writeRegister8("A", 0xff);
    Memory.write(0, 0xf);

    xorImmediate();

    expect(readRegister8("A")).toBe(0xf0);
    expect(isSetFlag("Z")).toBe(false);
    expect(isSetFlag("H")).toBe(false);
    expect(isSetFlag("N")).toBe(false);
    expect(isSetFlag("CY")).toBe(false);
  });

  test("CCF", () => {
    writeFlag("CY", true);

    complementCarryFlag();
    expect(isSetFlag("CY")).toBe(false);

    complementCarryFlag();
    expect(isSetFlag("CY")).toBe(true);
  });

  test("SCF", () => {
    writeFlag("CY", false);

    setCarryFlag();
    expect(isSetFlag("CY")).toBe(true);

    setCarryFlag();
    expect(isSetFlag("CY")).toBe(true);
  });

  test("DAA", () => {
    writeRegister8("A", 0x45);
    writeRegister8("B", 0x38);

    addRegister("B");
    expect(readRegister8("A")).toBe(0x7d);
    expect(isSetFlag("N")).toBe(false);

    decimalAdjustAccumulator();
    expect(readRegister8("A")).toBe(0x83);
    expect(isSetFlag("CY")).toBe(false);

    subtractRegister("B");
    expect(readRegister8("A")).toBe(0x4b);
    expect(isSetFlag("N")).toBe(true);

    decimalAdjustAccumulator();
    expect(readRegister8("A")).toBe(0x45);
    expect(isSetFlag("CY")).toBe(false);
  });

  test("CPL", () => {
    writeRegister8("A", 0x35);

    complementAccumulator();

    expect(readRegister8("A")).toBe(0xca);
    expect(isSetFlag("H")).toBe(true);
    expect(isSetFlag("N")).toBe(true);
  });
});
