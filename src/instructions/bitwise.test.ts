import { describe, expect, test as baseTest } from "vitest";

import { Flag, InterruptFlags, Register, RegisterFile } from "../cpu";
import { Memory } from "../memory";

import { InstructionCtx } from "./lib";
import {
  rotateLeftCircularAccumulator,
  rotateRightCircularAccumulator,
  rotateLeftAccumulator,
  rotateRightAccumulator,
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
});
