import { describe, expect } from "vitest";

import { Flag, RegisterPair } from "../register";
import { testCpuState } from "../test-lib";

import {
  addRegisterPair,
  addOffsetToStackPointer,
  decrementRegisterPair,
  incrementRegisterPair,
} from "./arithmetic16";

describe("16-bit arithmetic instructions", () => {
  testCpuState("INC rr", ({ ctx, onCycle }) => {
    ctx.writeRegisterPair(RegisterPair.DE, 0x235f);

    incrementRegisterPair(ctx, RegisterPair.DE);

    expect(ctx.readRegisterPair(RegisterPair.DE)).toBe(0x2360);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("DEC rr", ({ ctx, onCycle }) => {
    ctx.writeRegisterPair(RegisterPair.DE, 0x235f);

    decrementRegisterPair(ctx, RegisterPair.DE);

    expect(ctx.readRegisterPair(RegisterPair.DE)).toBe(0x235e);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("ADD HL,rr", ({ ctx, onCycle }) => {
    ctx.writeRegisterPair(RegisterPair.HL, 0x8a23);
    ctx.writeRegisterPair(RegisterPair.BC, 0x0605);

    addRegisterPair(ctx, RegisterPair.BC);

    expect(ctx.readRegisterPair(RegisterPair.HL)).toBe(0x9028);
    expect(ctx.getFlag(Flag.H)).toBe(true);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(2);

    ctx.writeRegisterPair(RegisterPair.HL, 0x8a23);

    addRegisterPair(ctx, RegisterPair.HL);

    expect(ctx.readRegisterPair(RegisterPair.HL)).toBe(0x1446);
    expect(ctx.getFlag(Flag.H)).toBe(true);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(ctx.getFlag(Flag.CY)).toBe(true);
    expect(onCycle).toBeCalledTimes(4);
  });

  testCpuState("ADD SP,e8", ({ ctx, onCycle }) => {
    ctx.writeRegisterPair(RegisterPair.SP, 0xfff8);
    ctx.writeMemory(0, 0x2);

    addOffsetToStackPointer(ctx);

    expect(ctx.readRegisterPair(RegisterPair.SP)).toBe(0xfffa);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(onCycle).toBeCalledTimes(4);
  });
});
