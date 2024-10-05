import { describe, expect } from "vitest";

import { Register, RegisterPair } from "../regs";
import { getLSB, getMSB } from "../utils";

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
} from "./load8";
import { test } from "./test-lib";

describe("8-bit load instructions", () => {
  test("LD r,r'", ({ cpu, memory }) => {
    cpu.regs.write(Register.B, 0x3c);
    cpu.regs.write(Register.D, 0x5c);

    loadRegisterFromRegister({ cpu, memory }, Register.A, Register.B);
    loadRegisterFromRegister({ cpu, memory }, Register.B, Register.D);

    expect(cpu.regs.read(Register.A)).toBe(0x3c);
    expect(cpu.regs.read(Register.B)).toBe(0x5c);
  });

  test("LD r,n", ({ cpu, memory }) => {
    memory.write(0, 0x24);

    loadRegisterFromImmediate({ cpu, memory }, Register.B);

    expect(cpu.regs.read(Register.B)).toBe(0x24);
  });

  test("LD r,(HL)", ({ cpu, memory }) => {
    memory.write(0x8ac5, 0x5c);
    cpu.regs.writePair(RegisterPair.HL, 0x8ac5);

    loadRegisterFromIndirectHL({ cpu, memory }, Register.H);

    expect(cpu.regs.read(Register.H)).toBe(0x5c);
  });

  test("LD (HL),r", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x3c);
    cpu.regs.writePair(RegisterPair.HL, 0x8ac5);

    loadIndirectHLFromRegister({ cpu, memory }, Register.A);

    expect(memory.read(0x8ac5)).toBe(0x3c);
  });

  test("LD (HL),n", ({ cpu, memory }) => {
    cpu.regs.writePair(RegisterPair.HL, 0x8ac5);
    memory.write(0, 0x3c);

    loadIndirectHLFromImmediateData({ cpu, memory });

    expect(memory.read(0x8ac5)).toBe(0x3c);
  });

  test("LD A,(BC)", ({ cpu, memory }) => {
    cpu.regs.writePair(RegisterPair.BC, 0x8ac5);
    memory.write(0x8ac5, 0x2f);

    loadAccumulatorFromIndirectBC({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0x2f);
  });

  test("LD A,(DE)", ({ cpu, memory }) => {
    cpu.regs.writePair(RegisterPair.DE, 0x8ac5);
    memory.write(0x8ac5, 0x5f);

    loadAccumulatorFromIndirectDE({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0x5f);
  });

  test("LD (BC),A", ({ cpu, memory }) => {
    cpu.regs.writePair(RegisterPair.BC, 0x205f);
    cpu.regs.write(Register.A, 0x56);

    loadIndirectBCFromAccumulator({ cpu, memory });

    expect(memory.read(0x205f)).toBe(0x56);
  });

  test("LD (DE),A", ({ cpu, memory }) => {
    cpu.regs.writePair(RegisterPair.DE, 0x205c);
    cpu.regs.write(Register.A, 0xaa);

    loadIndirectDEFromAccumulator({ cpu, memory });

    expect(memory.read(0x205c)).toBe(0xaa);
  });

  test("LD A,(nn)", ({ cpu, memory }) => {
    memory.write(0, getLSB(0x8000));
    memory.write(1, getMSB(0x8000));
    memory.write(0x8000, 0x5c);

    loadAccumulatorFromDirectWord({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0x5c);
  });

  test("LD (nn),A", ({ cpu, memory }) => {
    memory.write(0, getLSB(0x8000));
    memory.write(1, getMSB(0x8000));
    cpu.regs.write(Register.A, 0x2f);

    loadDirectWordFromAccumulator({ cpu, memory });

    expect(memory.read(0x8000)).toBe(0x2f);
  });

  test("LD A,(C)", ({ cpu, memory }) => {
    memory.write(0xff95, 0x2c);
    cpu.regs.write(Register.C, 0x95);

    loadAccumulatorFromIndirectC({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0x2c);
  });

  test("LD (C),A", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x5c);
    cpu.regs.write(Register.C, 0x9f);

    loadIndirectCFromAccumulator({ cpu, memory });

    expect(memory.read(0xff9f)).toBe(0x5c);
  });

  test("LD A,(n)", ({ cpu, memory }) => {
    memory.write(0, getLSB(0x34));
    memory.write(0xff34, 0x5f);

    loadAccumulatorFromDirectByte({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0x5f);
  });

  test("LD (n),A", ({ cpu, memory }) => {
    memory.write(0, getLSB(0x34));
    cpu.regs.write(Register.A, 0x2f);

    loadDirectByteFromAccumulator({ cpu, memory });

    expect(memory.read(0xff34)).toBe(0x2f);
  });

  test("LD A,(HLD)", ({ cpu, memory }) => {
    cpu.regs.writePair(RegisterPair.HL, 0x8a5c);
    memory.write(0x8a5c, 0x3c);

    loadAccumulatorFromIndirectHLDecrement({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0x3c);
    expect(cpu.regs.readPair(RegisterPair.HL)).toBe(0x8a5b);
  });

  test("LD A,(HLI)", ({ cpu, memory }) => {
    cpu.regs.writePair(RegisterPair.HL, 0x1ff);
    memory.write(0x1ff, 0x56);

    loadAccumulatorFromIndirectHLIncrement({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0x56);
    expect(cpu.regs.readPair(RegisterPair.HL)).toBe(0x200);
  });

  test("LD (HLD),A", ({ cpu, memory }) => {
    cpu.regs.writePair(RegisterPair.HL, 0x4000);
    cpu.regs.write(Register.A, 0x5);

    loadIndirectHLDecrementFromAccumulator({ cpu, memory });

    expect(memory.read(0x4000)).toBe(0x5);
    expect(cpu.regs.readPair(RegisterPair.HL)).toBe(0x3fff);
  });

  test("LD (HLI),A", ({ cpu, memory }) => {
    cpu.regs.writePair(RegisterPair.HL, 0xffff);
    cpu.regs.write(Register.A, 0x56);

    loadIndirectHLIncrementFromAccumulator({ cpu, memory });

    expect(memory.read(0xffff)).toBe(0x56);
    expect(cpu.regs.readPair(RegisterPair.HL)).toBe(0x0);
  });
});
