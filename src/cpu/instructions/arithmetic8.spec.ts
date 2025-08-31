import { describe, expect } from "vitest";

import { Flag, Register, RegisterPair } from "../register";
import { testInstruction } from "./test-lib";

import {
  addImmediateToAccumulator,
  addImmediateToAccumulatorWithCarry,
  addPointerInHLToAccumulator,
  addPointerInHLToAccumulatorWithCarry,
  addRegisterToAccumulator,
  addRegisterToAccumulatorWithCarry,
  andAccumulatorWithImmediate,
  andAccumulatorWithPointerInHL,
  andAccumulatorWithRegister,
  compareAccumulatorToImmediate,
  compareAccumulatorToPointerInHL,
  compareAccumulatorToRegister,
  complementAccumulator,
  complementCarryFlag,
  decimalAdjustAccumulator,
  decrementPointerInHL,
  decrementRegister,
  incrementPointerInHL,
  incrementRegister,
  orAccumulatorWithImmediate,
  orAccumulatorWithPointerInHL,
  orAccumulatorWithRegister,
  setCarryFlag,
  subtractImmediateFromAccumualtor,
  subtractImmediateFromAccumualtorWithCarry,
  subtractPointerInHLFromAccumualtor,
  subtractPointerInHLFromAccumualtorWithCarry,
  subtractRegisterFromAccumualtor,
  subtractRegisterFromAccumualtorWithCarry,
  xorAccumulatorWithImmediate,
  xorAccumulatorWithPointerInHL,
  xorAccumulatorWithRegister,
} from "./arithmetic8";

