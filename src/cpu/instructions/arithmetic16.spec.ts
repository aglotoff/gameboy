import { describe, expect } from "vitest";

import { Flag, RegisterPair } from "../register";
import {
  addRegisterPair,
  addToStackPointer,
  decrementRegisterPair,
  incrementRegisterPair,
} from "./arithmetic16";
import { testInstruction } from "./test-lib";

describe("16-bit arithmetic instructions", () => {
  testInstruction("INC rr", ({ state }) => {
    state.writeRegisterPair(RegisterPair.DE, 0x235f);

    incrementRegisterPair(state, RegisterPair.DE);

    expect(state.readRegisterPair(RegisterPair.DE)).toBe(0x2360);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("DEC rr", ({ state }) => {
    state.writeRegisterPair(RegisterPair.DE, 0x235f);

    decrementRegisterPair(state, RegisterPair.DE);

    expect(state.readRegisterPair(RegisterPair.DE)).toBe(0x235e);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("ADD HL,rr", ({ state }) => {
    state.writeRegisterPair(RegisterPair.HL, 0x8a23);
    state.writeRegisterPair(RegisterPair.BC, 0x0605);

    addRegisterPair(state, RegisterPair.BC);

    expect(state.readRegisterPair(RegisterPair.HL)).toBe(0x9028);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(2);

    state.writeRegisterPair(RegisterPair.HL, 0x8a23);

    addRegisterPair(state, RegisterPair.HL);

    expect(state.readRegisterPair(RegisterPair.HL)).toBe(0x1446);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getElapsedCycles()).toBe(4);
  });

  testInstruction("ADD SP,e", ({ state }) => {
    state.writeRegisterPair(RegisterPair.SP, 0xfff8);
    state.writeMemory(0, 0x2);

    addToStackPointer(state);

    expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffa);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getElapsedCycles()).toBe(4);
  });
});
