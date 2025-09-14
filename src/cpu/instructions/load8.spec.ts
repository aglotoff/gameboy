import { describe, expect } from "vitest";

import { Register, RegisterPair } from "../register";
import { testCpuState } from "../test-lib";
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
  testCpuState("LD r,r'", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.B, 0x3c);
    ctx.writeRegister(Register.D, 0x5c);

    loadRegisterFromRegister(ctx, Register.A, Register.B);
    loadRegisterFromRegister(ctx, Register.B, Register.D);

    expect(ctx.readRegister(Register.A)).toBe(0x3c);
    expect(ctx.readRegister(Register.B)).toBe(0x5c);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("LD r,n", ({ ctx, onCycle }) => {
    ctx.writeMemory(0, 0x24);

    loadRegisterFromImmediate(ctx, Register.B);

    expect(ctx.readRegister(Register.B)).toBe(0x24);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("LD r,(HL)", ({ ctx, onCycle }) => {
    ctx.writeMemory(0x8ac5, 0x5c);
    ctx.writeRegisterPair(RegisterPair.HL, 0x8ac5);

    loadRegisterFromIndirectHL(ctx, Register.H);

    expect(ctx.readRegister(Register.H)).toBe(0x5c);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("LD (HL),r", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x3c);
    ctx.writeRegisterPair(RegisterPair.HL, 0x8ac5);

    loadIndirectHLFromRegister(ctx, Register.A);

    expect(ctx.readMemory(0x8ac5)).toBe(0x3c);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("LD (HL),n", ({ ctx, onCycle }) => {
    ctx.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    ctx.writeMemory(0, 0x3c);

    loadIndirectHLFromImmediateData(ctx);

    expect(ctx.readMemory(0x8ac5)).toBe(0x3c);
    expect(onCycle).toBeCalledTimes(3);
  });

  testCpuState("LD A,(BC)", ({ ctx, onCycle }) => {
    ctx.writeRegisterPair(RegisterPair.BC, 0x8ac5);
    ctx.writeMemory(0x8ac5, 0x2f);

    loadAccumulatorFromIndirectBC(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0x2f);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("LD A,(DE)", ({ ctx, onCycle }) => {
    ctx.writeRegisterPair(RegisterPair.DE, 0x8ac5);
    ctx.writeMemory(0x8ac5, 0x5f);

    loadAccumulatorFromIndirectDE(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0x5f);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("LD (BC),A", ({ ctx, onCycle }) => {
    ctx.writeRegisterPair(RegisterPair.BC, 0x205f);
    ctx.writeRegister(Register.A, 0x56);

    loadIndirectBCFromAccumulator(ctx);

    expect(ctx.readMemory(0x205f)).toBe(0x56);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("LD (DE),A", ({ ctx, onCycle }) => {
    ctx.writeRegisterPair(RegisterPair.DE, 0x205c);
    ctx.writeRegister(Register.A, 0xaa);

    loadIndirectDEFromAccumulator(ctx);

    expect(ctx.readMemory(0x205c)).toBe(0xaa);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("LD A,(nn)", ({ ctx, onCycle }) => {
    ctx.writeMemory(0, getLSB(0x8000));
    ctx.writeMemory(1, getMSB(0x8000));
    ctx.writeMemory(0x8000, 0x5c);

    loadAccumulatorFromDirectWord(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0x5c);
    expect(onCycle).toBeCalledTimes(4);
  });

  testCpuState("LD (nn),A", ({ ctx, onCycle }) => {
    ctx.writeMemory(0, getLSB(0x8000));
    ctx.writeMemory(1, getMSB(0x8000));
    ctx.writeRegister(Register.A, 0x2f);

    loadDirectWordFromAccumulator(ctx);

    expect(ctx.readMemory(0x8000)).toBe(0x2f);
    expect(onCycle).toBeCalledTimes(4);
  });

  testCpuState("LD A,(C)", ({ ctx, onCycle }) => {
    ctx.writeMemory(0xff95, 0x2c);
    ctx.writeRegister(Register.C, 0x95);

    loadAccumulatorFromIndirectC(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0x2c);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("LD (C),A", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x5c);
    ctx.writeRegister(Register.C, 0x9f);

    loadIndirectCFromAccumulator(ctx);

    expect(ctx.readMemory(0xff9f)).toBe(0x5c);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("LD A,(n)", ({ ctx, onCycle }) => {
    ctx.writeMemory(0, getLSB(0x34));
    ctx.writeMemory(0xff34, 0x5f);

    loadAccumulatorFromDirectByte(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0x5f);
    expect(onCycle).toBeCalledTimes(3);
  });

  testCpuState("LD (n),A", ({ ctx, onCycle }) => {
    ctx.writeMemory(0, getLSB(0x34));
    ctx.writeRegister(Register.A, 0x2f);

    loadDirectByteFromAccumulator(ctx);

    expect(ctx.readMemory(0xff34)).toBe(0x2f);
    expect(onCycle).toBeCalledTimes(3);
  });

  testCpuState("LD A,(HLD)", ({ ctx, onCycle }) => {
    ctx.writeRegisterPair(RegisterPair.HL, 0x8a5c);
    ctx.writeMemory(0x8a5c, 0x3c);

    loadAccumulatorFromIndirectHLDecrement(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0x3c);
    expect(ctx.readRegisterPair(RegisterPair.HL)).toBe(0x8a5b);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("LD A,(HLI)", ({ ctx, onCycle }) => {
    ctx.writeRegisterPair(RegisterPair.HL, 0x1ff);
    ctx.writeMemory(0x1ff, 0x56);

    loadAccumulatorFromIndirectHLIncrement(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0x56);
    expect(ctx.readRegisterPair(RegisterPair.HL)).toBe(0x200);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("LD (HLD),A", ({ ctx, onCycle }) => {
    ctx.writeRegisterPair(RegisterPair.HL, 0x4000);
    ctx.writeRegister(Register.A, 0x5);

    loadIndirectHLDecrementFromAccumulator(ctx);

    expect(ctx.readMemory(0x4000)).toBe(0x5);
    expect(ctx.readRegisterPair(RegisterPair.HL)).toBe(0x3fff);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("LD (HLI),A", ({ ctx, onCycle }) => {
    ctx.writeRegisterPair(RegisterPair.HL, 0xffff);
    ctx.writeRegister(Register.A, 0x56);

    loadIndirectHLIncrementFromAccumulator(ctx);

    expect(ctx.readMemory(0xffff)).toBe(0x56);
    expect(ctx.readRegisterPair(RegisterPair.HL)).toBe(0x0000);
    expect(onCycle).toBeCalledTimes(2);
  });
});
