import { describe, expect } from "vitest";

import { Flag, Register, RegisterPair } from "../register";
import { testInstructions } from "../test-lib";

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
  testInstructions("ADD A,r8", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x3a);
    ctx.registers.write(Register.B, 0xc6);

    addRegisterToAccumulator(ctx, Register.B);

    expect(ctx.registers.read(Register.A)).toBe(0);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(onCycle).toBeCalledTimes(1);
  });

  testInstructions("ADD A,(HL)", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x3c);
    ctx.registers.writePair(RegisterPair.HL, 0x3ab6);
    ctx.memory.write(0x3ab6, 0x12);

    addIndirectHLToAccumulator(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x4e);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("ADD A,n8", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x3c);
    ctx.memory.write(0, 0xff);

    addImmediateToAccumulator(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x3b);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("ADC A,r8", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0xe1);
    ctx.registers.write(Register.E, 0x0f);
    ctx.registers.setFlag(Flag.CY, true);

    addRegisterToAccumulatorWithCarry(ctx, Register.E);

    expect(ctx.registers.read(Register.A)).toBe(0xf1);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testInstructions("ADC A,(HL)", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0xe1);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.memory.write(0x8ac5, 0x1e);
    ctx.registers.setFlag(Flag.CY, true);

    addIndirectHLToAccumulatorWithCarry(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("ADC A,n8", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0xe1);
    ctx.memory.write(0, 0x3b);
    ctx.registers.setFlag(Flag.CY, true);

    addImmediateToAccumulatorWithCarry(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x1d);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("SUB A,r8", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x3e);
    ctx.registers.write(Register.E, 0x3e);

    subtractRegisterFromAccumualtor(ctx, Register.E);

    expect(ctx.registers.read(Register.A)).toBe(0);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(true);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testInstructions("SUB A,(HL)", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x3e);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.memory.write(0x8ac5, 0x40);

    subtractIndirectHLFromAccumualtor(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0xfe);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(true);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("SUB A,n8", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x3e);
    ctx.memory.write(0, 0x0f);

    subtractImmediateFromAccumualtor(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x2f);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(true);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("SBC A,r8", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x3b);
    ctx.registers.write(Register.H, 0x2a);
    ctx.registers.setFlag(Flag.CY, true);

    subtractRegisterFromAccumualtorWithCarry(ctx, Register.H);

    expect(ctx.registers.read(Register.A)).toBe(0x10);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(true);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testInstructions("SBC A,(HL)", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x3b);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.memory.write(0x8ac5, 0x4f);
    ctx.registers.setFlag(Flag.CY, true);

    subtractIndirectHLFromAccumualtorWithCarry(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0xeb);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(true);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("SBC A,n8", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x3b);
    ctx.memory.write(0, 0x3a);
    ctx.registers.setFlag(Flag.CY, true);

    subtractImmediateFromAccumualtorWithCarry(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(true);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("CP A,r8", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x3c);
    ctx.registers.write(Register.B, 0x2f);

    compareAccumulatorToRegister(ctx, Register.B);

    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(true);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testInstructions("CP A,(HL)", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x3c);
    ctx.registers.writePair(RegisterPair.HL, 0x3ab6);
    ctx.memory.write(0x3ab6, 0x40);

    compareAccumulatorToIndirectHL(ctx);

    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(true);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("CP A,n8", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x3c);
    ctx.memory.write(0, 0x3c);

    compareAccumulatorToImmediate(ctx);

    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(true);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("INC r", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0xff);

    incrementRegister(ctx, Register.A);

    expect(ctx.registers.read(Register.A)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testInstructions("INC (HL)", ({ ctx, onCycle }) => {
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.memory.write(0x8ac5, 0x50);

    incrementIndirectHL(ctx);

    expect(ctx.memory.read(ctx.registers.readPair(RegisterPair.HL))).toBe(0x51);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(3);
  });

  testInstructions("DEC r", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.L, 0x01);

    decrementRegister(ctx, Register.L);

    expect(ctx.registers.read(Register.L)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(true);
    expect(onCycle).toBeCalledTimes(1);
  });

  testInstructions("DEC (HL)", ({ ctx, onCycle }) => {
    ctx.registers.writePair(RegisterPair.HL, 0xff34);
    ctx.memory.write(0xff34, 0x00);

    decrementIndirectHL(ctx);

    expect(ctx.memory.read(ctx.registers.readPair(RegisterPair.HL))).toBe(0xff);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(true);
    expect(onCycle).toBeCalledTimes(3);
  });

  testInstructions("AND A,r8", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x5a);
    ctx.registers.write(Register.L, 0x3f);

    andAccumulatorWithRegister(ctx, Register.L);

    expect(ctx.registers.read(Register.A)).toBe(0x1a);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testInstructions("AND A,(HL)", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x5a);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.memory.write(0x8ac5, 0x00);

    andAccumulatorWithIndirectHL(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("AND A,n8", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x5a);
    ctx.memory.write(0, 0x38);

    andAccumulatorWithImmediate(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x18);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("OR A,r8", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x5a);

    orAccumulatorWithRegister(ctx, Register.A);

    expect(ctx.registers.read(Register.A)).toBe(0x5a);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testInstructions("OR A,(HL)", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x5a);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac2);
    ctx.memory.write(0x8ac2, 0x0f);

    orAccumulatorWithIndirectHL(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x5f);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("OR A,n8", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x5a);
    ctx.memory.write(0, 0x3);

    orAccumulatorWithImmediate(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x5b);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("XOR A,r8", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0xff);

    xorAccumulatorWithRegister(ctx, Register.A);

    expect(ctx.registers.read(Register.A)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testInstructions("XOR A,(HL)", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0xff);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.memory.write(0x8ac5, 0x8a);

    xorAccumulatorWithIndirectHL(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x75);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("XOR A,n8", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0xff);
    ctx.memory.write(0, 0xf);

    xorAccumulatorWithImmediate(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0xf0);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("CCF", ({ ctx, onCycle }) => {
    ctx.registers.setFlag(Flag.CY, true);

    complementCarryFlag(ctx);

    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);

    complementCarryFlag(ctx);

    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("SCF", ({ ctx, onCycle }) => {
    ctx.registers.setFlag(Flag.CY, false);

    setCarryFlag(ctx);

    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(onCycle).toBeCalledTimes(1);

    setCarryFlag(ctx);

    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("DAA", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x45);
    ctx.registers.write(Register.B, 0x38);

    addRegisterToAccumulator(ctx, Register.B);

    expect(ctx.registers.read(Register.A)).toBe(0x7d);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);

    decimalAdjustAccumulator(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x83);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(2);

    subtractRegisterFromAccumualtor(ctx, Register.B);

    expect(ctx.registers.read(Register.A)).toBe(0x4b);
    expect(ctx.registers.getFlag(Flag.N)).toBe(true);
    expect(onCycle).toBeCalledTimes(3);

    decimalAdjustAccumulator(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x45);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(4);
  });

  testInstructions("CPL", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x35);

    complementAccumulator(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0xca);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(true);
    expect(onCycle).toBeCalledTimes(1);
  });
});
