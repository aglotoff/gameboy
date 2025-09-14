import { describe, expect } from "vitest";

import { Flag, Register, RegisterPair } from "../register";
import { testCpuState } from "../test-lib";

import {
  addImmediateToAccumulator,
  addImmediateToAccumulatorWithCarry,
  addIndirectHLToAccumulator,
  addIndirectHLToAccumulatorWithCarry,
  addRegisterToAccumulator,
  addRegisterToAccumulatorWithCarry,
  andAccumulatorWithImmediate,
  andAccumulatorWithIndirectHL,
  andAccumulatorWithRegister,
  compareAccumulatorToImmediate,
  compareAccumulatorToIndirectHL,
  compareAccumulatorToRegister,
  complementAccumulator,
  complementCarryFlag,
  decimalAdjustAccumulator,
  decrementIndirectHL,
  decrementRegister,
  incrementIndirectHL,
  incrementRegister,
  orAccumulatorWithImmediate,
  orAccumulatorWithIndirectHL,
  orAccumulatorWithRegister,
  setCarryFlag,
  subtractImmediateFromAccumualtor,
  subtractImmediateFromAccumualtorWithCarry,
  subtractIndirectHLFromAccumualtor,
  subtractIndirectHLFromAccumualtorWithCarry,
  subtractRegisterFromAccumualtor,
  subtractRegisterFromAccumualtorWithCarry,
  xorAccumulatorWithImmediate,
  xorAccumulatorWithIndirectHL,
  xorAccumulatorWithRegister,
} from "./arithmetic8";

