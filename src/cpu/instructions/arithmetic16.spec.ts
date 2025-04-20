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
    state.setRegisterPair(RegisterPair.DE, 0x235f);

    incrementRegisterPair(state, RegisterPair.DE);

    expect(state.getRegisterPair(RegisterPair.DE)).toBe(0x2360);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("DEC rr", ({ state }) => {
    state.setRegisterPair(RegisterPair.DE, 0x235f);

    decrementRegisterPair(state, RegisterPair.DE);

    expect(state.getRegisterPair(RegisterPair.DE)).toBe(0x235e);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("ADD HL,rr", ({ state }) => {
    state.setRegisterPair(RegisterPair.HL, 0x8a23);
    state.setRegisterPair(RegisterPair.BC, 0x0605);

    addRegisterPair(state, RegisterPair.BC);

    expect(state.getRegisterPair(RegisterPair.HL)).toBe(0x9028);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(2);

    state.setRegisterPair(RegisterPair.HL, 0x8a23);

    addRegisterPair(state, RegisterPair.HL);

    expect(state.getRegisterPair(RegisterPair.HL)).toBe(0x1446);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getElapsedCycles()).toBe(4);
  });

  testInstruction("ADD SP,e", ({ state }) => {
    state.setRegisterPair(RegisterPair.SP, 0xfff8);
    state.writeBus(0, 0x2);

    addToStackPointer(state);

    expect(state.getRegisterPair(RegisterPair.SP)).toBe(0xfffa);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getElapsedCycles()).toBe(4);
  });
});
