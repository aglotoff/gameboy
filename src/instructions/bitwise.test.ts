import { describe, expect, test as baseTest } from "vitest";

import {
  Flag,
  InterruptFlags,
  Register,
  RegisterFile,
  RegisterPair,
} from "../cpu";
import { Memory } from "../memory";

import { InstructionCtx } from "./lib";
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

const test = baseTest.extend({
  ctx: async ({}, use: (ctx: InstructionCtx) => Promise<void>) => {
    await use({
      regs: new RegisterFile(),
      memory: new Memory(),
      interruptFlags: new InterruptFlags(),
    });
  },
});

describe("Rotate, shift, and bit operation instructions", () => {
  test("RLCA", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x85);

    rotateLeftCircularAccumulator(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0x0b);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("RRCA", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x3b);

    rotateRightCircularAccumulator(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0x9d);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("RLA", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x95);
    ctx.regs.setFlag(Flag.CY, true);

    rotateLeftAccumulator(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0x2b);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("RRA", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x81);
    ctx.regs.setFlag(Flag.CY, false);

    rotateRightAccumulator(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0x40);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("RLC r", ({ ctx }) => {
    ctx.regs.write(Register.B, 0x85);
    ctx.regs.setFlag(Flag.CY, false);

    rotateLeftCircularRegister(ctx, Register.B);

    expect(ctx.regs.read(Register.B)).toBe(0x0b);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("RLC (HL)", ({ ctx }) => {
    ctx.memory.write(0x8ac5, 0x00);
    ctx.regs.writePair(RegisterPair.HL, 0x8ac5);
    ctx.regs.setFlag(Flag.CY, false);

    rotateLeftCircularIndirectHL(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0x00);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("RRC r", ({ ctx }) => {
    ctx.regs.write(Register.C, 0x01);
    ctx.regs.setFlag(Flag.CY, false);

    rotateRightCircularRegister(ctx, Register.C);

    expect(ctx.regs.read(Register.C)).toBe(0x80);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("RRC (HL)", ({ ctx }) => {
    ctx.memory.write(0x8ac5, 0x00);
    ctx.regs.writePair(RegisterPair.HL, 0x8ac5);
    ctx.regs.setFlag(Flag.CY, false);

    rotateRightCircularIndirectHL(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0x00);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("RL r", ({ ctx }) => {
    ctx.regs.write(Register.L, 0x80);
    ctx.regs.setFlag(Flag.CY, false);

    rotateLeftRegister(ctx, Register.L);

    expect(ctx.regs.read(Register.L)).toBe(0x00);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("RL (HL)", ({ ctx }) => {
    ctx.memory.write(0x8ac5, 0x11);
    ctx.regs.writePair(RegisterPair.HL, 0x8ac5);
    ctx.regs.setFlag(Flag.CY, false);

    rotateLeftIndirectHL(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0x22);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("RR r", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x01);
    ctx.regs.setFlag(Flag.CY, false);

    rotateRightRegister(ctx, Register.A);

    expect(ctx.regs.read(Register.A)).toBe(0x00);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("RR (HL)", ({ ctx }) => {
    ctx.memory.write(0x8ac5, 0x8a);
    ctx.regs.writePair(RegisterPair.HL, 0x8ac5);
    ctx.regs.setFlag(Flag.CY, false);

    rotateRightIndirectHL(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0x45);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("SLA r", ({ ctx }) => {
    ctx.regs.write(Register.D, 0x80);
    ctx.regs.setFlag(Flag.CY, false);

    shiftLeftArithmeticRegister(ctx, Register.D);

    expect(ctx.regs.read(Register.D)).toBe(0x00);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("SLA (HL)", ({ ctx }) => {
    ctx.memory.write(0x8ac5, 0xff);
    ctx.regs.writePair(RegisterPair.HL, 0x8ac5);
    ctx.regs.setFlag(Flag.CY, false);

    shiftLeftArithmeticIndirectHL(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0xfe);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("SRA r", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x8a);
    ctx.regs.setFlag(Flag.CY, false);

    shiftRightArithmeticRegister(ctx, Register.A);

    expect(ctx.regs.read(Register.A)).toBe(0xc5);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("SRA (HL)", ({ ctx }) => {
    ctx.memory.write(0x8ac5, 0x01);
    ctx.regs.writePair(RegisterPair.HL, 0x8ac5);
    ctx.regs.setFlag(Flag.CY, false);

    shiftRightArithmeticIndirectHL(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0x00);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("SRL r", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x01);
    ctx.regs.setFlag(Flag.CY, false);

    shiftRightLogicalRegister(ctx, Register.A);

    expect(ctx.regs.read(Register.A)).toBe(0x00);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("SRL (HL)", ({ ctx }) => {
    ctx.memory.write(0x8ac5, 0xff);
    ctx.regs.writePair(RegisterPair.HL, 0x8ac5);
    ctx.regs.setFlag(Flag.CY, false);

    shiftRightLogicalIndirectHL(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0x7f);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("SWAP r", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x00);
    ctx.regs.setFlag(Flag.CY, false);

    swapNibblesRegister(ctx, Register.A);

    expect(ctx.regs.read(Register.A)).toBe(0x00);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("SWAP (HL)", ({ ctx }) => {
    ctx.memory.write(0x8ac5, 0xf0);
    ctx.regs.writePair(RegisterPair.HL, 0x8ac5);
    ctx.regs.setFlag(Flag.CY, false);

    swapNibblesIndirectHL(ctx);

    expect(ctx.memory.read(0x8ac5)).toBe(0x0f);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
  });

  describe("BIT b, r", () => {
    test("BIT 7, A", ({ ctx }) => {
      ctx.regs.write(Register.A, 0x80);

      testBitRegister(ctx, 7, Register.A);

      expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
      expect(ctx.regs.isFlagSet(Flag.H)).toBe(true);
      expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
    });

    test("BIT 4, L", ({ ctx }) => {
      ctx.regs.write(Register.L, 0xef);

      testBitRegister(ctx, 4, Register.L);

      expect(ctx.regs.isFlagSet(Flag.Z)).toBe(true);
      expect(ctx.regs.isFlagSet(Flag.H)).toBe(true);
      expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
    });
  });

  describe("BIT b, (HL)", () => {
    test("BIT 0, (HL)", ({ ctx }) => {
      ctx.memory.write(0x8ac5, 0xfe);
      ctx.regs.writePair(RegisterPair.HL, 0x8ac5);

      testBitIndirectHL(ctx, 0);

      expect(ctx.regs.isFlagSet(Flag.Z)).toBe(true);
      expect(ctx.regs.isFlagSet(Flag.H)).toBe(true);
      expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
    });

    test("BIT 1, (HL)", ({ ctx }) => {
      ctx.memory.write(0x8ac5, 0xfe);
      ctx.regs.writePair(RegisterPair.HL, 0x8ac5);

      testBitIndirectHL(ctx, 1);

      expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
      expect(ctx.regs.isFlagSet(Flag.H)).toBe(true);
      expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
    });
  });

  describe("RES b, r", () => {
    test("RES 7, A", ({ ctx }) => {
      ctx.regs.write(Register.A, 0x80);

      resetBitRegister(ctx, 7, Register.A);

      expect(ctx.regs.read(Register.A)).toBe(0x00);
    });

    test("RES 1, L", ({ ctx }) => {
      ctx.regs.write(Register.L, 0x3b);

      resetBitRegister(ctx, 1, Register.L);

      expect(ctx.regs.read(Register.L)).toBe(0x39);
    });
  });

  test("RES b, (HL)", ({ ctx }) => {
    ctx.memory.write(0x8ac5, 0xff);
    ctx.regs.writePair(RegisterPair.HL, 0x8ac5);

    resetBitIndirectHL(ctx, 3);

    expect(ctx.memory.read(0x8ac5)).toBe(0xf7);
  });

  describe("SET b, r", () => {
    test("SET 2, A", ({ ctx }) => {
      ctx.regs.write(Register.A, 0x80);

      setBitRegister(ctx, 2, Register.A);

      expect(ctx.regs.read(Register.A)).toBe(0x84);
    });

    test("SET 7, L", ({ ctx }) => {
      ctx.regs.write(Register.L, 0x3b);

      setBitRegister(ctx, 7, Register.L);

      expect(ctx.regs.read(Register.L)).toBe(0xbb);
    });
  });

  test("SET b, (HL)", ({ ctx }) => {
    ctx.memory.write(0x8ac5, 0x00);
    ctx.regs.writePair(RegisterPair.HL, 0x8ac5);

    setBitIndirectHL(ctx, 3);

    expect(ctx.memory.read(0x8ac5)).toBe(0x08);
  });
});
