import { describe, expect, test as baseTest } from "vitest";

import { Flag, Register, RegisterFile, RegisterPair } from "../cpu";
import { Memory } from "../memory";

import {
  loadDirectFromStackPointer,
  loadHLFromAdjustedStackPointer,
  loadRegisterPair,
  loadStackPointerFromHL,
  popFromStack,
  pushToStack,
} from "./load16";
import { InstructionCtx } from "./lib";

const test = baseTest.extend({
  ctx: async ({}, use: (ctx: InstructionCtx) => Promise<void>) => {
    await use({ regs: new RegisterFile(), memory: new Memory() });
  },
});

describe("16-bit load instructions", () => {
  test("LD dd,nn", ({ ctx }) => {
    ctx.memory.write(0x00, 0x5b);
    ctx.memory.write(0x01, 0x3a);

    loadRegisterPair(ctx, RegisterPair.HL);

    expect(ctx.regs.read(Register.H)).toBe(0x3a);
    expect(ctx.regs.read(Register.L)).toBe(0x5b);
  });

  test("LD (nn),SP", ({ ctx }) => {
    ctx.regs.writePair(RegisterPair.SP, 0xfff8);
    ctx.memory.write(0x00, 0x00);
    ctx.memory.write(0x01, 0xc1);

    loadDirectFromStackPointer(ctx);

    expect(ctx.memory.read(0xc100)).toBe(0xf8);
    expect(ctx.memory.read(0xc101)).toBe(0xff);
  });

  test("LD SP,HL", ({ ctx }) => {
    ctx.regs.writePair(RegisterPair.HL, 0x3a5b);

    loadStackPointerFromHL(ctx);

    expect(ctx.regs.readPair(RegisterPair.SP)).toBe(0x3a5b);
  });

  test("PUSH qq", ({ ctx }) => {
    ctx.regs.writePair(RegisterPair.SP, 0xfffe);
    ctx.regs.writePair(RegisterPair.BC, 0x8ac5);

    pushToStack(ctx, RegisterPair.BC);

    expect(ctx.memory.read(0xfffd)).toBe(0x8a);
    expect(ctx.memory.read(0xfffc)).toBe(0xc5);
    expect(ctx.regs.readPair(RegisterPair.SP)).toBe(0xfffc);
  });

  test("POP qq", ({ ctx }) => {
    ctx.regs.writePair(RegisterPair.SP, 0xfffc);
    ctx.memory.write(0xfffc, 0x5f);
    ctx.memory.write(0xfffd, 0x3c);

    popFromStack(ctx, RegisterPair.BC);

    expect(ctx.regs.readPair(RegisterPair.BC)).toBe(0x3c5f);
    expect(ctx.regs.readPair(RegisterPair.SP)).toBe(0xfffe);
  });

  test("LDHL SP,e", ({ ctx }) => {
    ctx.regs.writePair(RegisterPair.SP, 0xfff8);
    ctx.memory.write(0x00, 0x2);

    loadHLFromAdjustedStackPointer(ctx);

    expect(ctx.regs.readPair(RegisterPair.HL)).toBe(0xfffa);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
  });
});
