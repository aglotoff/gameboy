import { describe, expect } from "vitest";

import { Flag, RegisterPair } from "../regs";
import {
  addRegisterPair,
  addToStackPointer,
  decrementRegisterPair,
  incrementRegisterPair,
} from "./arithmetic16";
import { test } from "./test-lib";

describe("16-bit arithmetic instructions", () => {
  test("INC rr", ({ cpu, memory }) => {
    cpu.regs.writePair(RegisterPair.DE, 0x235f);

    incrementRegisterPair({ cpu, memory }, RegisterPair.DE);

    expect(cpu.regs.readPair(RegisterPair.DE)).toBe(0x2360);
  });

  test("DEC rr", ({ cpu, memory }) => {
    cpu.regs.writePair(RegisterPair.DE, 0x235f);

    decrementRegisterPair({ cpu, memory }, RegisterPair.DE);

    expect(cpu.regs.readPair(RegisterPair.DE)).toBe(0x235e);
  });

  test("ADD HL,rr", ({ cpu, memory }) => {
    cpu.regs.writePair(RegisterPair.HL, 0x8a23);
    cpu.regs.writePair(RegisterPair.BC, 0x0605);

    addRegisterPair({ cpu, memory }, RegisterPair.BC);

    expect(cpu.regs.readPair(RegisterPair.HL)).toBe(0x9028);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);

    cpu.regs.writePair(RegisterPair.HL, 0x8a23);

    addRegisterPair({ cpu, memory }, RegisterPair.HL);

    expect(cpu.regs.readPair(RegisterPair.HL)).toBe(0x1446);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(true);
  });

  test("ADD SP,e", ({ cpu, memory }) => {
    cpu.regs.writePair(RegisterPair.SP, 0xfff8);
    memory.write(0, 0x2);

    addToStackPointer({ cpu, memory });

    expect(cpu.regs.readPair(RegisterPair.SP)).toBe(0xfffa);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
  });
});
