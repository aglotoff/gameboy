import { describe, expect } from "vitest";

import { Flag, Register, RegisterPair } from "../register";
import { testInstruction } from "./test-lib";

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
  testInstruction("RLCA", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x85);

    rotateAccumulatorLeft(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x0b);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(1);
  });

  testInstruction("RRCA", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x3b);

    rotateAccumulatorRight(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x9d);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(1);
  });

  testInstruction("RLA", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x95);
    ctx.registers.setFlag(Flag.CY, true);

    rotateAccumulatorLeftThroughCarry(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x2b);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(1);
  });

  testInstruction("RRA", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x81);
    ctx.registers.setFlag(Flag.CY, false);

    rotateAccumulatorRightThroughCarry(ctx);

    expect(ctx.registers.read(Register.A)).toBe(0x40);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(1);
  });

  testInstruction("RLC r8", ({ ctx }) => {
    ctx.registers.write(Register.B, 0x85);
    ctx.registers.setFlag(Flag.CY, false);

    rotateRegisterLeft(ctx, Register.B);

    expect(ctx.registers.read(Register.B)).toBe(0x0b);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(1);
  });

  testInstruction("RLC (HL)", ({ ctx }) => {
    ctx.memory.write(0x8ac5, 0x00);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.registers.setFlag(Flag.CY, false);

    rotateIndirectHLLeft(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(3);
  });

  testInstruction("RRC r8", ({ ctx }) => {
    ctx.registers.write(Register.C, 0x01);
    ctx.registers.setFlag(Flag.CY, false);

    rotateRegisterRight(ctx, Register.C);

    expect(ctx.registers.read(Register.C)).toBe(0x80);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(1);
  });

  testInstruction("RRC (HL)", ({ ctx }) => {
    ctx.memory.write(0x8ac5, 0x00);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.registers.setFlag(Flag.CY, false);

    rotateIndirectHLRight(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(3);
  });

  testInstruction("RL r8", ({ ctx }) => {
    ctx.registers.write(Register.L, 0x80);
    ctx.registers.setFlag(Flag.CY, false);

    rotateRegisterLeftThroughCarry(ctx, Register.L);

    expect(ctx.registers.read(Register.L)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(1);
  });

  testInstruction("RL (HL)", ({ ctx }) => {
    ctx.memory.write(0x8ac5, 0x11);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.registers.setFlag(Flag.CY, false);

    rotateIndirectHLLeftThroughCarry(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0x22);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(3);
  });

  testInstruction("RR r8", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x01);
    ctx.registers.setFlag(Flag.CY, false);

    rotateRegisterRightThroughCarry(ctx, Register.A);

    expect(ctx.registers.read(Register.A)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(1);
  });

  testInstruction("RR (HL)", ({ ctx }) => {
    ctx.memory.write(0x8ac5, 0x8a);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.registers.setFlag(Flag.CY, false);

    rotateIndirectHLRightThroughCarry(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0x45);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(3);
  });

  testInstruction("SLA r8", ({ ctx }) => {
    ctx.registers.write(Register.D, 0x80);
    ctx.registers.setFlag(Flag.CY, false);

    shiftLeftArithmeticallyRegister(ctx, Register.D);

    expect(ctx.registers.read(Register.D)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(1);
  });

  testInstruction("SLA (HL)", ({ ctx }) => {
    ctx.memory.write(0x8ac5, 0xff);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.registers.setFlag(Flag.CY, false);

    shiftLeftArithmeticallyIndirectHL(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0xfe);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(3);
  });

  testInstruction("SRA r8", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x8a);
    ctx.registers.setFlag(Flag.CY, false);

    shiftRightArithmeticallyRegister(ctx, Register.A);

    expect(ctx.registers.read(Register.A)).toBe(0xc5);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(1);
  });

  testInstruction("SRA (HL)", ({ ctx }) => {
    ctx.memory.write(0x8ac5, 0x01);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.registers.setFlag(Flag.CY, false);

    shiftRightArithmeticallyIndirectHL(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(3);
  });

  testInstruction("SRL r8", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x01);
    ctx.registers.setFlag(Flag.CY, false);

    shiftRightLogicallyRegister(ctx, Register.A);

    expect(ctx.registers.read(Register.A)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(1);
  });

  testInstruction("SRL (HL)", ({ ctx }) => {
    ctx.memory.write(0x8ac5, 0xff);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.registers.setFlag(Flag.CY, false);

    shiftRightLogicallyIndirectHL(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0x7f);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(3);
  });

  testInstruction("SWAP r8", ({ ctx }) => {
    ctx.registers.write(Register.A, 0x00);
    ctx.registers.setFlag(Flag.CY, false);

    swapNibblesInRegister(ctx, Register.A);

    expect(ctx.registers.read(Register.A)).toBe(0x00);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(1);
  });

  testInstruction("SWAP (HL)", ({ ctx }) => {
    ctx.memory.write(0x8ac5, 0xf0);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);
    ctx.registers.setFlag(Flag.CY, false);

    swapNibblesInIndirectHL(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0x0f);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(3);
  });

  describe("BIT u3,r8", () => {
    testInstruction("BIT 7,A", ({ ctx }) => {
      ctx.registers.write(Register.A, 0x80);

      testBitInRegister(ctx, 7, Register.A);

      expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
      expect(ctx.registers.getFlag(Flag.H)).toBe(true);
      expect(ctx.registers.getFlag(Flag.N)).toBe(false);
      expect(ctx.state.getElapsedCycles()).toBe(1);
    });

    testInstruction("BIT 4,L", ({ ctx }) => {
      ctx.registers.write(Register.L, 0xef);

      testBitInRegister(ctx, 4, Register.L);

      expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
      expect(ctx.registers.getFlag(Flag.H)).toBe(true);
      expect(ctx.registers.getFlag(Flag.N)).toBe(false);
      expect(ctx.state.getElapsedCycles()).toBe(1);
    });
  });

  describe("BIT u3,(HL)", () => {
    testInstruction("BIT 0,(HL)", ({ ctx }) => {
      ctx.memory.write(0x8ac5, 0xfe);
      ctx.registers.writePair(RegisterPair.HL, 0x8ac5);

      testBitInIndirectHL(ctx, 0);

      expect(ctx.registers.getFlag(Flag.Z)).toBe(true);
      expect(ctx.registers.getFlag(Flag.H)).toBe(true);
      expect(ctx.registers.getFlag(Flag.N)).toBe(false);
      expect(ctx.state.getElapsedCycles()).toBe(2);
    });

    testInstruction("BIT 1,(HL)", ({ ctx }) => {
      ctx.memory.write(0x8ac5, 0xfe);
      ctx.registers.writePair(RegisterPair.HL, 0x8ac5);

      testBitInIndirectHL(ctx, 1);

      expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
      expect(ctx.registers.getFlag(Flag.H)).toBe(true);
      expect(ctx.registers.getFlag(Flag.N)).toBe(false);
      expect(ctx.state.getElapsedCycles()).toBe(2);
    });
  });

  describe("RES u3,r8", () => {
    testInstruction("RES 7,A", ({ ctx }) => {
      ctx.registers.write(Register.A, 0x80);

      resetBitInRegister(ctx, 7, Register.A);

      expect(ctx.registers.read(Register.A)).toBe(0x00);
      expect(ctx.state.getElapsedCycles()).toBe(1);
    });

    testInstruction("RES 1,L", ({ ctx }) => {
      ctx.registers.write(Register.L, 0x3b);

      resetBitInRegister(ctx, 1, Register.L);

      expect(ctx.registers.read(Register.L)).toBe(0x39);
      expect(ctx.state.getElapsedCycles()).toBe(1);
    });
  });

  testInstruction("RES u3,(HL)", ({ ctx }) => {
    ctx.memory.write(0x8ac5, 0xff);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);

    resetBitInIndirectHL(ctx, 3);

    expect(ctx.memory.read(0x8ac5)).toBe(0xf7);
    expect(ctx.state.getElapsedCycles()).toBe(3);
  });

  describe("SET u3,r8", () => {
    testInstruction("SET 2,A", ({ ctx }) => {
      ctx.registers.write(Register.A, 0x80);

      setBitInRegister(ctx, 2, Register.A);

      expect(ctx.registers.read(Register.A)).toBe(0x84);
      expect(ctx.state.getElapsedCycles()).toBe(1);
    });

    testInstruction("SET 7,L", ({ ctx }) => {
      ctx.registers.write(Register.L, 0x3b);

      setBitInRegister(ctx, 7, Register.L);

      expect(ctx.registers.read(Register.L)).toBe(0xbb);
      expect(ctx.state.getElapsedCycles()).toBe(1);
    });
  });

  testInstruction("SET u3,(HL)", ({ ctx }) => {
    ctx.memory.write(0x8ac5, 0x00);
    ctx.registers.writePair(RegisterPair.HL, 0x8ac5);

    setBitInIndirectHL(ctx, 3);

    expect(ctx.memory.read(0x8ac5)).toBe(0x08);
    expect(ctx.state.getElapsedCycles()).toBe(3);
  });
});
