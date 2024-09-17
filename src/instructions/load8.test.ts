import { describe, expect, test as baseTest } from "vitest";

import { Register, RegisterFile, RegisterPair } from "../cpu";
import { Memory } from "../memory";
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
import { InstructionCtx } from "./lib";

const test = baseTest.extend({
  ctx: async ({}, use: (ctx: InstructionCtx) => Promise<void>) => {
    await use({ regs: new RegisterFile(), memory: new Memory() });
  },
});

describe("8-bit load instructions", () => {
  test("LD r,r'", ({ ctx }) => {
    ctx.regs.write(Register.B, 0x3c);
    ctx.regs.write(Register.D, 0x5c);

    loadRegisterFromRegister(ctx, Register.A, Register.B);
    loadRegisterFromRegister(ctx, Register.B, Register.D);

    expect(ctx.regs.read(Register.A)).toBe(0x3c);
    expect(ctx.regs.read(Register.B)).toBe(0x5c);
  });

  test("LD r,n", ({ ctx }) => {
    ctx.memory.write(0, 0x24);

    loadRegisterFromImmediate(ctx, Register.B);

    expect(ctx.regs.read(Register.B)).toBe(0x24);
  });

  test("LD r,(HL)", ({ ctx }) => {
    ctx.memory.write(0x8ac5, 0x5c);
    ctx.regs.writePair(RegisterPair.HL, 0x8ac5);

    loadRegisterFromIndirectHL(ctx, Register.H);

    expect(ctx.regs.read(Register.H)).toBe(0x5c);
  });

  test("LD (HL),r", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x3c);
    ctx.regs.writePair(RegisterPair.HL, 0x8ac5);

    loadIndirectHLFromRegister(ctx, Register.A);

    expect(ctx.memory.read(0x8ac5)).toBe(0x3c);
  });

  test("LD (HL),n", ({ ctx }) => {
    ctx.regs.writePair(RegisterPair.HL, 0x8ac5);
    ctx.memory.write(0, 0x3c);

    loadIndirectHLFromImmediateData(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0x3c);
  });

  test("LD A,(BC)", ({ ctx }) => {
    ctx.regs.writePair(RegisterPair.BC, 0x8ac5);
    ctx.memory.write(0x8ac5, 0x2f);

    loadAccumulatorFromIndirectBC(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0x2f);
  });

  test("LD A,(DE)", ({ ctx }) => {
    ctx.regs.writePair(RegisterPair.DE, 0x8ac5);
    ctx.memory.write(0x8ac5, 0x5f);

    loadAccumulatorFromIndirectDE(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0x5f);
  });

  test("LD (BC),A", ({ ctx }) => {
    ctx.regs.writePair(RegisterPair.BC, 0x205f);
    ctx.regs.write(Register.A, 0x56);

    loadIndirectBCFromAccumulator(ctx);

    expect(ctx.memory.read(0x205f)).toBe(0x56);
  });

  test("LD (DE),A", ({ ctx }) => {
    ctx.regs.writePair(RegisterPair.DE, 0x205c);
    ctx.regs.write(Register.A, 0xaa);

    loadIndirectDEFromAccumulator(ctx);

    expect(ctx.memory.read(0x205c)).toBe(0xaa);
  });

  test("LD A,(nn)", ({ ctx }) => {
    ctx.memory.write(0, getLSB(0x8000));
    ctx.memory.write(1, getMSB(0x8000));
    ctx.memory.write(0x8000, 0x5c);

    loadAccumulatorFromDirectWord(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0x5c);
  });

  test("LD (nn),A", ({ ctx }) => {
    ctx.memory.write(0, getLSB(0x8000));
    ctx.memory.write(1, getMSB(0x8000));
    ctx.regs.write(Register.A, 0x2f);

    loadDirectWordFromAccumulator(ctx);

    expect(ctx.memory.read(0x8000)).toBe(0x2f);
  });

  test("LD A,(C)", ({ ctx }) => {
    ctx.memory.write(0xff95, 0x2c);
    ctx.regs.write(Register.C, 0x95);

    loadAccumulatorFromIndirectC(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0x2c);
  });

  test("LD (C),A", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x5c);
    ctx.regs.write(Register.C, 0x9f);

    loadIndirectCFromAccumulator(ctx);

    expect(ctx.memory.read(0xff9f)).toBe(0x5c);
  });

  test("LD A,(n)", ({ ctx }) => {
    ctx.memory.write(0, getLSB(0x34));
    ctx.memory.write(0xff34, 0x5f);

    loadAccumulatorFromDirectByte(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0x5f);
  });

  test("LD (n),A", ({ ctx }) => {
    ctx.memory.write(0, getLSB(0x34));
    ctx.regs.write(Register.A, 0x2f);

    loadDirectByteFromAccumulator(ctx);

    expect(ctx.memory.read(0xff34)).toBe(0x2f);
  });

  test("LD A,(HLD)", ({ ctx }) => {
    ctx.regs.writePair(RegisterPair.HL, 0x8a5c);
    ctx.memory.write(0x8a5c, 0x3c);

    loadAccumulatorFromIndirectHLDecrement(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0x3c);
    expect(ctx.regs.readPair(RegisterPair.HL)).toBe(0x8a5b);
  });

  test("LD A,(HLI)", ({ ctx }) => {
    ctx.regs.writePair(RegisterPair.HL, 0x1ff);
    ctx.memory.write(0x1ff, 0x56);

    loadAccumulatorFromIndirectHLIncrement(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0x56);
    expect(ctx.regs.readPair(RegisterPair.HL)).toBe(0x200);
  });

  test("LD (HLD),A", ({ ctx }) => {
    ctx.regs.writePair(RegisterPair.HL, 0x4000);
    ctx.regs.write(Register.A, 0x5);

    loadIndirectHLDecrementFromAccumulator(ctx);

    expect(ctx.memory.read(0x4000)).toBe(0x5);
    expect(ctx.regs.readPair(RegisterPair.HL)).toBe(0x3fff);
  });

  test("LD (HLI),A", ({ ctx }) => {
    ctx.regs.writePair(RegisterPair.HL, 0xffff);
    ctx.regs.write(Register.A, 0x56);

    loadIndirectHLIncrementFromAccumulator(ctx);

    expect(ctx.memory.read(0xffff)).toBe(0x56);
    expect(ctx.regs.readPair(RegisterPair.HL)).toBe(0x0);
  });
});
