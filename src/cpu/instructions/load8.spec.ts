import { describe, expect } from "vitest";

import { Register, RegisterPair } from "../register";
import { testInstructions } from "../test-lib";
import { getLSB, getMSB } from "../../utils";

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

describe("8-bit load instructions", () => {
  testInstructions("LD r,r'", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.B, 0x3c);
    ctx.registers.write(Register.D, 0x5c);

    loadRegisterFromRegister(ctx, Register.A, Register.B);
    loadRegisterFromRegister(ctx, Register.B, Register.D);

    expect(ctx.registers.read(Register.A)).toBe(0x3c);
    expect(ctx.registers.read(Register.B)).toBe(0x5c);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("LD r,n", ({ ctx, onCycle }) => {
    ctx.memory.write(0, 0x24);

    loadRegisterFromImmediate(ctx, Register.B);

    expect(ctx.registers.read(Register.B)).toBe(0x24);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("LD r,(HL)", ({ ctx, onCycle }) => {
    ctx.memory.write(0x8ac5, 0x5c);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);

    loadRegisterFromIndirectHL(ctx, Register.H);

    expect(ctx.registers.read(Register.H)).toBe(0x5c);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("LD (HL),r", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x3c);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);

    loadIndirectHLFromRegister(ctx, Register.A);

    expect(ctx.memory.read(0x8ac5)).toBe(0x3c);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("LD (HL),n", ({ ctx, onCycle }) => {
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.memory.write(0, 0x3c);

    loadIndirectHLFromImmediateData(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0x3c);
    expect(onCycle).toBeCalledTimes(3);
  });

  testInstructions("LD A,(BC)", ({ ctx, onCycle }) => {
    ctx.registers.writePair(RegisterPair.BC, 0x8ac5);
    ctx.memory.write(0x8ac5, 0x2f);

    loadAccumulatorFromIndirectBC(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x2f);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("LD A,(DE)", ({ ctx, onCycle }) => {
    ctx.registers.writePair(RegisterPair.DE, 0x8ac5);
    ctx.memory.write(0x8ac5, 0x5f);

    loadAccumulatorFromIndirectDE(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x5f);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("LD (BC),A", ({ ctx, onCycle }) => {
    ctx.registers.writePair(RegisterPair.BC, 0x205f);
    ctx.registers.write(Register.A, 0x56);

    loadIndirectBCFromAccumulator(ctx);

    expect(ctx.memory.read(0x205f)).toBe(0x56);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("LD (DE),A", ({ ctx, onCycle }) => {
    ctx.registers.writePair(RegisterPair.DE, 0x205c);
    ctx.registers.write(Register.A, 0xaa);

    loadIndirectDEFromAccumulator(ctx);

    expect(ctx.memory.read(0x205c)).toBe(0xaa);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("LD A,(nn)", ({ ctx, onCycle }) => {
    ctx.memory.write(0, getLSB(0x8000));
    ctx.memory.write(1, getMSB(0x8000));
    ctx.memory.write(0x8000, 0x5c);

    loadAccumulatorFromDirectWord(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x5c);
    expect(onCycle).toBeCalledTimes(4);
  });

  testInstructions("LD (nn),A", ({ ctx, onCycle }) => {
    ctx.memory.write(0, getLSB(0x8000));
    ctx.memory.write(1, getMSB(0x8000));
    ctx.registers.write(Register.A, 0x2f);

    loadDirectWordFromAccumulator(ctx);

    expect(ctx.memory.read(0x8000)).toBe(0x2f);
    expect(onCycle).toBeCalledTimes(4);
  });

  testInstructions("LD A,(C)", ({ ctx, onCycle }) => {
    ctx.memory.write(0xff95, 0x2c);
    ctx.registers.write(Register.C, 0x95);

    loadAccumulatorFromIndirectC(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x2c);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("LD (C),A", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x5c);
    ctx.registers.write(Register.C, 0x9f);

    loadIndirectCFromAccumulator(ctx);

    expect(ctx.memory.read(0xff9f)).toBe(0x5c);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("LD A,(n)", ({ ctx, onCycle }) => {
    ctx.memory.write(0, getLSB(0x34));
    ctx.memory.write(0xff34, 0x5f);

    loadAccumulatorFromDirectByte(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x5f);
    expect(onCycle).toBeCalledTimes(3);
  });

  testInstructions("LD (n),A", ({ ctx, onCycle }) => {
    ctx.memory.write(0, getLSB(0x34));
    ctx.registers.write(Register.A, 0x2f);

    loadDirectByteFromAccumulator(ctx);

    expect(ctx.memory.read(0xff34)).toBe(0x2f);
    expect(onCycle).toBeCalledTimes(3);
  });

  testInstructions("LD A,(HLD)", ({ ctx, onCycle }) => {
    ctx.registers.writePair(RegisterPair.HL, 0x8a5c);
    ctx.memory.write(0x8a5c, 0x3c);

    loadAccumulatorFromIndirectHLDecrement(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x3c);
    expect(ctx.registers.readPair(RegisterPair.HL)).toBe(0x8a5b);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("LD A,(HLI)", ({ ctx, onCycle }) => {
    ctx.registers.writePair(RegisterPair.HL, 0x1ff);
    ctx.memory.write(0x1ff, 0x56);

    loadAccumulatorFromIndirectHLIncrement(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x56);
    expect(ctx.registers.readPair(RegisterPair.HL)).toBe(0x200);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("LD (HLD),A", ({ ctx, onCycle }) => {
    ctx.registers.writePair(RegisterPair.HL, 0x4000);
    ctx.registers.write(Register.A, 0x5);

    loadIndirectHLDecrementFromAccumulator(ctx);

    expect(ctx.memory.read(0x4000)).toBe(0x5);
    expect(ctx.registers.readPair(RegisterPair.HL)).toBe(0x3fff);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("LD (HLI),A", ({ ctx, onCycle }) => {
    ctx.registers.writePair(RegisterPair.HL, 0xffff);
    ctx.registers.write(Register.A, 0x56);

    loadIndirectHLIncrementFromAccumulator(ctx);

    expect(ctx.memory.read(0xffff)).toBe(0x56);
    expect(ctx.registers.readPair(RegisterPair.HL)).toBe(0x0000);
    expect(onCycle).toBeCalledTimes(2);
  });
});
