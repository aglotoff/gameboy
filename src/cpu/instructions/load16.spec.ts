import { describe, expect } from "vitest";

import { Flag, Register, RegisterPair } from "../register";
import { testInstruction } from "./test-lib";

import {
  loadDirectFromStackPointer,
  loadHLFromAdjustedStackPointer,
  loadRegisterPair,
  loadStackPointerFromHL,
  popFromStack,
  pushToStack,
} from "./load16";

describe("16-bit load instructions", () => {
  testInstruction("LD dd,nn", ({ ctx }) => {
    ctx.memory.write(0x00, 0x5b);
    ctx.memory.write(0x01, 0x3a);

    loadRegisterPair(ctx, RegisterPair.HL);

    expect(ctx.registers.read(Register.H)).toBe(0x3a);
    expect(ctx.registers.read(Register.L)).toBe(0x5b);
    expect(ctx.state.getElapsedCycles()).toBe(3);
  });

  testInstruction("LD (nn),SP", ({ ctx }) => {
    ctx.registers.writePair(RegisterPair.SP, 0xfff8);
    ctx.memory.write(0x00, 0x00);
    ctx.memory.write(0x01, 0xc1);

    loadDirectFromStackPointer(ctx);

    expect(ctx.memory.read(0xc100)).toBe(0xf8);
    expect(ctx.memory.read(0xc101)).toBe(0xff);
    expect(ctx.state.getElapsedCycles()).toBe(5);
  });

  testInstruction("LD SP,HL", ({ ctx }) => {
    ctx.registers.writePair(RegisterPair.HL, 0x3a5b);

    loadStackPointerFromHL(ctx);

    expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0x3a5b);
    expect(ctx.state.getElapsedCycles()).toBe(2);
  });

  testInstruction("PUSH qq", ({ ctx }) => {
    ctx.registers.writePair(RegisterPair.SP, 0xfffe);
    ctx.registers.writePair(RegisterPair.BC, 0x8ac5);

    pushToStack(ctx, RegisterPair.BC);

    expect(ctx.memory.read(0xfffd)).toBe(0x8a);
    expect(ctx.memory.read(0xfffc)).toBe(0xc5);
    expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffc);
    expect(ctx.state.getElapsedCycles()).toBe(4);
  });

  testInstruction("POP qq", ({ ctx }) => {
    ctx.registers.writePair(RegisterPair.SP, 0xfffc);
    ctx.memory.write(0xfffc, 0x5f);
    ctx.memory.write(0xfffd, 0x3c);

    popFromStack(ctx, RegisterPair.BC);

    expect(ctx.registers.readPair(RegisterPair.BC)).toBe(0x3c5f);
    expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffe);
    expect(ctx.state.getElapsedCycles()).toBe(3);
  });

  testInstruction("LDHL SP,e", ({ ctx }) => {
    ctx.registers.writePair(RegisterPair.SP, 0xfff8);
    ctx.memory.write(0x00, 0x2);

    loadHLFromAdjustedStackPointer(ctx);

    expect(ctx.registers.readPair(RegisterPair.HL)).toBe(0xfffa);
    expect(ctx.registers.getFlag(Flag.Z)).toBe(false);
    expect(ctx.registers.getFlag(Flag.H)).toBe(false);
    expect(ctx.registers.getFlag(Flag.N)).toBe(false);
    expect(ctx.registers.getFlag(Flag.CY)).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(3);
  });
});
