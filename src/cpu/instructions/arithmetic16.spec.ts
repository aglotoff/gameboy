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

    incrementRegisterPair.call(state, RegisterPair.DE);

    expect(state.readRegisterPair(RegisterPair.DE)).toBe(0x2360);
  });

  testInstruction("DEC rr", ({ state }) => {
    state.writeRegisterPair(RegisterPair.DE, 0x235f);

    decrementRegisterPair.call(state, RegisterPair.DE);

    expect(state.readRegisterPair(RegisterPair.DE)).toBe(0x235e);
  });

  testInstruction("ADD HL,rr", ({ state }) => {
    state.writeRegisterPair(RegisterPair.HL, 0x8a23);
    state.writeRegisterPair(RegisterPair.BC, 0x0605);

    addRegisterPair.call(state, RegisterPair.BC);

    expect(state.readRegisterPair(RegisterPair.HL)).toBe(0x9028);
    expect(state.isFlagSet(Flag.H)).toBe(true);
    expect(state.isFlagSet(Flag.N)).toBe(false);
    expect(state.isFlagSet(Flag.CY)).toBe(false);

    state.writeRegisterPair(RegisterPair.HL, 0x8a23);

    addRegisterPair.call(state, RegisterPair.HL);

    expect(state.readRegisterPair(RegisterPair.HL)).toBe(0x1446);
    expect(state.isFlagSet(Flag.H)).toBe(true);
    expect(state.isFlagSet(Flag.N)).toBe(false);
    expect(state.isFlagSet(Flag.CY)).toBe(true);
  });

  testInstruction("ADD SP,e", ({ state }) => {
    state.writeRegisterPair(RegisterPair.SP, 0xfff8);
    state.writeBus(0, 0x2);

    addToStackPointer.call(state);

    expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffa);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
  });
});
