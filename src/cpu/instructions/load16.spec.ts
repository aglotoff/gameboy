import { describe, expect } from "vitest";

import { Flag, Register } from "../register";
import { testCpuState } from "../test-lib";

import {
  loadDirectFromStackPointer,
  loadHLFromAdjustedStackPointer,
  loadRegisterPair,
  loadStackPointerFromHL,
  popFromStack,
  pushToStack,
} from "./load16";
import { RegisterPair } from "../cpu-state";

describe("16-bit load instructions", () => {
  testCpuState("LD dd,nn", ({ state }) => {
    state.writeMemory(0x00, 0x5b);
    state.writeMemory(0x01, 0x3a);

    loadRegisterPair(state, RegisterPair.HL);

    expect(state.readRegister(Register.H)).toBe(0x3a);
    expect(state.readRegister(Register.L)).toBe(0x5b);
    expect(state.getElapsedCycles()).toBe(3);
  });

  testCpuState("LD (nn),SP", ({ state }) => {
    state.writeRegisterPair(RegisterPair.SP, 0xfff8);
    state.writeMemory(0x00, 0x00);
    state.writeMemory(0x01, 0xc1);

    loadDirectFromStackPointer(state);

    expect(state.readMemory(0xc100)).toBe(0xf8);
    expect(state.readMemory(0xc101)).toBe(0xff);
    expect(state.getElapsedCycles()).toBe(5);
  });

  testCpuState("LD SP,HL", ({ state }) => {
    state.writeRegisterPair(RegisterPair.HL, 0x3a5b);

    loadStackPointerFromHL(state);

    expect(state.readRegisterPair(RegisterPair.SP)).toBe(0x3a5b);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testCpuState("PUSH qq", ({ state }) => {
    state.writeRegisterPair(RegisterPair.SP, 0xfffe);
    state.writeRegisterPair(RegisterPair.BC, 0x8ac5);

    pushToStack(state, RegisterPair.BC);

    expect(state.readMemory(0xfffd)).toBe(0x8a);
    expect(state.readMemory(0xfffc)).toBe(0xc5);
    expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffc);
    expect(state.getElapsedCycles()).toBe(4);
  });

  testCpuState("POP qq", ({ state }) => {
    state.writeRegisterPair(RegisterPair.SP, 0xfffc);
    state.writeMemory(0xfffc, 0x5f);
    state.writeMemory(0xfffd, 0x3c);

    popFromStack(state, RegisterPair.BC);

    expect(state.readRegisterPair(RegisterPair.BC)).toBe(0x3c5f);
    expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffe);
    expect(state.getElapsedCycles()).toBe(3);
  });

  testCpuState("LDHL SP,e", ({ state }) => {
    state.writeRegisterPair(RegisterPair.SP, 0xfff8);
    state.writeMemory(0x00, 0x2);

    loadHLFromAdjustedStackPointer(state);

    expect(state.readRegisterPair(RegisterPair.HL)).toBe(0xfffa);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(3);
  });
});
