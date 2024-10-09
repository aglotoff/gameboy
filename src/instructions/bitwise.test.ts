import { describe, expect } from "vitest";

import { Flag, Register, RegisterPair } from "../regs";
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

    rotateLeftCircularAccumulator.call(state);

    expect(state.readRegister(Register.A)).toBe(0x0b);
    expect(state.isFlagSet(Flag.CY)).toBe(true);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
  });

  testInstruction("RRCA", ({ state }) => {
    state.writeRegister(Register.A, 0x3b);

    rotateRightCircularAccumulator.call(state);

    expect(state.readRegister(Register.A)).toBe(0x9d);
    expect(state.isFlagSet(Flag.CY)).toBe(true);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
  });

  testInstruction("RLA", ({ state }) => {
    state.writeRegister(Register.A, 0x95);
    state.setFlag(Flag.CY, true);

    rotateLeftAccumulator.call(state);

    expect(state.readRegister(Register.A)).toBe(0x2b);
    expect(state.isFlagSet(Flag.CY)).toBe(true);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
  });

  testInstruction("RRA", ({ state }) => {
    state.writeRegister(Register.A, 0x81);
    state.setFlag(Flag.CY, false);

    rotateRightAccumulator.call(state);

    expect(state.readRegister(Register.A)).toBe(0x40);
    expect(state.isFlagSet(Flag.CY)).toBe(true);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
  });

  testInstruction("RLC r", ({ state }) => {
    state.writeRegister(Register.B, 0x85);
    state.setFlag(Flag.CY, false);

    rotateLeftCircularRegister.call(state, Register.B);

    expect(state.readRegister(Register.B)).toBe(0x0b);
    expect(state.isFlagSet(Flag.CY)).toBe(true);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
  });

  testInstruction("RLC (HL)", ({ state }) => {
    state.writeBus(0x8ac5, 0x00);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.setFlag(Flag.CY, false);

    rotateLeftCircularIndirectHL.call(state);

    expect(state.readBus(0x8ac5)).toBe(0x00);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
    expect(state.isFlagSet(Flag.Z)).toBe(true);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
  });

  testInstruction("RRC r", ({ state }) => {
    state.writeRegister(Register.C, 0x01);
    state.setFlag(Flag.CY, false);

    rotateRightCircularRegister.call(state, Register.C);

    expect(state.readRegister(Register.C)).toBe(0x80);
    expect(state.isFlagSet(Flag.CY)).toBe(true);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
  });

  testInstruction("RRC (HL)", ({ state }) => {
    state.writeBus(0x8ac5, 0x00);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.setFlag(Flag.CY, false);

    rotateRightCircularIndirectHL.call(state);

    expect(state.readBus(0x8ac5)).toBe(0x00);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
    expect(state.isFlagSet(Flag.Z)).toBe(true);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
  });

  testInstruction("RL r", ({ state }) => {
    state.writeRegister(Register.L, 0x80);
    state.setFlag(Flag.CY, false);

    rotateLeftRegister.call(state, Register.L);

    expect(state.readRegister(Register.L)).toBe(0x00);
    expect(state.isFlagSet(Flag.CY)).toBe(true);
    expect(state.isFlagSet(Flag.Z)).toBe(true);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
  });

  testInstruction("RL (HL)", ({ state }) => {
    state.writeBus(0x8ac5, 0x11);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.setFlag(Flag.CY, false);

    rotateLeftIndirectHL.call(state);

    expect(state.readBus(0x8ac5)).toBe(0x22);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
  });

  testInstruction("RR r", ({ state }) => {
    state.writeRegister(Register.A, 0x01);
    state.setFlag(Flag.CY, false);

    rotateRightRegister.call(state, Register.A);

    expect(state.readRegister(Register.A)).toBe(0x00);
    expect(state.isFlagSet(Flag.CY)).toBe(true);
    expect(state.isFlagSet(Flag.Z)).toBe(true);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
  });

  testInstruction("RR (HL)", ({ state }) => {
    state.writeBus(0x8ac5, 0x8a);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.setFlag(Flag.CY, false);

    rotateRightIndirectHL.call(state);

    expect(state.readBus(0x8ac5)).toBe(0x45);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
  });

  testInstruction("SLA r", ({ state }) => {
    state.writeRegister(Register.D, 0x80);
    state.setFlag(Flag.CY, false);

    shiftLeftArithmeticRegister.call(state, Register.D);

    expect(state.readRegister(Register.D)).toBe(0x00);
    expect(state.isFlagSet(Flag.CY)).toBe(true);
    expect(state.isFlagSet(Flag.Z)).toBe(true);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
  });

  testInstruction("SLA (HL)", ({ state }) => {
    state.writeBus(0x8ac5, 0xff);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.setFlag(Flag.CY, false);

    shiftLeftArithmeticIndirectHL.call(state);

    expect(state.readBus(0x8ac5)).toBe(0xfe);
    expect(state.isFlagSet(Flag.CY)).toBe(true);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
  });

  testInstruction("SRA r", ({ state }) => {
    state.writeRegister(Register.A, 0x8a);
    state.setFlag(Flag.CY, false);

    shiftRightArithmeticRegister.call(state, Register.A);

    expect(state.readRegister(Register.A)).toBe(0xc5);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
  });

  testInstruction("SRA (HL)", ({ state }) => {
    state.writeBus(0x8ac5, 0x01);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.setFlag(Flag.CY, false);

    shiftRightArithmeticIndirectHL.call(state);

    expect(state.readBus(0x8ac5)).toBe(0x00);
    expect(state.isFlagSet(Flag.CY)).toBe(true);
    expect(state.isFlagSet(Flag.Z)).toBe(true);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
  });

  testInstruction("SRL r", ({ state }) => {
    state.writeRegister(Register.A, 0x01);
    state.setFlag(Flag.CY, false);

    shiftRightLogicalRegister.call(state, Register.A);

    expect(state.readRegister(Register.A)).toBe(0x00);
    expect(state.isFlagSet(Flag.CY)).toBe(true);
    expect(state.isFlagSet(Flag.Z)).toBe(true);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
  });

  testInstruction("SRL (HL)", ({ state }) => {
    state.writeBus(0x8ac5, 0xff);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.setFlag(Flag.CY, false);

    shiftRightLogicalIndirectHL.call(state);

    expect(state.readBus(0x8ac5)).toBe(0x7f);
    expect(state.isFlagSet(Flag.CY)).toBe(true);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
  });

  testInstruction("SWAP r", ({ state }) => {
    state.writeRegister(Register.A, 0x00);
    state.setFlag(Flag.CY, false);

    swapNibblesRegister.call(state, Register.A);

    expect(state.readRegister(Register.A)).toBe(0x00);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
    expect(state.isFlagSet(Flag.Z)).toBe(true);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
  });

  testInstruction("SWAP (HL)", ({ state }) => {
    state.writeBus(0x8ac5, 0xf0);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.setFlag(Flag.CY, false);

    swapNibblesIndirectHL.call(state);

    expect(state.readBus(0x8ac5)).toBe(0x0f);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
  });

  describe("BIT b, r", () => {
    testInstruction("BIT 7, A", ({ state }) => {
      state.writeRegister(Register.A, 0x80);

      testBitRegister.call(state, 7, Register.A);

      expect(state.isFlagSet(Flag.Z)).toBe(false);
      expect(state.isFlagSet(Flag.H)).toBe(true);
      expect(state.isFlagSet(Flag.N)).toBe(false);
    });

    testInstruction("BIT 4, L", ({ state }) => {
      state.writeRegister(Register.L, 0xef);

      testBitRegister.call(state, 4, Register.L);

      expect(state.isFlagSet(Flag.Z)).toBe(true);
      expect(state.isFlagSet(Flag.H)).toBe(true);
      expect(state.isFlagSet(Flag.N)).toBe(false);
    });
  });

  describe("BIT b, (HL)", () => {
    testInstruction("BIT 0, (HL)", ({ state }) => {
      state.writeBus(0x8ac5, 0xfe);
      state.writeRegisterPair(RegisterPair.HL, 0x8ac5);

      testBitIndirectHL.call(state, 0);

      expect(state.isFlagSet(Flag.Z)).toBe(true);
      expect(state.isFlagSet(Flag.H)).toBe(true);
      expect(state.isFlagSet(Flag.N)).toBe(false);
    });

    testInstruction("BIT 1, (HL)", ({ state }) => {
      state.writeBus(0x8ac5, 0xfe);
      state.writeRegisterPair(RegisterPair.HL, 0x8ac5);

      testBitIndirectHL.call(state, 1);

      expect(state.isFlagSet(Flag.Z)).toBe(false);
      expect(state.isFlagSet(Flag.H)).toBe(true);
      expect(state.isFlagSet(Flag.N)).toBe(false);
    });
  });

  describe("RES b, r", () => {
    testInstruction("RES 7, A", ({ state }) => {
      state.writeRegister(Register.A, 0x80);

      resetBitRegister.call(state, 7, Register.A);

      expect(state.readRegister(Register.A)).toBe(0x00);
    });

    testInstruction("RES 1, L", ({ state }) => {
      state.writeRegister(Register.L, 0x3b);

      resetBitRegister.call(state, 1, Register.L);

      expect(state.readRegister(Register.L)).toBe(0x39);
    });
  });

  testInstruction("RES b, (HL)", ({ state }) => {
    state.writeBus(0x8ac5, 0xff);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);

    resetBitIndirectHL.call(state, 3);

    expect(state.readBus(0x8ac5)).toBe(0xf7);
  });

  describe("SET b, r", () => {
    testInstruction("SET 2, A", ({ state }) => {
      state.writeRegister(Register.A, 0x80);

      setBitRegister.call(state, 2, Register.A);

      expect(state.readRegister(Register.A)).toBe(0x84);
    });

    testInstruction("SET 7, L", ({ state }) => {
      state.writeRegister(Register.L, 0x3b);

      setBitRegister.call(state, 7, Register.L);

      expect(state.readRegister(Register.L)).toBe(0xbb);
    });
  });

  testInstruction("SET b, (HL)", ({ state }) => {
    state.writeBus(0x8ac5, 0x00);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);

    setBitIndirectHL.call(state, 3);

    expect(state.readBus(0x8ac5)).toBe(0x08);
  });
});
