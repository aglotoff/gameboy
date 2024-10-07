import { describe, expect } from "vitest";

import { Register, RegisterPair } from "../regs";
import { getLSB, getMSB } from "../utils";

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
    state.writeRegister(Register.B, 0x3c);
    state.writeRegister(Register.D, 0x5c);

    loadRegisterFromRegister(state, Register.A, Register.B);
    loadRegisterFromRegister(state, Register.B, Register.D);

    expect(state.readRegister(Register.A)).toBe(0x3c);
    expect(state.readRegister(Register.B)).toBe(0x5c);
  });

  testInstruction("LD r,n", ({ state }) => {
    state.writeBus(0, 0x24);

    loadRegisterFromImmediate(state, Register.B);

    expect(state.readRegister(Register.B)).toBe(0x24);
  });

  testInstruction("LD r,(HL)", ({ state }) => {
    state.writeBus(0x8ac5, 0x5c);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);

    loadRegisterFromIndirectHL(state, Register.H);

    expect(state.readRegister(Register.H)).toBe(0x5c);
  });

  testInstruction("LD (HL),r", ({ state }) => {
    state.writeRegister(Register.A, 0x3c);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);

    loadIndirectHLFromRegister(state, Register.A);

    expect(state.readBus(0x8ac5)).toBe(0x3c);
  });

  testInstruction("LD (HL),n", ({ state }) => {
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.writeBus(0, 0x3c);

    loadIndirectHLFromImmediateData(state);

    expect(state.readBus(0x8ac5)).toBe(0x3c);
  });

  testInstruction("LD A,(BC)", ({ state }) => {
    state.writeRegisterPair(RegisterPair.BC, 0x8ac5);
    state.writeBus(0x8ac5, 0x2f);

    loadAccumulatorFromIndirectBC(state);

    expect(state.readRegister(Register.A)).toBe(0x2f);
  });

  testInstruction("LD A,(DE)", ({ state }) => {
    state.writeRegisterPair(RegisterPair.DE, 0x8ac5);
    state.writeBus(0x8ac5, 0x5f);

    loadAccumulatorFromIndirectDE(state);

    expect(state.readRegister(Register.A)).toBe(0x5f);
  });

  testInstruction("LD (BC),A", ({ state }) => {
    state.writeRegisterPair(RegisterPair.BC, 0x205f);
    state.writeRegister(Register.A, 0x56);

    loadIndirectBCFromAccumulator(state);

    expect(state.readBus(0x205f)).toBe(0x56);
  });

  testInstruction("LD (DE),A", ({ state }) => {
    state.writeRegisterPair(RegisterPair.DE, 0x205c);
    state.writeRegister(Register.A, 0xaa);

    loadIndirectDEFromAccumulator(state);

    expect(state.readBus(0x205c)).toBe(0xaa);
  });

  testInstruction("LD A,(nn)", ({ state }) => {
    state.writeBus(0, getLSB(0x8000));
    state.writeBus(1, getMSB(0x8000));
    state.writeBus(0x8000, 0x5c);

    loadAccumulatorFromDirectWord(state);

    expect(state.readRegister(Register.A)).toBe(0x5c);
  });

  testInstruction("LD (nn),A", ({ state }) => {
    state.writeBus(0, getLSB(0x8000));
    state.writeBus(1, getMSB(0x8000));
    state.writeRegister(Register.A, 0x2f);

    loadDirectWordFromAccumulator(state);

    expect(state.readBus(0x8000)).toBe(0x2f);
  });

  testInstruction("LD A,(C)", ({ state }) => {
    state.writeBus(0xff95, 0x2c);
    state.writeRegister(Register.C, 0x95);

    loadAccumulatorFromIndirectC(state);

    expect(state.readRegister(Register.A)).toBe(0x2c);
  });

  testInstruction("LD (C),A", ({ state }) => {
    state.writeRegister(Register.A, 0x5c);
    state.writeRegister(Register.C, 0x9f);

    loadIndirectCFromAccumulator(state);

    expect(state.readBus(0xff9f)).toBe(0x5c);
  });

  testInstruction("LD A,(n)", ({ state }) => {
    state.writeBus(0, getLSB(0x34));
    state.writeBus(0xff34, 0x5f);

    loadAccumulatorFromDirectByte(state);

    expect(state.readRegister(Register.A)).toBe(0x5f);
  });

  testInstruction("LD (n),A", ({ state }) => {
    state.writeBus(0, getLSB(0x34));
    state.writeRegister(Register.A, 0x2f);

    loadDirectByteFromAccumulator(state);

    expect(state.readBus(0xff34)).toBe(0x2f);
  });

  testInstruction("LD A,(HLD)", ({ state }) => {
    state.writeRegisterPair(RegisterPair.HL, 0x8a5c);
    state.writeBus(0x8a5c, 0x3c);

    loadAccumulatorFromIndirectHLDecrement(state);

    expect(state.readRegister(Register.A)).toBe(0x3c);
    expect(state.readRegisterPair(RegisterPair.HL)).toBe(0x8a5b);
  });

  testInstruction("LD A,(HLI)", ({ state }) => {
    state.writeRegisterPair(RegisterPair.HL, 0x1ff);
    state.writeBus(0x1ff, 0x56);

    loadAccumulatorFromIndirectHLIncrement(state);

    expect(state.readRegister(Register.A)).toBe(0x56);
    expect(state.readRegisterPair(RegisterPair.HL)).toBe(0x200);
  });

  testInstruction("LD (HLD),A", ({ state }) => {
    state.writeRegisterPair(RegisterPair.HL, 0x4000);
    state.writeRegister(Register.A, 0x5);

    loadIndirectHLDecrementFromAccumulator(state);

    expect(state.readBus(0x4000)).toBe(0x5);
    expect(state.readRegisterPair(RegisterPair.HL)).toBe(0x3fff);
  });

  testInstruction("LD (HLI),A", ({ state }) => {
    state.writeRegisterPair(RegisterPair.HL, 0xffff);
    state.writeRegister(Register.A, 0x56);

    loadIndirectHLIncrementFromAccumulator(state);

    expect(state.readBus(0xffff)).toBe(0x56);
    expect(state.readRegisterPair(RegisterPair.HL)).toBe(0x0000);
  });
});
