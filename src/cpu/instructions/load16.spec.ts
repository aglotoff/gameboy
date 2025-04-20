import { describe, expect } from "vitest";

import { Flag, Register, RegisterPair } from "../register";

import {
  loadDirectFromStackPointer,
  loadHLFromAdjustedStackPointer,
  loadRegisterPair,
  loadStackPointerFromHL,
  popFromStack,
  pushToStack,
} from "./load16";
import { testInstruction } from "./test-lib";

describe("16-bit load instructions", () => {
  testInstruction("LD dd,nn", ({ state }) => {
    state.writeBus(0x00, 0x5b);
    state.writeBus(0x01, 0x3a);

    loadRegisterPair(state, RegisterPair.HL);

    expect(state.getRegister(Register.H)).toBe(0x3a);
    expect(state.getRegister(Register.L)).toBe(0x5b);
    expect(state.getElapsedCycles()).toBe(3);
  });

  testInstruction("LD (nn),SP", ({ state }) => {
    state.setRegisterPair(RegisterPair.SP, 0xfff8);
    state.writeBus(0x00, 0x00);
    state.writeBus(0x01, 0xc1);

    loadDirectFromStackPointer(state);

    expect(state.readBus(0xc100)).toBe(0xf8);
    expect(state.readBus(0xc101)).toBe(0xff);
    expect(state.getElapsedCycles()).toBe(5);
  });

  testInstruction("LD SP,HL", ({ state }) => {
    state.setRegisterPair(RegisterPair.HL, 0x3a5b);

    loadStackPointerFromHL(state);

    expect(state.getRegisterPair(RegisterPair.SP)).toBe(0x3a5b);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("PUSH qq", ({ state }) => {
    state.setRegisterPair(RegisterPair.SP, 0xfffe);
    state.setRegisterPair(RegisterPair.BC, 0x8ac5);

    pushToStack(state, RegisterPair.BC);

    expect(state.readBus(0xfffd)).toBe(0x8a);
    expect(state.readBus(0xfffc)).toBe(0xc5);
    expect(state.getRegisterPair(RegisterPair.SP)).toBe(0xfffc);
    expect(state.getElapsedCycles()).toBe(4);
  });

  testInstruction("POP qq", ({ state }) => {
    state.setRegisterPair(RegisterPair.SP, 0xfffc);
    state.writeBus(0xfffc, 0x5f);
    state.writeBus(0xfffd, 0x3c);

    popFromStack(state, RegisterPair.BC);

    expect(state.getRegisterPair(RegisterPair.BC)).toBe(0x3c5f);
    expect(state.getRegisterPair(RegisterPair.SP)).toBe(0xfffe);
    expect(state.getElapsedCycles()).toBe(3);
  });

  testInstruction("LDHL SP,e", ({ state }) => {
    state.setRegisterPair(RegisterPair.SP, 0xfff8);
    state.writeBus(0x00, 0x2);

    loadHLFromAdjustedStackPointer(state);

    expect(state.getRegisterPair(RegisterPair.HL)).toBe(0xfffa);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(3);
  });
});
