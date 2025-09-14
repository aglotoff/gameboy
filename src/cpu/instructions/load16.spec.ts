import { describe, expect } from "vitest";

import { Flag, Register, RegisterPair } from "../register";
import { testCpuState } from "../test-lib";

import {
  loadDirectFromStackPointer,
  loadHLFromAdjustedStackPointer,
  loadRegisterPair,
  loadStackPointerFromHL,
  popFromStack,
  pushToStack,
} from "./load16";

describe("16-bit load instructions", () => {
  testCpuState("LD dd,nn", ({ ctx, onCycle }) => {
    ctx.writeMemory(0x00, 0x5b);
    ctx.writeMemory(0x01, 0x3a);

    loadRegisterPair(ctx, RegisterPair.HL);

    expect(ctx.readRegister(Register.H)).toBe(0x3a);
    expect(ctx.readRegister(Register.L)).toBe(0x5b);
    expect(onCycle).toBeCalledTimes(3);
  });

  testCpuState("LD (nn),SP", ({ ctx, onCycle }) => {
    ctx.writeRegisterPair(RegisterPair.SP, 0xfff8);
    ctx.writeMemory(0x00, 0x00);
    ctx.writeMemory(0x01, 0xc1);

    loadDirectFromStackPointer(ctx);

    expect(ctx.readMemory(0xc100)).toBe(0xf8);
    expect(ctx.readMemory(0xc101)).toBe(0xff);
    expect(onCycle).toBeCalledTimes(5);
  });

  testCpuState("LD SP,HL", ({ ctx, onCycle }) => {
    ctx.writeRegisterPair(RegisterPair.HL, 0x3a5b);

    loadStackPointerFromHL(ctx);

    expect(ctx.readRegisterPair(RegisterPair.SP)).toBe(0x3a5b);
    expect(onCycle).toBeCalledTimes(2);
  });

  testCpuState("PUSH qq", ({ ctx, onCycle }) => {
    ctx.writeRegisterPair(RegisterPair.SP, 0xfffe);
    ctx.writeRegisterPair(RegisterPair.BC, 0x8ac5);

    pushToStack(ctx, RegisterPair.BC);

    expect(ctx.readMemory(0xfffd)).toBe(0x8a);
    expect(ctx.readMemory(0xfffc)).toBe(0xc5);
    expect(ctx.readRegisterPair(RegisterPair.SP)).toBe(0xfffc);
    expect(onCycle).toBeCalledTimes(4);
  });

  testCpuState("POP qq", ({ ctx, onCycle }) => {
    ctx.writeRegisterPair(RegisterPair.SP, 0xfffc);
    ctx.writeMemory(0xfffc, 0x5f);
    ctx.writeMemory(0xfffd, 0x3c);

    popFromStack(ctx, RegisterPair.BC);

    expect(ctx.readRegisterPair(RegisterPair.BC)).toBe(0x3c5f);
    expect(ctx.readRegisterPair(RegisterPair.SP)).toBe(0xfffe);
    expect(onCycle).toBeCalledTimes(3);
  });

  testCpuState("LDHL SP,e", ({ ctx, onCycle }) => {
    ctx.writeRegisterPair(RegisterPair.SP, 0xfff8);
    ctx.writeMemory(0x00, 0x2);

    loadHLFromAdjustedStackPointer(ctx);

    expect(ctx.readRegisterPair(RegisterPair.HL)).toBe(0xfffa);
    expect(ctx.getFlag(Flag.Z)).toBe(false);
    expect(ctx.getFlag(Flag.H)).toBe(false);
    expect(ctx.getFlag(Flag.N)).toBe(false);
    expect(ctx.getFlag(Flag.CY)).toBe(false);
    expect(onCycle).toBeCalledTimes(3);
  });
});
