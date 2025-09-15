import { describe, expect } from "vitest";

import { Flag, Register, RegisterPair } from "../register";
import { testInstructions } from "../test-lib";

import {
  rotateAccumulatorLeft,
  rotateAccumulatorRight,
  rotateAccumulatorLeftThroughCarry,
  rotateAccumulatorRightThroughCarry,
  rotateRegisterLeft,
  rotateIndirectHLLeft,
  rotateRegisterRight,
  rotateIndirectHLRight,
  rotateRegisterLeftThroughCarry,
  rotateIndirectHLLeftThroughCarry,
  rotateRegisterRightThroughCarry,
  rotateIndirectHLRightThroughCarry,
  shiftLeftArithmeticallyRegister,
  shiftLeftArithmeticallyIndirectHL,
  shiftRightArithmeticallyRegister,
  shiftRightArithmeticallyIndirectHL,
  shiftRightLogicallyRegister,
  shiftRightLogicallyIndirectHL,
  swapNibblesInRegister,
  swapNibblesInIndirectHL,
  testBitInRegister,
  testBitInIndirectHL,
  resetBitInRegister,
  resetBitInIndirectHL,
  setBitInRegister,
  setBitInIndirectHL,
} from "./bitwise";

describe("Rotate, shift, and bit operation instructions", () => {
  testInstructions("RLCA", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x85);

    rotateAccumulatorLeft(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x0b);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testInstructions("RRCA", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x3b);

    rotateAccumulatorRight(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x9d);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testInstructions("RLA", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x95);
    ctx.registers.setFlag(Flag.CY, true);

    rotateAccumulatorLeftThroughCarry(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x2b);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testInstructions("RRA", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x81);
    ctx.registers.setFlag(Flag.CY, false);

    rotateAccumulatorRightThroughCarry(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x40);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testInstructions("RLC r8", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.B, 0x85);
    ctx.registers.setFlag(Flag.CY, false);

    rotateRegisterLeft(ctx, Register.B);

    expect(ctx.registers.read(Register.B)).toBe(0x0b);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testInstructions("RLC (HL)", ({ ctx, onCycle }) => {
    ctx.memory.write(0x8ac5, 0x00);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.registers.setFlag(Flag.CY, false);

    rotateIndirectHLLeft(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(3);
  });

  testInstructions("RRC r8", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.C, 0x01);
    ctx.registers.setFlag(Flag.CY, false);

    rotateRegisterRight(ctx, Register.C);

    expect(ctx.registers.read(Register.C)).toBe(0x80);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testInstructions("RRC (HL)", ({ ctx, onCycle }) => {
    ctx.memory.write(0x8ac5, 0x00);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.registers.setFlag(Flag.CY, false);

    rotateIndirectHLRight(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(3);
  });

  testInstructions("RL r8", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.L, 0x80);
    ctx.registers.setFlag(Flag.CY, false);

    rotateRegisterLeftThroughCarry(ctx, Register.L);

    expect(ctx.registers.read(Register.L)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testInstructions("RL (HL)", ({ ctx, onCycle }) => {
    ctx.memory.write(0x8ac5, 0x11);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.registers.setFlag(Flag.CY, false);

    rotateIndirectHLLeftThroughCarry(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0x22);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(3);
  });

  testInstructions("RR r8", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x01);
    ctx.registers.setFlag(Flag.CY, false);

    rotateRegisterRightThroughCarry(ctx, Register.A);

    expect(ctx.registers.read(Register.A)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testInstructions("RR (HL)", ({ ctx, onCycle }) => {
    ctx.memory.write(0x8ac5, 0x8a);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.registers.setFlag(Flag.CY, false);

    rotateIndirectHLRightThroughCarry(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0x45);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(3);
  });

  testInstructions("SLA r8", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.D, 0x80);
    ctx.registers.setFlag(Flag.CY, false);

    shiftLeftArithmeticallyRegister(ctx, Register.D);

    expect(ctx.registers.read(Register.D)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testInstructions("SLA (HL)", ({ ctx, onCycle }) => {
    ctx.memory.write(0x8ac5, 0xff);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.registers.setFlag(Flag.CY, false);

    shiftLeftArithmeticallyIndirectHL(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0xfe);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(3);
  });

  testInstructions("SRA r8", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x8a);
    ctx.registers.setFlag(Flag.CY, false);

    shiftRightArithmeticallyRegister(ctx, Register.A);

    expect(ctx.registers.read(Register.A)).toBe(0xc5);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testInstructions("SRA (HL)", ({ ctx, onCycle }) => {
    ctx.memory.write(0x8ac5, 0x01);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.registers.setFlag(Flag.CY, false);

    shiftRightArithmeticallyIndirectHL(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(3);
  });

  testInstructions("SRL r8", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x01);
    ctx.registers.setFlag(Flag.CY, false);

    shiftRightLogicallyRegister(ctx, Register.A);

    expect(ctx.registers.read(Register.A)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testInstructions("SRL (HL)", ({ ctx, onCycle }) => {
    ctx.memory.write(0x8ac5, 0xff);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.registers.setFlag(Flag.CY, false);

    shiftRightLogicallyIndirectHL(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0x7f);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(3);
  });

  testInstructions("SWAP r8", ({ ctx, onCycle }) => {
    ctx.registers.write(Register.A, 0x00);
    ctx.registers.setFlag(Flag.CY, false);

    swapNibblesInRegister(ctx, Register.A);

    expect(ctx.registers.read(Register.A)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testInstructions("SWAP (HL)", ({ ctx, onCycle }) => {
    ctx.memory.write(0x8ac5, 0xf0);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.registers.setFlag(Flag.CY, false);

    swapNibblesInIndirectHL(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0x0f);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(3);
  });

  describe("BIT u3,r8", () => {
    testInstructions("BIT 7,A", ({ ctx, onCycle }) => {
      ctx.registers.write(Register.A, 0x80);

      testBitInRegister(ctx, 7, Register.A);

      expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
      expect(ctx.registers.getFlag(Flag.H)).toBe(true);
      expect(ctx.registers.getFlag(Flag.N)).toBe(false);
      expect(onCycle).toBeCalledTimes(1);
    });

    testInstructions("BIT 4,L", ({ ctx, onCycle }) => {
      ctx.registers.write(Register.L, 0xef);

      testBitInRegister(ctx, 4, Register.L);

      expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
      expect(ctx.registers.getFlag(Flag.H)).toBe(true);
      expect(ctx.registers.getFlag(Flag.N)).toBe(false);
      expect(onCycle).toBeCalledTimes(1);
    });
  });

  describe("BIT u3,(HL)", () => {
    testInstructions("BIT 0,(HL)", ({ ctx, onCycle }) => {
      ctx.memory.write(0x8ac5, 0xfe);
      ctx.registers.writePair(RegisterPair.HL, 0x8ac5);

      testBitInIndirectHL(ctx, 0);

      expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
      expect(ctx.registers.getFlag(Flag.H)).toBe(true);
      expect(ctx.registers.getFlag(Flag.N)).toBe(false);
      expect(onCycle).toBeCalledTimes(2);
    });

    testInstructions("BIT 1,(HL)", ({ ctx, onCycle }) => {
      ctx.memory.write(0x8ac5, 0xfe);
      ctx.registers.writePair(RegisterPair.HL, 0x8ac5);

      testBitInIndirectHL(ctx, 1);

      expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
      expect(ctx.registers.getFlag(Flag.H)).toBe(true);
      expect(ctx.registers.getFlag(Flag.N)).toBe(false);
      expect(onCycle).toBeCalledTimes(2);
    });
  });

  describe("RES u3,r8", () => {
    testInstructions("RES 7,A", ({ ctx, onCycle }) => {
      ctx.registers.write(Register.A, 0x80);

      resetBitInRegister(ctx, 7, Register.A);

      expect(ctx.registers.read(Register.A)).toBe(0x00);
      expect(onCycle).toBeCalledTimes(1);
    });

    testInstructions("RES 1,L", ({ ctx, onCycle }) => {
      ctx.registers.write(Register.L, 0x3b);

      resetBitInRegister(ctx, 1, Register.L);

      expect(ctx.registers.read(Register.L)).toBe(0x39);
      expect(onCycle).toBeCalledTimes(1);
    });
  });

  testInstructions("RES u3,(HL)", ({ ctx, onCycle }) => {
    ctx.memory.write(0x8ac5, 0xff);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);

    resetBitInIndirectHL(ctx, 3);

    expect(ctx.memory.read(0x8ac5)).toBe(0xf7);
    expect(onCycle).toBeCalledTimes(3);
  });

  describe("SET u3,r8", () => {
    testInstructions("SET 2,A", ({ ctx, onCycle }) => {
      ctx.registers.write(Register.A, 0x80);

      setBitInRegister(ctx, 2, Register.A);

      expect(ctx.registers.read(Register.A)).toBe(0x84);
      expect(onCycle).toBeCalledTimes(1);
    });

    testInstructions("SET 7,L", ({ ctx, onCycle }) => {
      ctx.registers.write(Register.L, 0x3b);

      setBitInRegister(ctx, 7, Register.L);

      expect(ctx.registers.read(Register.L)).toBe(0xbb);
      expect(onCycle).toBeCalledTimes(1);
    });
  });

  testInstructions("SET u3,(HL)", ({ ctx, onCycle }) => {
    ctx.memory.write(0x8ac5, 0x00);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);

    setBitInIndirectHL(ctx, 3);

    expect(ctx.memory.read(0x8ac5)).toBe(0x08);
    expect(onCycle).toBeCalledTimes(3);
  });
});
