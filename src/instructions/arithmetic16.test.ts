import { describe, expect, test as baseTest } from "vitest";

import { Flag, RegisterFile, RegisterPair } from "../cpu";
import { Memory } from "../memory";

import {
  addRegisterPair,
  addToStackPointer,
  decrementRegisterPair,
  incrementRegisterPair,
} from "./arithmetic16";
import { InstructionCtx } from "./lib";

const test = baseTest.extend({
  ctx: async ({}, use: (ctx: InstructionCtx) => Promise<void>) => {
    await use({ regs: new RegisterFile(), memory: new Memory() });
  },
});

describe("16-bit arithmetic instructions", () => {
  test("INC rr", ({ ctx }) => {
    ctx.regs.writePair(RegisterPair.DE, 0x235f);

    incrementRegisterPair(ctx, RegisterPair.DE);

    expect(ctx.regs.readPair(RegisterPair.DE)).toBe(0x2360);
  });

  test("DEC rr", ({ ctx }) => {
    ctx.regs.writePair(RegisterPair.DE, 0x235f);

    decrementRegisterPair(ctx, RegisterPair.DE);

    expect(ctx.regs.readPair(RegisterPair.DE)).toBe(0x235e);
  });

  test("ADD HL,rr", ({ ctx }) => {
    ctx.regs.writePair(RegisterPair.HL, 0x8a23);
    ctx.regs.writePair(RegisterPair.BC, 0x0605);

    addRegisterPair(ctx, RegisterPair.BC);

    expect(ctx.regs.readPair(RegisterPair.HL)).toBe(0x9028);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);

    ctx.regs.writePair(RegisterPair.HL, 0x8a23);

    addRegisterPair(ctx, RegisterPair.HL);

    expect(ctx.regs.readPair(RegisterPair.HL)).toBe(0x1446);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(true);
  });

  test("ADD SP,e", ({ ctx }) => {
    ctx.regs.writePair(RegisterPair.SP, 0xfff8);
    ctx.memory.write(0, 0x2);

    addToStackPointer(ctx);

    expect(ctx.regs.readPair(RegisterPair.SP)).toBe(0xfffa);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
  });
});
