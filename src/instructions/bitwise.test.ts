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
import { test } from "./test-lib";

describe("Rotate, shift, and bit operation instructions", () => {
  test("RLCA", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x85);

    rotateLeftCircularAccumulator({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0x0b);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("RRCA", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x3b);

    rotateRightCircularAccumulator({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0x9d);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("RLA", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x95);
    cpu.regs.setFlag(Flag.CY, true);

    rotateLeftAccumulator({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0x2b);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("RRA", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x81);
    cpu.regs.setFlag(Flag.CY, false);

    rotateRightAccumulator({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0x40);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("RLC r", ({ cpu, memory }) => {
    cpu.regs.write(Register.B, 0x85);
    cpu.regs.setFlag(Flag.CY, false);

    rotateLeftCircularRegister({ cpu, memory }, Register.B);

    expect(cpu.regs.read(Register.B)).toBe(0x0b);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("RLC (HL)", ({ cpu, memory }) => {
    memory.write(0x8ac5, 0x00);
    cpu.regs.writePair(RegisterPair.HL, 0x8ac5);
    cpu.regs.setFlag(Flag.CY, false);

    rotateLeftCircularIndirectHL({ cpu, memory });

    expect(memory.read(0x8ac5)).toBe(0x00);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("RRC r", ({ cpu, memory }) => {
    cpu.regs.write(Register.C, 0x01);
    cpu.regs.setFlag(Flag.CY, false);

    rotateRightCircularRegister({ cpu, memory }, Register.C);

    expect(cpu.regs.read(Register.C)).toBe(0x80);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("RRC (HL)", ({ cpu, memory }) => {
    memory.write(0x8ac5, 0x00);
    cpu.regs.writePair(RegisterPair.HL, 0x8ac5);
    cpu.regs.setFlag(Flag.CY, false);

    rotateRightCircularIndirectHL({ cpu, memory });

    expect(memory.read(0x8ac5)).toBe(0x00);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("RL r", ({ cpu, memory }) => {
    cpu.regs.write(Register.L, 0x80);
    cpu.regs.setFlag(Flag.CY, false);

    rotateLeftRegister({ cpu, memory }, Register.L);

    expect(cpu.regs.read(Register.L)).toBe(0x00);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("RL (HL)", ({ cpu, memory }) => {
    memory.write(0x8ac5, 0x11);
    cpu.regs.writePair(RegisterPair.HL, 0x8ac5);
    cpu.regs.setFlag(Flag.CY, false);

    rotateLeftIndirectHL({ cpu, memory });

    expect(memory.read(0x8ac5)).toBe(0x22);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("RR r", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x01);
    cpu.regs.setFlag(Flag.CY, false);

    rotateRightRegister({ cpu, memory }, Register.A);

    expect(cpu.regs.read(Register.A)).toBe(0x00);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("RR (HL)", ({ cpu, memory }) => {
    memory.write(0x8ac5, 0x8a);
    cpu.regs.writePair(RegisterPair.HL, 0x8ac5);
    cpu.regs.setFlag(Flag.CY, false);

    rotateRightIndirectHL({ cpu, memory });

    expect(memory.read(0x8ac5)).toBe(0x45);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("SLA r", ({ cpu, memory }) => {
    cpu.regs.write(Register.D, 0x80);
    cpu.regs.setFlag(Flag.CY, false);

    shiftLeftArithmeticRegister({ cpu, memory }, Register.D);

    expect(cpu.regs.read(Register.D)).toBe(0x00);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("SLA (HL)", ({ cpu, memory }) => {
    memory.write(0x8ac5, 0xff);
    cpu.regs.writePair(RegisterPair.HL, 0x8ac5);
    cpu.regs.setFlag(Flag.CY, false);

    shiftLeftArithmeticIndirectHL({ cpu, memory });

    expect(memory.read(0x8ac5)).toBe(0xfe);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("SRA r", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x8a);
    cpu.regs.setFlag(Flag.CY, false);

    shiftRightArithmeticRegister({ cpu, memory }, Register.A);

    expect(cpu.regs.read(Register.A)).toBe(0xc5);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("SRA (HL)", ({ cpu, memory }) => {
    memory.write(0x8ac5, 0x01);
    cpu.regs.writePair(RegisterPair.HL, 0x8ac5);
    cpu.regs.setFlag(Flag.CY, false);

    shiftRightArithmeticIndirectHL({ cpu, memory });

    expect(memory.read(0x8ac5)).toBe(0x00);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("SRL r", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x01);
    cpu.regs.setFlag(Flag.CY, false);

    shiftRightLogicalRegister({ cpu, memory }, Register.A);

    expect(cpu.regs.read(Register.A)).toBe(0x00);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("SRL (HL)", ({ cpu, memory }) => {
    memory.write(0x8ac5, 0xff);
    cpu.regs.writePair(RegisterPair.HL, 0x8ac5);
    cpu.regs.setFlag(Flag.CY, false);

    shiftRightLogicalIndirectHL({ cpu, memory });

    expect(memory.read(0x8ac5)).toBe(0x7f);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("SWAP r", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x00);
    cpu.regs.setFlag(Flag.CY, false);

    swapNibblesRegister({ cpu, memory }, Register.A);

    expect(cpu.regs.read(Register.A)).toBe(0x00);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("SWAP (HL)", ({ cpu, memory }) => {
    memory.write(0x8ac5, 0xf0);
    cpu.regs.writePair(RegisterPair.HL, 0x8ac5);
    cpu.regs.setFlag(Flag.CY, false);

    swapNibblesIndirectHL({ cpu, memory });

    expect(memory.read(0x8ac5)).toBe(0x0f);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
  });

  describe("BIT b, r", () => {
    test("BIT 7, A", ({ cpu, memory }) => {
      cpu.regs.write(Register.A, 0x80);

      testBitRegister({ cpu, memory }, 7, Register.A);

      expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
      expect(cpu.regs.isFlagSet(Flag.H)).toBe(true);
      expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
    });

    test("BIT 4, L", ({ cpu, memory }) => {
      cpu.regs.write(Register.L, 0xef);

      testBitRegister({ cpu, memory }, 4, Register.L);

      expect(cpu.regs.isFlagSet(Flag.Z)).toBe(true);
      expect(cpu.regs.isFlagSet(Flag.H)).toBe(true);
      expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
    });
  });

  describe("BIT b, (HL)", () => {
    test("BIT 0, (HL)", ({ cpu, memory }) => {
      memory.write(0x8ac5, 0xfe);
      cpu.regs.writePair(RegisterPair.HL, 0x8ac5);

      testBitIndirectHL({ cpu, memory }, 0);

      expect(cpu.regs.isFlagSet(Flag.Z)).toBe(true);
      expect(cpu.regs.isFlagSet(Flag.H)).toBe(true);
      expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
    });

    test("BIT 1, (HL)", ({ cpu, memory }) => {
      memory.write(0x8ac5, 0xfe);
      cpu.regs.writePair(RegisterPair.HL, 0x8ac5);

      testBitIndirectHL({ cpu, memory }, 1);

      expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
      expect(cpu.regs.isFlagSet(Flag.H)).toBe(true);
      expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
    });
  });

  describe("RES b, r", () => {
    test("RES 7, A", ({ cpu, memory }) => {
      cpu.regs.write(Register.A, 0x80);

      resetBitRegister({ cpu, memory }, 7, Register.A);

      expect(cpu.regs.read(Register.A)).toBe(0x00);
    });

    test("RES 1, L", ({ cpu, memory }) => {
      cpu.regs.write(Register.L, 0x3b);

      resetBitRegister({ cpu, memory }, 1, Register.L);

      expect(cpu.regs.read(Register.L)).toBe(0x39);
    });
  });

  test("RES b, (HL)", ({ cpu, memory }) => {
    memory.write(0x8ac5, 0xff);
    cpu.regs.writePair(RegisterPair.HL, 0x8ac5);

    resetBitIndirectHL({ cpu, memory }, 3);

    expect(memory.read(0x8ac5)).toBe(0xf7);
  });

  describe("SET b, r", () => {
    test("SET 2, A", ({ cpu, memory }) => {
      cpu.regs.write(Register.A, 0x80);

      setBitRegister({ cpu, memory }, 2, Register.A);

      expect(cpu.regs.read(Register.A)).toBe(0x84);
    });

    test("SET 7, L", ({ cpu, memory }) => {
      cpu.regs.write(Register.L, 0x3b);

      setBitRegister({ cpu, memory }, 7, Register.L);

      expect(cpu.regs.read(Register.L)).toBe(0xbb);
    });
  });

  test("SET b, (HL)", ({ cpu, memory }) => {
    memory.write(0x8ac5, 0x00);
    cpu.regs.writePair(RegisterPair.HL, 0x8ac5);

    setBitIndirectHL({ cpu, memory }, 3);

    expect(memory.read(0x8ac5)).toBe(0x08);
  });
});