describe("8-bit arithmetic and logical instructions", () => {
  testCpuState("ADD A,r8", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x3a);
    ctx.writeRegister(Register.B, 0xc6);

    addRegisterToAccumulator(ctx, Register.B);

    expect(ctx.readRegister(Register.A)).toBe(0);
    expect(ctx.getFlag(Flag.Z)).toBe(true);
    expect(ctx.getFlag(Flag.H)).toBe(true);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(ctx.getFlag(Flag.CY)).toBe(true);
    expect(onCycle).toBeCalledTimes(1);
  });

  testCpuState("ADD A,(HL)", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x3c);
    ctx.writeRegisterPair(RegisterPair.HL, 0x3ab6);
    ctx.writeMemory(0x3ab6, 0x12);

    addIndirectHLToAccumulator(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0x4e);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("ADD A,n8", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x3c);
    ctx.writeMemory(0, 0xff);

    addImmediateToAccumulator(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0x3b);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(true);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(ctx.getFlag(Flag.CY)).toBe(true);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("ADC A,r8", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0xe1);
    ctx.writeRegister(Register.E, 0x0f);
    ctx.setFlag(Flag.CY, true);

    addRegisterToAccumulatorWithCarry(ctx, Register.E);

    expect(ctx.readRegister(Register.A)).toBe(0xf1);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(true);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testCpuState("ADC A,(HL)", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0xe1);
    ctx.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    ctx.writeMemory(0x8ac5, 0x1e);
    ctx.setFlag(Flag.CY, true);

    addIndirectHLToAccumulatorWithCarry(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0x00);
    expect(ctx.getFlag(Flag.Z)).toBe(true);
    expect(ctx.getFlag(Flag.H)).toBe(true);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(ctx.getFlag(Flag.CY)).toBe(true);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("ADC A,n8", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0xe1);
    ctx.writeMemory(0, 0x3b);
    ctx.setFlag(Flag.CY, true);

    addImmediateToAccumulatorWithCarry(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0x1d);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(ctx.getFlag(Flag.CY)).toBe(true);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("SUB A,r8", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x3e);
    ctx.writeRegister(Register.E, 0x3e);

    subtractRegisterFromAccumualtor(ctx, Register.E);

    expect(ctx.readRegister(Register.A)).toBe(0);
    expect(ctx.getFlag(Flag.Z)).toBe(true);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(true);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testCpuState("SUB A,(HL)", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x3e);
    ctx.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    ctx.writeMemory(0x8ac5, 0x40);

    subtractIndirectHLFromAccumualtor(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0xfe);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(true);
    expect(ctx.getFlag(Flag.CY)).toBe(true);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("SUB A,n8", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x3e);
    ctx.writeMemory(0, 0x0f);

    subtractImmediateFromAccumualtor(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0x2f);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(true);
    expect(ctx.getFlag(Flag.N)).toBe(true);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("SBC A,r8", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x3b);
    ctx.writeRegister(Register.H, 0x2a);
    ctx.setFlag(Flag.CY, true);

    subtractRegisterFromAccumualtorWithCarry(ctx, Register.H);

    expect(ctx.readRegister(Register.A)).toBe(0x10);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(true);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testCpuState("SBC A,(HL)", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x3b);
    ctx.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    ctx.writeMemory(0x8ac5, 0x4f);
    ctx.setFlag(Flag.CY, true);

    subtractIndirectHLFromAccumualtorWithCarry(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0xeb);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(true);
    expect(ctx.getFlag(Flag.N)).toBe(true);
    expect(ctx.getFlag(Flag.CY)).toBe(true);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("SBC A,n8", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x3b);
    ctx.writeMemory(0, 0x3a);
    ctx.setFlag(Flag.CY, true);

    subtractImmediateFromAccumualtorWithCarry(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0x00);
    expect(ctx.getFlag(Flag.Z)).toBe(true);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(true);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("CP A,r8", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x3c);
    ctx.writeRegister(Register.B, 0x2f);

    compareAccumulatorToRegister(ctx, Register.B);

    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(true);
    expect(ctx.getFlag(Flag.N)).toBe(true);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testCpuState("CP A,(HL)", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x3c);
    ctx.writeRegisterPair(RegisterPair.HL, 0x3ab6);
    ctx.writeMemory(0x3ab6, 0x40);

    compareAccumulatorToIndirectHL(ctx);

    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(true);
    expect(ctx.getFlag(Flag.CY)).toBe(true);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("CP A,n8", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x3c);
    ctx.writeMemory(0, 0x3c);

    compareAccumulatorToImmediate(ctx);

    expect(ctx.getFlag(Flag.Z)).toBe(true);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(true);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("INC r", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0xff);

    incrementRegister(ctx, Register.A);

    expect(ctx.readRegister(Register.A)).toBe(0x00);
    expect(ctx.getFlag(Flag.Z)).toBe(true);
    expect(ctx.getFlag(Flag.H)).toBe(true);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testCpuState("INC (HL)", ({ ctx, onCycle }) => {
    ctx.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    ctx.writeMemory(0x8ac5, 0x50);

    incrementIndirectHL(ctx);

    expect(ctx.readMemory(ctx.readRegisterPair(RegisterPair.HL))).toBe(0x51);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(3);
  });

  testCpuState("DEC r", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.L, 0x01);

    decrementRegister(ctx, Register.L);

    expect(ctx.readRegister(Register.L)).toBe(0x00);
    expect(ctx.getFlag(Flag.Z)).toBe(true);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(true);
    expect(onCycle).toBeCalledTimes(1);
  });

  testCpuState("DEC (HL)", ({ ctx, onCycle }) => {
    ctx.writeRegisterPair(RegisterPair.HL, 0xff34);
    ctx.writeMemory(0xff34, 0x00);

    decrementIndirectHL(ctx);

    expect(ctx.readMemory(ctx.readRegisterPair(RegisterPair.HL))).toBe(0xff);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(true);
    expect(ctx.getFlag(Flag.N)).toBe(true);
    expect(onCycle).toBeCalledTimes(3);
  });

  testCpuState("AND A,r8", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x5a);
    ctx.writeRegister(Register.L, 0x3f);

    andAccumulatorWithRegister(ctx, Register.L);

    expect(ctx.readRegister(Register.A)).toBe(0x1a);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(true);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testCpuState("AND A,(HL)", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x5a);
    ctx.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    ctx.writeMemory(0x8ac5, 0x00);

    andAccumulatorWithIndirectHL(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0x00);
    expect(ctx.getFlag(Flag.Z)).toBe(true);
    expect(ctx.getFlag(Flag.H)).toBe(true);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("AND A,n8", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x5a);
    ctx.writeMemory(0, 0x38);

    andAccumulatorWithImmediate(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0x18);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(true);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("OR A,r8", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x5a);

    orAccumulatorWithRegister(ctx, Register.A);

    expect(ctx.readRegister(Register.A)).toBe(0x5a);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testCpuState("OR A,(HL)", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x5a);
    ctx.writeRegisterPair(RegisterPair.HL, 0x8ac2);
    ctx.writeMemory(0x8ac2, 0x0f);

    orAccumulatorWithIndirectHL(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0x5f);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("OR A,n8", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x5a);
    ctx.writeMemory(0, 0x3);

    orAccumulatorWithImmediate(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0x5b);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("XOR A,r8", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0xff);

    xorAccumulatorWithRegister(ctx, Register.A);

    expect(ctx.readRegister(Register.A)).toBe(0x00);
    expect(ctx.getFlag(Flag.Z)).toBe(true);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testCpuState("XOR A,(HL)", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0xff);
    ctx.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    ctx.writeMemory(0x8ac5, 0x8a);

    xorAccumulatorWithIndirectHL(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0x75);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("XOR A,n8", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0xff);
    ctx.writeMemory(0, 0xf);

    xorAccumulatorWithImmediate(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0xf0);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("CCF", ({ ctx, onCycle }) => {
    ctx.setFlag(Flag.CY, true);

    complementCarryFlag(ctx);

    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);

    complementCarryFlag(ctx);

    expect(ctx.getFlag(Flag.CY)).toBe(true);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("SCF", ({ ctx, onCycle }) => {
    ctx.setFlag(Flag.CY, false);

    setCarryFlag(ctx);

    expect(ctx.getFlag(Flag.CY)).toBe(true);
    expect(onCycle).toBeCalledTimes(1);

    setCarryFlag(ctx);

    expect(ctx.getFlag(Flag.CY)).toBe(true);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("DAA", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x45);
    ctx.writeRegister(Register.B, 0x38);

    addRegisterToAccumulator(ctx, Register.B);

    expect(ctx.readRegister(Register.A)).toBe(0x7d);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);

    decimalAdjustAccumulator(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0x83);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(2);

    subtractRegisterFromAccumualtor(ctx, Register.B);

    expect(ctx.readRegister(Register.A)).toBe(0x4b);
    expect(ctx.getFlag(Flag.N)).toBe(true);
    expect(onCycle).toBeCalledTimes(3);

    decimalAdjustAccumulator(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0x45);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(4);
  });

  testCpuState("CPL", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x35);

    complementAccumulator(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0xca);
    expect(ctx.getFlag(Flag.H)).toBe(true);
    expect(ctx.getFlag(Flag.N)).toBe(true);
    expect(onCycle).toBeCalledTimes(1);
  });
});
