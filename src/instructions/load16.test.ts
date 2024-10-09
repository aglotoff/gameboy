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
import { testInstruction } from "./test-lib";

describe("16-bit load instructions", () => {
  testInstruction("LD dd,nn", ({ state }) => {
    state.writeBus(0x00, 0x5b);
    state.writeBus(0x01, 0x3a);

    loadRegisterPair.call(state, RegisterPair.HL);

    expect(state.readRegister(Register.H)).toBe(0x3a);
    expect(state.readRegister(Register.L)).toBe(0x5b);
  });

  testInstruction("LD (nn),SP", ({ state }) => {
    state.writeRegisterPair(RegisterPair.SP, 0xfff8);
    state.writeBus(0x00, 0x00);
    state.writeBus(0x01, 0xc1);

    loadDirectFromStackPointer.call(state);

    expect(state.readBus(0xc100)).toBe(0xf8);
    expect(state.readBus(0xc101)).toBe(0xff);
  });

  testInstruction("LD SP,HL", ({ state }) => {
    state.writeRegisterPair(RegisterPair.HL, 0x3a5b);

    loadStackPointerFromHL.call(state);

    expect(state.readRegisterPair(RegisterPair.SP)).toBe(0x3a5b);
  });

  testInstruction("PUSH qq", ({ state }) => {
    state.writeRegisterPair(RegisterPair.SP, 0xfffe);
    state.writeRegisterPair(RegisterPair.BC, 0x8ac5);

    pushToStack.call(state, RegisterPair.BC);

    expect(state.readBus(0xfffd)).toBe(0x8a);
    expect(state.readBus(0xfffc)).toBe(0xc5);
    expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffc);
  });

  testInstruction("POP qq", ({ state }) => {
    state.writeRegisterPair(RegisterPair.SP, 0xfffc);
    state.writeBus(0xfffc, 0x5f);
    state.writeBus(0xfffd, 0x3c);

    popFromStack.call(state, RegisterPair.BC);

    expect(state.readRegisterPair(RegisterPair.BC)).toBe(0x3c5f);
    expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffe);
  });

  testInstruction("LDHL SP,e", ({ state }) => {
    state.writeRegisterPair(RegisterPair.SP, 0xfff8);
    state.writeBus(0x00, 0x2);

    loadHLFromAdjustedStackPointer.call(state);

    expect(state.readRegisterPair(RegisterPair.HL)).toBe(0xfffa);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
  });
});
