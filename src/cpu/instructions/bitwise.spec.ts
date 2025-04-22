import { describe, expect } from "vitest";

import { Flag, Register, RegisterPair } from "../register";
import {
  rotateLeftCircularAccumulator,
  rotateRightCircularAccumulator,
  rotateLeftAccumulator,
  rotateRightAccumulator,
  rotateLeftCircularRegister,
  rotateLeftCircularIndirectHL,
  rotateRightCircularRegister,
  rotateRightCircularIndirectHL,
  rotateLeftRegister,
  rotateLeftIndirectHL,
  rotateRightRegister,
  rotateRightIndirectHL,
  shiftLeftArithmeticRegister,
  shiftLeftArithmeticIndirectHL,
  shiftRightArithmeticRegister,
  shiftRightArithmeticIndirectHL,
  shiftRightLogicalRegister,
  shiftRightLogicalIndirectHL,
  swapNibblesRegister,
  swapNibblesIndirectHL,
  testBitRegister,
  testBitIndirectHL,
  resetBitRegister,
  resetBitIndirectHL,
  setBitRegister,
  setBitIndirectHL,
} from "./bitwise";
import { testInstruction } from "./test-lib";

describe("Rotate, shift, and bit operation instructions", () => {
  testInstruction("RLCA", ({ state }) => {
    state.writeRegister(Register.A, 0x85);

    rotateLeftCircularAccumulator(state);

    expect(state.readRegister(Register.A)).toBe(0x0b);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testInstruction("RRCA", ({ state }) => {
    state.writeRegister(Register.A, 0x3b);

    rotateRightCircularAccumulator(state);

    expect(state.readRegister(Register.A)).toBe(0x9d);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testInstruction("RLA", ({ state }) => {
    state.writeRegister(Register.A, 0x95);
    state.setFlag(Flag.CY, true);

    rotateLeftAccumulator(state);

    expect(state.readRegister(Register.A)).toBe(0x2b);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testInstruction("RRA", ({ state }) => {
    state.writeRegister(Register.A, 0x81);
    state.setFlag(Flag.CY, false);

    rotateRightAccumulator(state);

    expect(state.readRegister(Register.A)).toBe(0x40);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testInstruction("RLC r", ({ state }) => {
    state.writeRegister(Register.B, 0x85);
    state.setFlag(Flag.CY, false);

    rotateLeftCircularRegister(state, Register.B);

    expect(state.readRegister(Register.B)).toBe(0x0b);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testInstruction("RLC (HL)", ({ state }) => {
    state.writeMemory(0x8ac5, 0x00);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.setFlag(Flag.CY, false);

    rotateLeftCircularIndirectHL(state);

    expect(state.readMemory(0x8ac5)).toBe(0x00);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(3);
  });

  testInstruction("RRC r", ({ state }) => {
    state.writeRegister(Register.C, 0x01);
    state.setFlag(Flag.CY, false);

    rotateRightCircularRegister(state, Register.C);

    expect(state.readRegister(Register.C)).toBe(0x80);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testInstruction("RRC (HL)", ({ state }) => {
    state.writeMemory(0x8ac5, 0x00);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.setFlag(Flag.CY, false);

    rotateRightCircularIndirectHL(state);

    expect(state.readMemory(0x8ac5)).toBe(0x00);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(3);
  });

  testInstruction("RL r", ({ state }) => {
    state.writeRegister(Register.L, 0x80);
    state.setFlag(Flag.CY, false);

    rotateLeftRegister(state, Register.L);

    expect(state.readRegister(Register.L)).toBe(0x00);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testInstruction("RL (HL)", ({ state }) => {
    state.writeMemory(0x8ac5, 0x11);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.setFlag(Flag.CY, false);

    rotateLeftIndirectHL(state);

    expect(state.readMemory(0x8ac5)).toBe(0x22);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(3);
  });

  testInstruction("RR r", ({ state }) => {
    state.writeRegister(Register.A, 0x01);
    state.setFlag(Flag.CY, false);

    rotateRightRegister(state, Register.A);

    expect(state.readRegister(Register.A)).toBe(0x00);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testInstruction("RR (HL)", ({ state }) => {
    state.writeMemory(0x8ac5, 0x8a);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.setFlag(Flag.CY, false);

    rotateRightIndirectHL(state);

    expect(state.readMemory(0x8ac5)).toBe(0x45);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(3);
  });

  testInstruction("SLA r", ({ state }) => {
    state.writeRegister(Register.D, 0x80);
    state.setFlag(Flag.CY, false);

    shiftLeftArithmeticRegister(state, Register.D);

    expect(state.readRegister(Register.D)).toBe(0x00);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testInstruction("SLA (HL)", ({ state }) => {
    state.writeMemory(0x8ac5, 0xff);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.setFlag(Flag.CY, false);

    shiftLeftArithmeticIndirectHL(state);

    expect(state.readMemory(0x8ac5)).toBe(0xfe);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(3);
  });

  testInstruction("SRA r", ({ state }) => {
    state.writeRegister(Register.A, 0x8a);
    state.setFlag(Flag.CY, false);

    shiftRightArithmeticRegister(state, Register.A);

    expect(state.readRegister(Register.A)).toBe(0xc5);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testInstruction("SRA (HL)", ({ state }) => {
    state.writeMemory(0x8ac5, 0x01);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.setFlag(Flag.CY, false);

    shiftRightArithmeticIndirectHL(state);

    expect(state.readMemory(0x8ac5)).toBe(0x00);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(3);
  });

  testInstruction("SRL r", ({ state }) => {
    state.writeRegister(Register.A, 0x01);
    state.setFlag(Flag.CY, false);

    shiftRightLogicalRegister(state, Register.A);

    expect(state.readRegister(Register.A)).toBe(0x00);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testInstruction("SRL (HL)", ({ state }) => {
    state.writeMemory(0x8ac5, 0xff);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.setFlag(Flag.CY, false);

    shiftRightLogicalIndirectHL(state);

    expect(state.readMemory(0x8ac5)).toBe(0x7f);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(3);
  });

  testInstruction("SWAP r", ({ state }) => {
    state.writeRegister(Register.A, 0x00);
    state.setFlag(Flag.CY, false);

    swapNibblesRegister(state, Register.A);

    expect(state.readRegister(Register.A)).toBe(0x00);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testInstruction("SWAP (HL)", ({ state }) => {
    state.writeMemory(0x8ac5, 0xf0);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.setFlag(Flag.CY, false);

    swapNibblesIndirectHL(state);

    expect(state.readMemory(0x8ac5)).toBe(0x0f);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(3);
  });

  describe("BIT b, r", () => {
    testInstruction("BIT 7, A", ({ state }) => {
      state.writeRegister(Register.A, 0x80);

      testBitRegister(state, 7, Register.A);

      expect(state.getFlag(Flag.Z)).toBe(false);
      expect(state.getFlag(Flag.H)).toBe(true);
      expect(state.getFlag(Flag.N)).toBe(false);
      expect(state.getElapsedCycles()).toBe(1);
    });

    testInstruction("BIT 4, L", ({ state }) => {
      state.writeRegister(Register.L, 0xef);

      testBitRegister(state, 4, Register.L);

      expect(state.getFlag(Flag.Z)).toBe(true);
      expect(state.getFlag(Flag.H)).toBe(true);
      expect(state.getFlag(Flag.N)).toBe(false);
      expect(state.getElapsedCycles()).toBe(1);
    });
  });

  describe("BIT b, (HL)", () => {
    testInstruction("BIT 0, (HL)", ({ state }) => {
      state.writeMemory(0x8ac5, 0xfe);
      state.writeRegisterPair(RegisterPair.HL, 0x8ac5);

      testBitIndirectHL(state, 0);

      expect(state.getFlag(Flag.Z)).toBe(true);
      expect(state.getFlag(Flag.H)).toBe(true);
      expect(state.getFlag(Flag.N)).toBe(false);
      expect(state.getElapsedCycles()).toBe(2);
    });

    testInstruction("BIT 1, (HL)", ({ state }) => {
      state.writeMemory(0x8ac5, 0xfe);
      state.writeRegisterPair(RegisterPair.HL, 0x8ac5);

      testBitIndirectHL(state, 1);

      expect(state.getFlag(Flag.Z)).toBe(false);
      expect(state.getFlag(Flag.H)).toBe(true);
      expect(state.getFlag(Flag.N)).toBe(false);
      expect(state.getElapsedCycles()).toBe(2);
    });
  });

  describe("RES b, r", () => {
    testInstruction("RES 7, A", ({ state }) => {
      state.writeRegister(Register.A, 0x80);

      resetBitRegister(state, 7, Register.A);

      expect(state.readRegister(Register.A)).toBe(0x00);
      expect(state.getElapsedCycles()).toBe(1);
    });

    testInstruction("RES 1, L", ({ state }) => {
      state.writeRegister(Register.L, 0x3b);

      resetBitRegister(state, 1, Register.L);

      expect(state.readRegister(Register.L)).toBe(0x39);
      expect(state.getElapsedCycles()).toBe(1);
    });
  });

  testInstruction("RES b, (HL)", ({ state }) => {
    state.writeMemory(0x8ac5, 0xff);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);

    resetBitIndirectHL(state, 3);

    expect(state.readMemory(0x8ac5)).toBe(0xf7);
    expect(state.getElapsedCycles()).toBe(3);
  });

  describe("SET b, r", () => {
    testInstruction("SET 2, A", ({ state }) => {
      state.writeRegister(Register.A, 0x80);

      setBitRegister(state, 2, Register.A);

      expect(state.readRegister(Register.A)).toBe(0x84);
      expect(state.getElapsedCycles()).toBe(1);
    });

    testInstruction("SET 7, L", ({ state }) => {
      state.writeRegister(Register.L, 0x3b);

      setBitRegister(state, 7, Register.L);

      expect(state.readRegister(Register.L)).toBe(0xbb);
      expect(state.getElapsedCycles()).toBe(1);
    });
  });

  testInstruction("SET b, (HL)", ({ state }) => {
    state.writeMemory(0x8ac5, 0x00);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);

    setBitIndirectHL(state, 3);

    expect(state.readMemory(0x8ac5)).toBe(0x08);
    expect(state.getElapsedCycles()).toBe(3);
  });
});
