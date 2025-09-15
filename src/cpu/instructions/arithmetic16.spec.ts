import { describe, expect } from "vitest";

import { Flag, RegisterPair } from "../register";
import { testInstructions } from "../test-lib";

import {
  addRegisterPair,
  addOffsetToStackPointer,
  decrementRegisterPair,
  incrementRegisterPair,
} from "./arithmetic16";

describe("16-bit arithmetic instructions", () => {
  testInstructions("INC rr", ({ ctx, onCycle }) => {
    ctx.registers.writePair(RegisterPair.DE, 0x235f);

    incrementRegisterPair(ctx, RegisterPair.DE);

    expect(ctx.registers.readPair(RegisterPair.DE)).toBe(0x2360);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("DEC rr", ({ ctx, onCycle }) => {
    ctx.registers.writePair(RegisterPair.DE, 0x235f);

    decrementRegisterPair(ctx, RegisterPair.DE);

    expect(ctx.registers.readPair(RegisterPair.DE)).toBe(0x235e);
    expect(onCycle).toBeCalledTimes(2);
  });

  testInstructions("ADD HL,rr", ({ ctx, onCycle }) => {
    ctx.registers.writePair(RegisterPair.HL, 0x8a23);
    ctx.registers.writePair(RegisterPair.BC, 0x0605);

    addRegisterPair(ctx, RegisterPair.BC);

    expect(ctx.registers.readPair(RegisterPair.HL)).toBe(0x9028);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(2);

    ctx.registers.writePair(RegisterPair.HL, 0x8a23);

    addRegisterPair(ctx, RegisterPair.HL);

    expect(ctx.registers.readPair(RegisterPair.HL)).toBe(0x1446);
    expect(ctx.registers.getFlag(Flag.H)).toBe(true);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(true);
    expect(onCycle).toBeCalledTimes(4);
  });

  testInstructions("ADD SP,e8", ({ ctx, onCycle }) => {
    ctx.registers.writePair(RegisterPair.SP, 0xfff8);
    ctx.memory.write(0, 0x2);

    addOffsetToStackPointer(ctx);

    expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffa);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(onCycle).toBeCalledTimes(4);
  });
});
