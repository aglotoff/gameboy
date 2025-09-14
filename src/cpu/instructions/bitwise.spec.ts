import { describe, expect } from "vitest";

import { Flag, Register, RegisterPair } from "../register";
import { testCpuState } from "../test-lib";

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
  testCpuState("RLCA", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x85);

    rotateAccumulatorLeft(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0x0b);
    expect(ctx.getFlag(Flag.CY)).toBe(true);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testCpuState("RRCA", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x3b);

    rotateAccumulatorRight(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0x9d);
    expect(ctx.getFlag(Flag.CY)).toBe(true);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testCpuState("RLA", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x95);
    ctx.setFlag(Flag.CY, true);

    rotateAccumulatorLeftThroughCarry(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0x2b);
    expect(ctx.getFlag(Flag.CY)).toBe(true);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testCpuState("RRA", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x81);
    ctx.setFlag(Flag.CY, false);

    rotateAccumulatorRightThroughCarry(ctx);

    expect(ctx.readRegister(Register.A)).toBe(0x40);
    expect(ctx.getFlag(Flag.CY)).toBe(true);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testCpuState("RLC r8", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.B, 0x85);
    ctx.setFlag(Flag.CY, false);

    rotateRegisterLeft(ctx, Register.B);

    expect(ctx.readRegister(Register.B)).toBe(0x0b);
    expect(ctx.getFlag(Flag.CY)).toBe(true);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testCpuState("RLC (HL)", ({ ctx, onCycle }) => {
    ctx.writeMemory(0x8ac5, 0x00);
    ctx.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    ctx.setFlag(Flag.CY, false);

    rotateIndirectHLLeft(ctx);

    expect(ctx.readMemory(0x8ac5)).toBe(0x00);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(ctx.getFlag(Flag.Z)).toBe(true);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(3);
  });

  testCpuState("RRC r8", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.C, 0x01);
    ctx.setFlag(Flag.CY, false);

    rotateRegisterRight(ctx, Register.C);

    expect(ctx.readRegister(Register.C)).toBe(0x80);
    expect(ctx.getFlag(Flag.CY)).toBe(true);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testCpuState("RRC (HL)", ({ ctx, onCycle }) => {
    ctx.writeMemory(0x8ac5, 0x00);
    ctx.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    ctx.setFlag(Flag.CY, false);

    rotateIndirectHLRight(ctx);

    expect(ctx.readMemory(0x8ac5)).toBe(0x00);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(ctx.getFlag(Flag.Z)).toBe(true);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(3);
  });

  testCpuState("RL r8", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.L, 0x80);
    ctx.setFlag(Flag.CY, false);

    rotateRegisterLeftThroughCarry(ctx, Register.L);

    expect(ctx.readRegister(Register.L)).toBe(0x00);
    expect(ctx.getFlag(Flag.CY)).toBe(true);
    expect(ctx.getFlag(Flag.Z)).toBe(true);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testCpuState("RL (HL)", ({ ctx, onCycle }) => {
    ctx.writeMemory(0x8ac5, 0x11);
    ctx.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    ctx.setFlag(Flag.CY, false);

    rotateIndirectHLLeftThroughCarry(ctx);

    expect(ctx.readMemory(0x8ac5)).toBe(0x22);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(3);
  });

  testCpuState("RR r8", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x01);
    ctx.setFlag(Flag.CY, false);

    rotateRegisterRightThroughCarry(ctx, Register.A);

    expect(ctx.readRegister(Register.A)).toBe(0x00);
    expect(ctx.getFlag(Flag.CY)).toBe(true);
    expect(ctx.getFlag(Flag.Z)).toBe(true);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testCpuState("RR (HL)", ({ ctx, onCycle }) => {
    ctx.writeMemory(0x8ac5, 0x8a);
    ctx.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    ctx.setFlag(Flag.CY, false);

    rotateIndirectHLRightThroughCarry(ctx);

    expect(ctx.readMemory(0x8ac5)).toBe(0x45);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(3);
  });

  testCpuState("SLA r8", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.D, 0x80);
    ctx.setFlag(Flag.CY, false);

    shiftLeftArithmeticallyRegister(ctx, Register.D);

    expect(ctx.readRegister(Register.D)).toBe(0x00);
    expect(ctx.getFlag(Flag.CY)).toBe(true);
    expect(ctx.getFlag(Flag.Z)).toBe(true);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testCpuState("SLA (HL)", ({ ctx, onCycle }) => {
    ctx.writeMemory(0x8ac5, 0xff);
    ctx.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    ctx.setFlag(Flag.CY, false);

    shiftLeftArithmeticallyIndirectHL(ctx);

    expect(ctx.readMemory(0x8ac5)).toBe(0xfe);
    expect(ctx.getFlag(Flag.CY)).toBe(true);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(3);
  });

  testCpuState("SRA r8", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x8a);
    ctx.setFlag(Flag.CY, false);

    shiftRightArithmeticallyRegister(ctx, Register.A);

    expect(ctx.readRegister(Register.A)).toBe(0xc5);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testCpuState("SRA (HL)", ({ ctx, onCycle }) => {
    ctx.writeMemory(0x8ac5, 0x01);
    ctx.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    ctx.setFlag(Flag.CY, false);

    shiftRightArithmeticallyIndirectHL(ctx);

    expect(ctx.readMemory(0x8ac5)).toBe(0x00);
    expect(ctx.getFlag(Flag.CY)).toBe(true);
    expect(ctx.getFlag(Flag.Z)).toBe(true);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(3);
  });

  testCpuState("SRL r8", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x01);
    ctx.setFlag(Flag.CY, false);

    shiftRightLogicallyRegister(ctx, Register.A);

    expect(ctx.readRegister(Register.A)).toBe(0x00);
    expect(ctx.getFlag(Flag.CY)).toBe(true);
    expect(ctx.getFlag(Flag.Z)).toBe(true);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testCpuState("SRL (HL)", ({ ctx, onCycle }) => {
    ctx.writeMemory(0x8ac5, 0xff);
    ctx.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    ctx.setFlag(Flag.CY, false);

    shiftRightLogicallyIndirectHL(ctx);

    expect(ctx.readMemory(0x8ac5)).toBe(0x7f);
    expect(ctx.getFlag(Flag.CY)).toBe(true);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(3);
  });

  testCpuState("SWAP r8", ({ ctx, onCycle }) => {
    ctx.writeRegister(Register.A, 0x00);
    ctx.setFlag(Flag.CY, false);

    swapNibblesInRegister(ctx, Register.A);

    expect(ctx.readRegister(Register.A)).toBe(0x00);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(ctx.getFlag(Flag.Z)).toBe(true);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testCpuState("SWAP (HL)", ({ ctx, onCycle }) => {
    ctx.writeMemory(0x8ac5, 0xf0);
    ctx.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    ctx.setFlag(Flag.CY, false);

    swapNibblesInIndirectHL(ctx);

    expect(ctx.readMemory(0x8ac5)).toBe(0x0f);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(onCycle).toBeCalledTimes(3);
  });

  describe("BIT u3,r8", () => {
    testCpuState("BIT 7,A", ({ ctx, onCycle }) => {
      ctx.writeRegister(Register.A, 0x80);

      testBitInRegister(ctx, 7, Register.A);

      expect(ctx.getFlag(Flag.Z)).toBe(false);
      expect(ctx.getFlag(Flag.H)).toBe(true);
      expect(ctx.getFlag(Flag.N)).toBe(false);
      expect(onCycle).toBeCalledTimes(1);
    });

    testCpuState("BIT 4,L", ({ ctx, onCycle }) => {
      ctx.writeRegister(Register.L, 0xef);

      testBitInRegister(ctx, 4, Register.L);

      expect(ctx.getFlag(Flag.Z)).toBe(true);
      expect(ctx.getFlag(Flag.H)).toBe(true);
      expect(ctx.getFlag(Flag.N)).toBe(false);
      expect(onCycle).toBeCalledTimes(1);
    });
  });

  describe("BIT u3,(HL)", () => {
    testCpuState("BIT 0,(HL)", ({ ctx, onCycle }) => {
      ctx.writeMemory(0x8ac5, 0xfe);
      ctx.writeRegisterPair(RegisterPair.HL, 0x8ac5);

      testBitInIndirectHL(ctx, 0);

      expect(ctx.getFlag(Flag.Z)).toBe(true);
      expect(ctx.getFlag(Flag.H)).toBe(true);
      expect(ctx.getFlag(Flag.N)).toBe(false);
      expect(onCycle).toBeCalledTimes(2);
    });

    testCpuState("BIT 1,(HL)", ({ ctx, onCycle }) => {
      ctx.writeMemory(0x8ac5, 0xfe);
      ctx.writeRegisterPair(RegisterPair.HL, 0x8ac5);

      testBitInIndirectHL(ctx, 1);

      expect(ctx.getFlag(Flag.Z)).toBe(false);
      expect(ctx.getFlag(Flag.H)).toBe(true);
      expect(ctx.getFlag(Flag.N)).toBe(false);
      expect(onCycle).toBeCalledTimes(2);
    });
  });

  describe("RES u3,r8", () => {
    testCpuState("RES 7,A", ({ ctx, onCycle }) => {
      ctx.writeRegister(Register.A, 0x80);

      resetBitInRegister(ctx, 7, Register.A);

      expect(ctx.readRegister(Register.A)).toBe(0x00);
      expect(onCycle).toBeCalledTimes(1);
    });

    testCpuState("RES 1,L", ({ ctx, onCycle }) => {
      ctx.writeRegister(Register.L, 0x3b);

      resetBitInRegister(ctx, 1, Register.L);

      expect(ctx.readRegister(Register.L)).toBe(0x39);
      expect(onCycle).toBeCalledTimes(1);
    });
  });

  testCpuState("RES u3,(HL)", ({ ctx, onCycle }) => {
    ctx.writeMemory(0x8ac5, 0xff);
    ctx.writeRegisterPair(RegisterPair.HL, 0x8ac5);

    resetBitInIndirectHL(ctx, 3);

    expect(ctx.readMemory(0x8ac5)).toBe(0xf7);
    expect(onCycle).toBeCalledTimes(3);
  });

  describe("SET u3,r8", () => {
    testCpuState("SET 2,A", ({ ctx, onCycle }) => {
      ctx.writeRegister(Register.A, 0x80);

      setBitInRegister(ctx, 2, Register.A);

      expect(ctx.readRegister(Register.A)).toBe(0x84);
      expect(onCycle).toBeCalledTimes(1);
    });

    testCpuState("SET 7,L", ({ ctx, onCycle }) => {
      ctx.writeRegister(Register.L, 0x3b);

      setBitInRegister(ctx, 7, Register.L);

      expect(ctx.readRegister(Register.L)).toBe(0xbb);
      expect(onCycle).toBeCalledTimes(1);
    });
  });

  testCpuState("SET u3,(HL)", ({ ctx, onCycle }) => {
    ctx.writeMemory(0x8ac5, 0x00);
    ctx.writeRegisterPair(RegisterPair.HL, 0x8ac5);

    setBitInIndirectHL(ctx, 3);

    expect(ctx.readMemory(0x8ac5)).toBe(0x08);
    expect(onCycle).toBeCalledTimes(3);
  });
});
