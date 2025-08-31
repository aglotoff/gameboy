import { describe, expect } from "vitest";

import { Flag, Register } from "../register";
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
import { RegisterPair } from "../cpu-state";

describe("Rotate, shift, and bit operation instructions", () => {
  testCpuState("RLCA", ({ state }) => {
    state.writeRegister(Register.A, 0x85);

    rotateAccumulatorLeft(state);

    expect(state.readRegister(Register.A)).toBe(0x0b);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testCpuState("RRCA", ({ state }) => {
    state.writeRegister(Register.A, 0x3b);

    rotateAccumulatorRight(state);

    expect(state.readRegister(Register.A)).toBe(0x9d);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testCpuState("RLA", ({ state }) => {
    state.writeRegister(Register.A, 0x95);
    state.setFlag(Flag.CY, true);

    rotateAccumulatorLeftThroughCarry(state);

    expect(state.readRegister(Register.A)).toBe(0x2b);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testCpuState("RRA", ({ state }) => {
    state.writeRegister(Register.A, 0x81);
    state.setFlag(Flag.CY, false);

    rotateAccumulatorRightThroughCarry(state);

    expect(state.readRegister(Register.A)).toBe(0x40);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testCpuState("RLC r8", ({ state }) => {
    state.writeRegister(Register.B, 0x85);
    state.setFlag(Flag.CY, false);

    rotateRegisterLeft(state, Register.B);

    expect(state.readRegister(Register.B)).toBe(0x0b);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testCpuState("RLC (HL)", ({ state }) => {
    state.writeMemory(0x8ac5, 0x00);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.setFlag(Flag.CY, false);

    rotateIndirectHLLeft(state);

    expect(state.readMemory(0x8ac5)).toBe(0x00);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(3);
  });

  testCpuState("RRC r8", ({ state }) => {
    state.writeRegister(Register.C, 0x01);
    state.setFlag(Flag.CY, false);

    rotateRegisterRight(state, Register.C);

    expect(state.readRegister(Register.C)).toBe(0x80);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testCpuState("RRC (HL)", ({ state }) => {
    state.writeMemory(0x8ac5, 0x00);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.setFlag(Flag.CY, false);

    rotateIndirectHLRight(state);

    expect(state.readMemory(0x8ac5)).toBe(0x00);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(3);
  });

  testCpuState("RL r8", ({ state }) => {
    state.writeRegister(Register.L, 0x80);
    state.setFlag(Flag.CY, false);

    rotateRegisterLeftThroughCarry(state, Register.L);

    expect(state.readRegister(Register.L)).toBe(0x00);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testCpuState("RL (HL)", ({ state }) => {
    state.writeMemory(0x8ac5, 0x11);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.setFlag(Flag.CY, false);

    rotateIndirectHLLeftThroughCarry(state);

    expect(state.readMemory(0x8ac5)).toBe(0x22);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(3);
  });

  testCpuState("RR r8", ({ state }) => {
    state.writeRegister(Register.A, 0x01);
    state.setFlag(Flag.CY, false);

    rotateRegisterRightThroughCarry(state, Register.A);

    expect(state.readRegister(Register.A)).toBe(0x00);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testCpuState("RR (HL)", ({ state }) => {
    state.writeMemory(0x8ac5, 0x8a);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.setFlag(Flag.CY, false);

    rotateIndirectHLRightThroughCarry(state);

    expect(state.readMemory(0x8ac5)).toBe(0x45);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(3);
  });

  testCpuState("SLA r8", ({ state }) => {
    state.writeRegister(Register.D, 0x80);
    state.setFlag(Flag.CY, false);

    shiftLeftArithmeticallyRegister(state, Register.D);

    expect(state.readRegister(Register.D)).toBe(0x00);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testCpuState("SLA (HL)", ({ state }) => {
    state.writeMemory(0x8ac5, 0xff);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.setFlag(Flag.CY, false);

    shiftLeftArithmeticallyIndirectHL(state);

    expect(state.readMemory(0x8ac5)).toBe(0xfe);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(3);
  });

  testCpuState("SRA r8", ({ state }) => {
    state.writeRegister(Register.A, 0x8a);
    state.setFlag(Flag.CY, false);

    shiftRightArithmeticallyRegister(state, Register.A);

    expect(state.readRegister(Register.A)).toBe(0xc5);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testCpuState("SRA (HL)", ({ state }) => {
    state.writeMemory(0x8ac5, 0x01);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.setFlag(Flag.CY, false);

    shiftRightArithmeticallyIndirectHL(state);

    expect(state.readMemory(0x8ac5)).toBe(0x00);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(3);
  });

  testCpuState("SRL r8", ({ state }) => {
    state.writeRegister(Register.A, 0x01);
    state.setFlag(Flag.CY, false);

    shiftRightLogicallyRegister(state, Register.A);

    expect(state.readRegister(Register.A)).toBe(0x00);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testCpuState("SRL (HL)", ({ state }) => {
    state.writeMemory(0x8ac5, 0xff);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.setFlag(Flag.CY, false);

    shiftRightLogicallyIndirectHL(state);

    expect(state.readMemory(0x8ac5)).toBe(0x7f);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(3);
  });

  testCpuState("SWAP r8", ({ state }) => {
    state.writeRegister(Register.A, 0x00);
    state.setFlag(Flag.CY, false);

    swapNibblesInRegister(state, Register.A);

    expect(state.readRegister(Register.A)).toBe(0x00);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testCpuState("SWAP (HL)", ({ state }) => {
    state.writeMemory(0x8ac5, 0xf0);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.setFlag(Flag.CY, false);

    swapNibblesInIndirectHL(state);

    expect(state.readMemory(0x8ac5)).toBe(0x0f);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(3);
  });

  describe("BIT u3,r8", () => {
    testCpuState("BIT 7,A", ({ state }) => {
      state.writeRegister(Register.A, 0x80);

      testBitInRegister(state, 7, Register.A);

      expect(state.getFlag(Flag.Z)).toBe(false);
      expect(state.getFlag(Flag.H)).toBe(true);
      expect(state.getFlag(Flag.N)).toBe(false);
      expect(state.getElapsedCycles()).toBe(1);
    });

    testCpuState("BIT 4,L", ({ state }) => {
      state.writeRegister(Register.L, 0xef);

      testBitInRegister(state, 4, Register.L);

      expect(state.getFlag(Flag.Z)).toBe(true);
      expect(state.getFlag(Flag.H)).toBe(true);
      expect(state.getFlag(Flag.N)).toBe(false);
      expect(state.getElapsedCycles()).toBe(1);
    });
  });

  describe("BIT u3,(HL)", () => {
    testCpuState("BIT 0,(HL)", ({ state }) => {
      state.writeMemory(0x8ac5, 0xfe);
      state.writeRegisterPair(RegisterPair.HL, 0x8ac5);

      testBitInIndirectHL(state, 0);

      expect(state.getFlag(Flag.Z)).toBe(true);
      expect(state.getFlag(Flag.H)).toBe(true);
      expect(state.getFlag(Flag.N)).toBe(false);
      expect(state.getElapsedCycles()).toBe(2);
    });

    testCpuState("BIT 1,(HL)", ({ state }) => {
      state.writeMemory(0x8ac5, 0xfe);
      state.writeRegisterPair(RegisterPair.HL, 0x8ac5);

      testBitInIndirectHL(state, 1);

      expect(state.getFlag(Flag.Z)).toBe(false);
      expect(state.getFlag(Flag.H)).toBe(true);
      expect(state.getFlag(Flag.N)).toBe(false);
      expect(state.getElapsedCycles()).toBe(2);
    });
  });

  describe("RES u3,r8", () => {
    testCpuState("RES 7,A", ({ state }) => {
      state.writeRegister(Register.A, 0x80);

      resetBitInRegister(state, 7, Register.A);

      expect(state.readRegister(Register.A)).toBe(0x00);
      expect(state.getElapsedCycles()).toBe(1);
    });

    testCpuState("RES 1,L", ({ state }) => {
      state.writeRegister(Register.L, 0x3b);

      resetBitInRegister(state, 1, Register.L);

      expect(state.readRegister(Register.L)).toBe(0x39);
      expect(state.getElapsedCycles()).toBe(1);
    });
  });

  testCpuState("RES u3,(HL)", ({ state }) => {
    state.writeMemory(0x8ac5, 0xff);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);

    resetBitInIndirectHL(state, 3);

    expect(state.readMemory(0x8ac5)).toBe(0xf7);
    expect(state.getElapsedCycles()).toBe(3);
  });

  describe("SET u3,r8", () => {
    testCpuState("SET 2,A", ({ state }) => {
      state.writeRegister(Register.A, 0x80);

      setBitInRegister(state, 2, Register.A);

      expect(state.readRegister(Register.A)).toBe(0x84);
      expect(state.getElapsedCycles()).toBe(1);
    });

    testCpuState("SET 7,L", ({ state }) => {
      state.writeRegister(Register.L, 0x3b);

      setBitInRegister(state, 7, Register.L);

      expect(state.readRegister(Register.L)).toBe(0xbb);
      expect(state.getElapsedCycles()).toBe(1);
    });
  });

  testCpuState("SET u3,(HL)", ({ state }) => {
    state.writeMemory(0x8ac5, 0x00);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);

    setBitInIndirectHL(state, 3);

    expect(state.readMemory(0x8ac5)).toBe(0x08);
    expect(state.getElapsedCycles()).toBe(3);
  });
});
