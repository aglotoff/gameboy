import { describe, expect } from "vitest";

import { Register, RegisterPair } from "../register";
import { getLSB, getMSB } from "../../utils";

import { testInstruction } from "./test-lib";

import {
  loadPointerInHLFromImmediateData,
  loadRegisterFromImmediate,
  loadRegisterFromRegister,
  loadRegisterFromPointerInHL,
  loadPointerInHLFromRegister,
  loadAccumulatorFromPointerInBC,
  loadAccumulatorFromPointerInDE,
  loadPointerInBCFromAccumulator,
  loadPointerInDEFromAccumulator,
  loadAccumulatorFromDirectWord,
  loadDirectWordFromAccumulator,
  loadAccumulatorFromPointerInC,
  loadPointerInCFromAccumulator,
  loadAccumulatorFromDirectByte,
  loadDirectByteFromAccumulator,
  loadAccumulatorFromPointerInHLAndDecrement,
  loadAccumulatorFromPointerInHLAndIncrement,
  loadPointerInHLFromAccumulatorAndDecrement,
  loadPointerInHLFromAccumulatorAndIncrement,
} from "./load8";

describe("8-bit load instructions", () => {
  testInstruction("LD r,r'", ({ ctx }) => {
    ctx.registers.write(Register.B, 0x3c);
    ctx.registers.write(Register.D, 0x5c);

    loadRegisterFromRegister(ctx, Register.A, Register.B);
    loadRegisterFromRegister(ctx, Register.B, Register.D);

    expect(ctx.registers.read(Register.A)).toBe(0x3c);
    expect(ctx.registers.read(Register.B)).toBe(0x5c);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("LD r,n", ({ ctx }) => {
    ctx.memory.write(0, 0x24);

    loadRegisterFromImmediate(ctx, Register.B);

    expect(ctx.registers.read(Register.B)).toBe(0x24);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("LD r,(HL)", ({ ctx }) => {
    ctx.memory.write(0x8ac5, 0x5c);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);

    loadRegisterFromPointerInHL(ctx, Register.H);

    expect(ctx.registers.read(Register.H)).toBe(0x5c);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("LD (HL),r", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x3c);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);

    loadPointerInHLFromRegister(ctx, Register.A);

    expect(ctx.memory.read(0x8ac5)).toBe(0x3c);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("LD (HL),n", ({ ctx }) => {
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.memory.write(0, 0x3c);

    loadPointerInHLFromImmediateData(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0x3c);
    expect(ctx.state.getElapsedCycles()).toBe(3);
  });

  testInstruction("LD A,(BC)", ({ ctx }) => {
    ctx.registers.writePair(RegisterPair.BC, 0x8ac5);
    ctx.memory.write(0x8ac5, 0x2f);

    loadAccumulatorFromPointerInBC(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x2f);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("LD A,(DE)", ({ ctx }) => {
    ctx.registers.writePair(RegisterPair.DE, 0x8ac5);
    ctx.memory.write(0x8ac5, 0x5f);

    loadAccumulatorFromPointerInDE(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x5f);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("LD (BC),A", ({ ctx }) => {
    ctx.registers.writePair(RegisterPair.BC, 0x205f);
    ctx.registers.write(Register.A, 0x56);

    loadPointerInBCFromAccumulator(ctx);

    expect(ctx.memory.read(0x205f)).toBe(0x56);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("LD (DE),A", ({ ctx }) => {
    ctx.registers.writePair(RegisterPair.DE, 0x205c);
    ctx.registers.write(Register.A, 0xaa);

    loadPointerInDEFromAccumulator(ctx);

    expect(ctx.memory.read(0x205c)).toBe(0xaa);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("LD A,(nn)", ({ ctx }) => {
    ctx.memory.write(0, getLSB(0x8000));
    ctx.memory.write(1, getMSB(0x8000));
    ctx.memory.write(0x8000, 0x5c);

    loadAccumulatorFromDirectWord(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x5c);
    expect(ctx.state.getElapsedCycles()).toBe(4);
  });

  testInstruction("LD (nn),A", ({ ctx }) => {
    ctx.memory.write(0, getLSB(0x8000));
    ctx.memory.write(1, getMSB(0x8000));
    ctx.registers.write(Register.A, 0x2f);

    loadDirectWordFromAccumulator(ctx);

    expect(ctx.memory.read(0x8000)).toBe(0x2f);
    expect(ctx.state.getElapsedCycles()).toBe(4);
  });

  testInstruction("LD A,(C)", ({ ctx }) => {
    ctx.memory.write(0xff95, 0x2c);
    ctx.registers.write(Register.C, 0x95);

    loadAccumulatorFromPointerInC(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x2c);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("LD (C),A", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x5c);
    ctx.registers.write(Register.C, 0x9f);

    loadPointerInCFromAccumulator(ctx);

    expect(ctx.memory.read(0xff9f)).toBe(0x5c);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("LD A,(n)", ({ ctx }) => {
    ctx.memory.write(0, getLSB(0x34));
    ctx.memory.write(0xff34, 0x5f);

    loadAccumulatorFromDirectByte(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x5f);
    expect(ctx.state.getElapsedCycles()).toBe(3);
  });

  testInstruction("LD (n),A", ({ ctx }) => {
    ctx.memory.write(0, getLSB(0x34));
    ctx.registers.write(Register.A, 0x2f);

    loadDirectByteFromAccumulator(ctx);

    expect(ctx.memory.read(0xff34)).toBe(0x2f);
    expect(ctx.state.getElapsedCycles()).toBe(3);
  });

  testInstruction("LD A,(HLD)", ({ ctx }) => {
    ctx.registers.writePair(RegisterPair.HL, 0x8a5c);
    ctx.memory.write(0x8a5c, 0x3c);

    loadAccumulatorFromPointerInHLAndDecrement(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x3c);
    expect(ctx.registers.readPair(RegisterPair.HL)).toBe(0x8a5b);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("LD A,(HLI)", ({ ctx }) => {
    ctx.registers.writePair(RegisterPair.HL, 0x1ff);
    ctx.memory.write(0x1ff, 0x56);

    loadAccumulatorFromPointerInHLAndIncrement(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x56);
    expect(ctx.registers.readPair(RegisterPair.HL)).toBe(0x200);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("LD (HLD),A", ({ ctx }) => {
    ctx.registers.writePair(RegisterPair.HL, 0x4000);
    ctx.registers.write(Register.A, 0x5);

    loadPointerInHLFromAccumulatorAndDecrement(ctx);

    expect(ctx.memory.read(0x4000)).toBe(0x5);
    expect(ctx.registers.readPair(RegisterPair.HL)).toBe(0x3fff);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("LD (HLI),A", ({ ctx }) => {
    ctx.registers.writePair(RegisterPair.HL, 0xffff);
    ctx.registers.write(Register.A, 0x56);

    loadPointerInHLFromAccumulatorAndIncrement(ctx);

    expect(ctx.memory.read(0xffff)).toBe(0x56);
    expect(ctx.registers.readPair(RegisterPair.HL)).toBe(0x0000);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });
});
