import { describe, expect } from "vitest";

import { Flag, Register, RegisterPair } from "../regs";

import {
  loadDirectFromStackPointer,
  loadHLFromAdjustedStackPointer,
  loadRegisterPair,
  loadStackPointerFromHL,
  popFromStack,
  pushToStack,
} from "./load16";
import { test } from "./test-lib";

describe("16-bit load instructions", () => {
  test("LD dd,nn", ({ cpu, memory }) => {
    memory.write(0x00, 0x5b);
    memory.write(0x01, 0x3a);

    loadRegisterPair({ cpu, memory }, RegisterPair.HL);

    expect(cpu.regs.read(Register.H)).toBe(0x3a);
    expect(cpu.regs.read(Register.L)).toBe(0x5b);
  });

  test("LD (nn),SP", ({ cpu, memory }) => {
    cpu.regs.writePair(RegisterPair.SP, 0xfff8);
    memory.write(0x00, 0x00);
    memory.write(0x01, 0xc1);

    loadDirectFromStackPointer({ cpu, memory });

    expect(memory.read(0xc100)).toBe(0xf8);
    expect(memory.read(0xc101)).toBe(0xff);
  });

  test("LD SP,HL", ({ cpu, memory }) => {
    cpu.regs.writePair(RegisterPair.HL, 0x3a5b);

    loadStackPointerFromHL({ cpu, memory });

    expect(cpu.regs.readPair(RegisterPair.SP)).toBe(0x3a5b);
  });

  test("PUSH qq", ({ cpu, memory }) => {
    cpu.regs.writePair(RegisterPair.SP, 0xfffe);
    cpu.regs.writePair(RegisterPair.BC, 0x8ac5);

    pushToStack({ cpu, memory }, RegisterPair.BC);

    expect(memory.read(0xfffd)).toBe(0x8a);
    expect(memory.read(0xfffc)).toBe(0xc5);
    expect(cpu.regs.readPair(RegisterPair.SP)).toBe(0xfffc);
  });

  test("POP qq", ({ cpu, memory }) => {
    cpu.regs.writePair(RegisterPair.SP, 0xfffc);
    memory.write(0xfffc, 0x5f);
    memory.write(0xfffd, 0x3c);

    popFromStack({ cpu, memory }, RegisterPair.BC);

    expect(cpu.regs.readPair(RegisterPair.BC)).toBe(0x3c5f);
    expect(cpu.regs.readPair(RegisterPair.SP)).toBe(0xfffe);
  });

  test("LDHL SP,e", ({ cpu, memory }) => {
    cpu.regs.writePair(RegisterPair.SP, 0xfff8);
    memory.write(0x00, 0x2);

    loadHLFromAdjustedStackPointer({ cpu, memory });

    expect(cpu.regs.readPair(RegisterPair.HL)).toBe(0xfffa);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
  });
});