describe("8-bit arithmetic and logical instructions", () => {
  testInstruction("ADD A,r8", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x3a);
    ctx.registers.write(Register.B, 0xc6);

    addRegisterToAccumulator(ctx, Register.B);

    expect(ctx.registers.read(Register.A)).toBe(0);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.state.getElapsedCycles()).toBe(1);
  });

  testInstruction("ADD A,(HL)", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x3c);
    ctx.registers.writePair(RegisterPair.HL, 0x3ab6);
    ctx.memory.write(0x3ab6, 0x12);

    addPointerInHLToAccumulator(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x4e);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("ADD A,n8", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x3c);
    ctx.memory.write(0, 0xff);

    addImmediateToAccumulator(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x3b);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("ADC A,r8", ({ ctx }) => {
    ctx.registers.write(Register.A, 0xe1);
    ctx.registers.write(Register.E, 0x0f);
    ctx.registers.setFlag(Flag.CY, true);

    addRegisterToAccumulatorWithCarry(ctx, Register.E);

    expect(ctx.registers.read(Register.A)).toBe(0xf1);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(1);
  });

  testInstruction("ADC A,(HL)", ({ ctx }) => {
    ctx.registers.write(Register.A, 0xe1);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.memory.write(0x8ac5, 0x1e);
    ctx.registers.setFlag(Flag.CY, true);

    addPointerInHLToAccumulatorWithCarry(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("ADC A,n8", ({ ctx }) => {
    ctx.registers.write(Register.A, 0xe1);
    ctx.memory.write(0, 0x3b);
    ctx.registers.setFlag(Flag.CY, true);

    addImmediateToAccumulatorWithCarry(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x1d);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("SUB A,r8", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x3e);
    ctx.registers.write(Register.E, 0x3e);

    subtractRegisterFromAccumualtor(ctx, Register.E);

    expect(ctx.registers.read(Register.A)).toBe(0);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(true);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(1);
  });

  testInstruction("SUB A,(HL)", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x3e);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.memory.write(0x8ac5, 0x40);

    subtractPointerInHLFromAccumualtor(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0xfe);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(true);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("SUB A,n8", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x3e);
    ctx.memory.write(0, 0x0f);

    subtractImmediateFromAccumualtor(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x2f);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(true);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("SBC A,r8", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x3b);
    ctx.registers.write(Register.H, 0x2a);
    ctx.registers.setFlag(Flag.CY, true);

    subtractRegisterFromAccumualtorWithCarry(ctx, Register.H);

    expect(ctx.registers.read(Register.A)).toBe(0x10);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(true);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(1);
  });

  testInstruction("SBC A,(HL)", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x3b);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.memory.write(0x8ac5, 0x4f);
    ctx.registers.setFlag(Flag.CY, true);

    subtractPointerInHLFromAccumualtorWithCarry(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0xeb);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(true);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("SBC A,n8", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x3b);
    ctx.memory.write(0, 0x3a);
    ctx.registers.setFlag(Flag.CY, true);

    subtractImmediateFromAccumualtorWithCarry(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(true);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("CP A,r8", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x3c);
    ctx.registers.write(Register.B, 0x2f);

    compareAccumulatorToRegister(ctx, Register.B);

    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(true);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(1);
  });

  testInstruction("CP A,(HL)", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x3c);
    ctx.registers.writePair(RegisterPair.HL, 0x3ab6);
    ctx.memory.write(0x3ab6, 0x40);

    compareAccumulatorToPointerInHL(ctx);

    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(true);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("CP A,n8", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x3c);
    ctx.memory.write(0, 0x3c);

    compareAccumulatorToImmediate(ctx);

    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(true);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("INC r", ({ ctx }) => {
    ctx.registers.write(Register.A, 0xff);

    incrementRegister(ctx, Register.A);

    expect(ctx.registers.read(Register.A)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(1);
  });

  testInstruction("INC (HL)", ({ ctx }) => {
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.memory.write(0x8ac5, 0x50);

    incrementPointerInHL(ctx);

    expect(ctx.memory.read(ctx.registers.readPair(RegisterPair.HL))).toBe(0x51);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(3);
  });

  testInstruction("DEC r", ({ ctx }) => {
    ctx.registers.write(Register.L, 0x01);

    decrementRegister(ctx, Register.L);

    expect(ctx.registers.read(Register.L)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(true);
    expect(ctx.state.getElapsedCycles()).toBe(1);
  });

  testInstruction("DEC (HL)", ({ ctx }) => {
    ctx.registers.writePair(RegisterPair.HL, 0xff34);
    ctx.memory.write(0xff34, 0x00);

    decrementPointerInHL(ctx);

    expect(ctx.memory.read(ctx.registers.readPair(RegisterPair.HL))).toBe(0xff);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(true);
    expect(ctx.state.getElapsedCycles()).toBe(3);
  });

  testInstruction("AND A,r8", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x5a);
    ctx.registers.write(Register.L, 0x3f);

    andAccumulatorWithRegister(ctx, Register.L);

    expect(ctx.registers.read(Register.A)).toBe(0x1a);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(1);
  });

  testInstruction("AND A,(HL)", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x5a);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.memory.write(0x8ac5, 0x00);

    andAccumulatorWithPointerInHL(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("AND A,n8", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x5a);
    ctx.memory.write(0, 0x38);

    andAccumulatorWithImmediate(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x18);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("OR A,r8", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x5a);

    orAccumulatorWithRegister(ctx, Register.A);

    expect(ctx.registers.read(Register.A)).toBe(0x5a);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(1);
  });

  testInstruction("OR A,(HL)", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x5a);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac2);
    ctx.memory.write(0x8ac2, 0x0f);

    orAccumulatorWithPointerInHL(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x5f);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("OR A,n8", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x5a);
    ctx.memory.write(0, 0x3);

    orAccumulatorWithImmediate(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x5b);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("XOR A,r8", ({ ctx }) => {
    ctx.registers.write(Register.A, 0xff);

    xorAccumulatorWithRegister(ctx, Register.A);

    expect(ctx.registers.read(Register.A)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(1);
  });

  testInstruction("XOR A,(HL)", ({ ctx }) => {
    ctx.registers.write(Register.A, 0xff);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.memory.write(0x8ac5, 0x8a);

    xorAccumulatorWithPointerInHL(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x75);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("XOR A,n8", ({ ctx }) => {
    ctx.registers.write(Register.A, 0xff);
    ctx.memory.write(0, 0xf);

    xorAccumulatorWithImmediate(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0xf0);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("CCF", ({ ctx }) => {
    ctx.registers.setFlag(Flag.CY, true);

    complementCarryFlag(ctx);

    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(1);

    complementCarryFlag(ctx);

    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("SCF", ({ ctx }) => {
    ctx.registers.setFlag(Flag.CY, false);

    setCarryFlag(ctx);

    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.state.getElapsedCycles()).toBe(1);

    setCarryFlag(ctx);

    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("DAA", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x45);
    ctx.registers.write(Register.B, 0x38);

    addRegisterToAccumulator(ctx, Register.B);

    expect(ctx.registers.read(Register.A)).toBe(0x7d);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(1);

    decimalAdjustAccumulator(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x83);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(2);

    subtractRegisterFromAccumualtor(ctx, Register.B);

    expect(ctx.registers.read(Register.A)).toBe(0x4b);
    expect(ctx.registers.getFlag(Flag.N)).toBe(true);
    expect(ctx.state.getElapsedCycles()).toBe(3);

    decimalAdjustAccumulator(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x45);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(4);
  });

  testInstruction("CPL", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x35);

    complementAccumulator(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0xca);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(true);
    expect(ctx.state.getElapsedCycles()).toBe(1);
  });
});
