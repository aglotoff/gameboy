import { describe, expect } from "vitest";

import { Register, RegisterPair } from "../register";
import { getLSB, getMSB } from "../../utils";

import {
  loadIndirectHLFromImmediateData,
  loadRegisterFromImmediate,
  loadRegisterFromRegister,
  loadRegisterFromIndirectHL,
  loadIndirectHLFromRegister,
  loadAccumulatorFromIndirectBC,
  loadAccumulatorFromIndirectDE,
  loadIndirectBCFromAccumulator,
  loadIndirectDEFromAccumulator,
  loadAccumulatorFromDirectWord,
  loadDirectWordFromAccumulator,
  loadAccumulatorFromIndirectC,
  loadIndirectCFromAccumulator,
  loadAccumulatorFromDirectByte,
  loadDirectByteFromAccumulator,
  loadAccumulatorFromIndirectHLDecrement,
  loadAccumulatorFromIndirectHLIncrement,
  loadIndirectHLDecrementFromAccumulator,
  loadIndirectHLIncrementFromAccumulator,
} from "./load8";
import { testInstruction } from "./test-lib";

describe("8-bit load instructions", () => {
  testInstruction("LD r,r'", ({ state }) => {
    state.setRegister(Register.B, 0x3c);
    state.setRegister(Register.D, 0x5c);

    loadRegisterFromRegister(state, Register.A, Register.B);
    loadRegisterFromRegister(state, Register.B, Register.D);

    expect(state.getRegister(Register.A)).toBe(0x3c);
    expect(state.getRegister(Register.B)).toBe(0x5c);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("LD r,n", ({ state }) => {
    state.writeBus(0, 0x24);

    loadRegisterFromImmediate(state, Register.B);

    expect(state.getRegister(Register.B)).toBe(0x24);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("LD r,(HL)", ({ state }) => {
    state.writeBus(0x8ac5, 0x5c);
    state.setRegisterPair(RegisterPair.HL, 0x8ac5);

    loadRegisterFromIndirectHL(state, Register.H);

    expect(state.getRegister(Register.H)).toBe(0x5c);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("LD (HL),r", ({ state }) => {
    state.setRegister(Register.A, 0x3c);
    state.setRegisterPair(RegisterPair.HL, 0x8ac5);

    loadIndirectHLFromRegister(state, Register.A);

    expect(state.readBus(0x8ac5)).toBe(0x3c);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("LD (HL),n", ({ state }) => {
    state.setRegisterPair(RegisterPair.HL, 0x8ac5);
    state.writeBus(0, 0x3c);

    loadIndirectHLFromImmediateData(state);

    expect(state.readBus(0x8ac5)).toBe(0x3c);
    expect(state.getElapsedCycles()).toBe(3);
  });

  testInstruction("LD A,(BC)", ({ state }) => {
    state.setRegisterPair(RegisterPair.BC, 0x8ac5);
    state.writeBus(0x8ac5, 0x2f);

    loadAccumulatorFromIndirectBC(state);

    expect(state.getRegister(Register.A)).toBe(0x2f);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("LD A,(DE)", ({ state }) => {
    state.setRegisterPair(RegisterPair.DE, 0x8ac5);
    state.writeBus(0x8ac5, 0x5f);

    loadAccumulatorFromIndirectDE(state);

    expect(state.getRegister(Register.A)).toBe(0x5f);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("LD (BC),A", ({ state }) => {
    state.setRegisterPair(RegisterPair.BC, 0x205f);
    state.setRegister(Register.A, 0x56);

    loadIndirectBCFromAccumulator(state);

    expect(state.readBus(0x205f)).toBe(0x56);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("LD (DE),A", ({ state }) => {
    state.setRegisterPair(RegisterPair.DE, 0x205c);
    state.setRegister(Register.A, 0xaa);

    loadIndirectDEFromAccumulator(state);

    expect(state.readBus(0x205c)).toBe(0xaa);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("LD A,(nn)", ({ state }) => {
    state.writeBus(0, getLSB(0x8000));
    state.writeBus(1, getMSB(0x8000));
    state.writeBus(0x8000, 0x5c);

    loadAccumulatorFromDirectWord(state);

    expect(state.getRegister(Register.A)).toBe(0x5c);
    expect(state.getElapsedCycles()).toBe(4);
  });

  testInstruction("LD (nn),A", ({ state }) => {
    state.writeBus(0, getLSB(0x8000));
    state.writeBus(1, getMSB(0x8000));
    state.setRegister(Register.A, 0x2f);

    loadDirectWordFromAccumulator(state);

    expect(state.readBus(0x8000)).toBe(0x2f);
    expect(state.getElapsedCycles()).toBe(4);
  });

  testInstruction("LD A,(C)", ({ state }) => {
    state.writeBus(0xff95, 0x2c);
    state.setRegister(Register.C, 0x95);

    loadAccumulatorFromIndirectC(state);

    expect(state.getRegister(Register.A)).toBe(0x2c);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("LD (C),A", ({ state }) => {
    state.setRegister(Register.A, 0x5c);
    state.setRegister(Register.C, 0x9f);

    loadIndirectCFromAccumulator(state);

    expect(state.readBus(0xff9f)).toBe(0x5c);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("LD A,(n)", ({ state }) => {
    state.writeBus(0, getLSB(0x34));
    state.writeBus(0xff34, 0x5f);

    loadAccumulatorFromDirectByte(state);

    expect(state.getRegister(Register.A)).toBe(0x5f);
    expect(state.getElapsedCycles()).toBe(3);
  });

  testInstruction("LD (n),A", ({ state }) => {
    state.writeBus(0, getLSB(0x34));
    state.setRegister(Register.A, 0x2f);

    loadDirectByteFromAccumulator(state);

    expect(state.readBus(0xff34)).toBe(0x2f);
    expect(state.getElapsedCycles()).toBe(3);
  });

  testInstruction("LD A,(HLD)", ({ state }) => {
    state.setRegisterPair(RegisterPair.HL, 0x8a5c);
    state.writeBus(0x8a5c, 0x3c);

    loadAccumulatorFromIndirectHLDecrement(state);

    expect(state.getRegister(Register.A)).toBe(0x3c);
    expect(state.getRegisterPair(RegisterPair.HL)).toBe(0x8a5b);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("LD A,(HLI)", ({ state }) => {
    state.setRegisterPair(RegisterPair.HL, 0x1ff);
    state.writeBus(0x1ff, 0x56);

    loadAccumulatorFromIndirectHLIncrement(state);

    expect(state.getRegister(Register.A)).toBe(0x56);
    expect(state.getRegisterPair(RegisterPair.HL)).toBe(0x200);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("LD (HLD),A", ({ state }) => {
    state.setRegisterPair(RegisterPair.HL, 0x4000);
    state.setRegister(Register.A, 0x5);

    loadIndirectHLDecrementFromAccumulator(state);

    expect(state.readBus(0x4000)).toBe(0x5);
    expect(state.getRegisterPair(RegisterPair.HL)).toBe(0x3fff);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("LD (HLI),A", ({ state }) => {
    state.setRegisterPair(RegisterPair.HL, 0xffff);
    state.setRegister(Register.A, 0x56);

    loadIndirectHLIncrementFromAccumulator(state);

    expect(state.readBus(0xffff)).toBe(0x56);
    expect(state.getRegisterPair(RegisterPair.HL)).toBe(0x0000);
    expect(state.getElapsedCycles()).toBe(2);
  });
});
