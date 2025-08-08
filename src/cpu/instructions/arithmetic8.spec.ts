import { describe, expect } from "vitest";

import { Flag, Register } from "../register";
import { testCpuState } from "../test-lib";

import {
  addImmediateToAccumulator,
  addImmediateToAccumulatorWithCarry,
  addIndirectHLToAccumulator,
  addIndirectHLToAccumulatorWithCarry,
  addRegisterToAccumulator,
  addRegisterToAccumulatorWithCarry,
  andAccumulatorWithImmediate,
  andAccumulatorWithIndirectHL,
  andAccumulatorWithRegister,
  compareAccumulatorToImmediate,
  compareAccumulatorToIndirectHL,
  compareAccumulatorToRegister,
  complementAccumulator,
  complementCarryFlag,
  decimalAdjustAccumulator,
  decrementIndirectHL,
  decrementRegister,
  incrementIndirectHL,
  incrementRegister,
  orAccumulatorWithImmediate,
  orAccumulatorWithIndirectHL,
  orAccumulatorWithRegister,
  setCarryFlag,
  subtractImmediateFromAccumualtor,
  subtractImmediateFromAccumualtorWithCarry,
  subtractIndirectHLFromAccumualtor,
  subtractIndirectHLFromAccumualtorWithCarry,
  subtractRegisterFromAccumualtor,
  subtractRegisterFromAccumualtorWithCarry,
  xorAccumulatorWithImmediate,
  xorAccumulatorWithIndirectHL,
  xorAccumulatorWithRegister,
} from "./arithmetic8";
import { RegisterPair } from "../cpu-state";

describe("8-bit arithmetic and logical instructions", () => {
  testCpuState("ADD A,r8", ({ state }) => {
    state.writeRegister(Register.A, 0x3a);
    state.writeRegister(Register.B, 0xc6);

    addRegisterToAccumulator(state, Register.B);

    expect(state.readRegister(Register.A)).toBe(0);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testCpuState("ADD A,(HL)", ({ state }) => {
    state.writeRegister(Register.A, 0x3c);
    state.writeRegisterPair(RegisterPair.HL, 0x3ab6);
    state.writeMemory(0x3ab6, 0x12);

    addIndirectHLToAccumulator(state);

    expect(state.readRegister(Register.A)).toBe(0x4e);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testCpuState("ADD A,n8", ({ state }) => {
    state.writeRegister(Register.A, 0x3c);
    state.writeMemory(0, 0xff);

    addImmediateToAccumulator(state);

    expect(state.readRegister(Register.A)).toBe(0x3b);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testCpuState("ADC A,r8", ({ state }) => {
    state.writeRegister(Register.A, 0xe1);
    state.writeRegister(Register.E, 0x0f);
    state.setFlag(Flag.CY, true);

    addRegisterToAccumulatorWithCarry(state, Register.E);

    expect(state.readRegister(Register.A)).toBe(0xf1);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testCpuState("ADC A,(HL)", ({ state }) => {
    state.writeRegister(Register.A, 0xe1);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.writeMemory(0x8ac5, 0x1e);
    state.setFlag(Flag.CY, true);

    addIndirectHLToAccumulatorWithCarry(state);

    expect(state.readRegister(Register.A)).toBe(0x00);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testCpuState("ADC A,n8", ({ state }) => {
    state.writeRegister(Register.A, 0xe1);
    state.writeMemory(0, 0x3b);
    state.setFlag(Flag.CY, true);

    addImmediateToAccumulatorWithCarry(state);

    expect(state.readRegister(Register.A)).toBe(0x1d);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testCpuState("SUB A,r8", ({ state }) => {
    state.writeRegister(Register.A, 0x3e);
    state.writeRegister(Register.E, 0x3e);

    subtractRegisterFromAccumualtor(state, Register.E);

    expect(state.readRegister(Register.A)).toBe(0);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(true);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testCpuState("SUB A,(HL)", ({ state }) => {
    state.writeRegister(Register.A, 0x3e);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.writeMemory(0x8ac5, 0x40);

    subtractIndirectHLFromAccumualtor(state);

    expect(state.readRegister(Register.A)).toBe(0xfe);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(true);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testCpuState("SUB A,n8", ({ state }) => {
    state.writeRegister(Register.A, 0x3e);
    state.writeMemory(0, 0x0f);

    subtractImmediateFromAccumualtor(state);

    expect(state.readRegister(Register.A)).toBe(0x2f);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(true);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testCpuState("SBC A,r8", ({ state }) => {
    state.writeRegister(Register.A, 0x3b);
    state.writeRegister(Register.H, 0x2a);
    state.setFlag(Flag.CY, true);

    subtractRegisterFromAccumualtorWithCarry(state, Register.H);

    expect(state.readRegister(Register.A)).toBe(0x10);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(true);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testCpuState("SBC A,(HL)", ({ state }) => {
    state.writeRegister(Register.A, 0x3b);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.writeMemory(0x8ac5, 0x4f);
    state.setFlag(Flag.CY, true);

    subtractIndirectHLFromAccumualtorWithCarry(state);

    expect(state.readRegister(Register.A)).toBe(0xeb);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(true);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testCpuState("SBC A,n8", ({ state }) => {
    state.writeRegister(Register.A, 0x3b);
    state.writeMemory(0, 0x3a);
    state.setFlag(Flag.CY, true);

    subtractImmediateFromAccumualtorWithCarry(state);

    expect(state.readRegister(Register.A)).toBe(0x00);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(true);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testCpuState("CP A,r8", ({ state }) => {
    state.writeRegister(Register.A, 0x3c);
    state.writeRegister(Register.B, 0x2f);

    compareAccumulatorToRegister(state, Register.B);

    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(true);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testCpuState("CP A,(HL)", ({ state }) => {
    state.writeRegister(Register.A, 0x3c);
    state.writeRegisterPair(RegisterPair.HL, 0x3ab6);
    state.writeMemory(0x3ab6, 0x40);

    compareAccumulatorToIndirectHL(state);

    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(true);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testCpuState("CP A,n8", ({ state }) => {
    state.writeRegister(Register.A, 0x3c);
    state.writeMemory(0, 0x3c);

    compareAccumulatorToImmediate(state);

    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(true);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testCpuState("INC r", ({ state }) => {
    state.writeRegister(Register.A, 0xff);

    incrementRegister(state, Register.A);

    expect(state.readRegister(Register.A)).toBe(0x00);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testCpuState("INC (HL)", ({ state }) => {
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.writeMemory(0x8ac5, 0x50);

    incrementIndirectHL(state);

    expect(state.readMemory(state.readRegisterPair(RegisterPair.HL))).toBe(
      0x51
    );
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(3);
  });

  testCpuState("DEC r", ({ state }) => {
    state.writeRegister(Register.L, 0x01);

    decrementRegister(state, Register.L);

    expect(state.readRegister(Register.L)).toBe(0x00);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(true);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testCpuState("DEC (HL)", ({ state }) => {
    state.writeRegisterPair(RegisterPair.HL, 0xff34);
    state.writeMemory(0xff34, 0x00);

    decrementIndirectHL(state);

    expect(state.readMemory(state.readRegisterPair(RegisterPair.HL))).toBe(
      0xff
    );
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(true);
    expect(state.getElapsedCycles()).toBe(3);
  });

  testCpuState("AND A,r8", ({ state }) => {
    state.writeRegister(Register.A, 0x5a);
    state.writeRegister(Register.L, 0x3f);

    andAccumulatorWithRegister(state, Register.L);

    expect(state.readRegister(Register.A)).toBe(0x1a);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testCpuState("AND A,(HL)", ({ state }) => {
    state.writeRegister(Register.A, 0x5a);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.writeMemory(0x8ac5, 0x00);

    andAccumulatorWithIndirectHL(state);

    expect(state.readRegister(Register.A)).toBe(0x00);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testCpuState("AND A,n8", ({ state }) => {
    state.writeRegister(Register.A, 0x5a);
    state.writeMemory(0, 0x38);

    andAccumulatorWithImmediate(state);

    expect(state.readRegister(Register.A)).toBe(0x18);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testCpuState("OR A,r8", ({ state }) => {
    state.writeRegister(Register.A, 0x5a);

    orAccumulatorWithRegister(state, Register.A);

    expect(state.readRegister(Register.A)).toBe(0x5a);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testCpuState("OR A,(HL)", ({ state }) => {
    state.writeRegister(Register.A, 0x5a);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac2);
    state.writeMemory(0x8ac2, 0x0f);

    orAccumulatorWithIndirectHL(state);

    expect(state.readRegister(Register.A)).toBe(0x5f);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testCpuState("OR A,n8", ({ state }) => {
    state.writeRegister(Register.A, 0x5a);
    state.writeMemory(0, 0x3);

    orAccumulatorWithImmediate(state);

    expect(state.readRegister(Register.A)).toBe(0x5b);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testCpuState("XOR A,r8", ({ state }) => {
    state.writeRegister(Register.A, 0xff);

    xorAccumulatorWithRegister(state, Register.A);

    expect(state.readRegister(Register.A)).toBe(0x00);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testCpuState("XOR A,(HL)", ({ state }) => {
    state.writeRegister(Register.A, 0xff);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.writeMemory(0x8ac5, 0x8a);

    xorAccumulatorWithIndirectHL(state);

    expect(state.readRegister(Register.A)).toBe(0x75);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testCpuState("XOR A,n8", ({ state }) => {
    state.writeRegister(Register.A, 0xff);
    state.writeMemory(0, 0xf);

    xorAccumulatorWithImmediate(state);

    expect(state.readRegister(Register.A)).toBe(0xf0);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testCpuState("CCF", ({ state }) => {
    state.setFlag(Flag.CY, true);

    complementCarryFlag(state);

    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);

    complementCarryFlag(state);

    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testCpuState("SCF", ({ state }) => {
    state.setFlag(Flag.CY, false);

    setCarryFlag(state);

    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getElapsedCycles()).toBe(1);

    setCarryFlag(state);

    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testCpuState("DAA", ({ state }) => {
    state.writeRegister(Register.A, 0x45);
    state.writeRegister(Register.B, 0x38);

    addRegisterToAccumulator(state, Register.B);

    expect(state.readRegister(Register.A)).toBe(0x7d);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);

    decimalAdjustAccumulator(state);

    expect(state.readRegister(Register.A)).toBe(0x83);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(2);

    subtractRegisterFromAccumualtor(state, Register.B);

    expect(state.readRegister(Register.A)).toBe(0x4b);
    expect(state.getFlag(Flag.N)).toBe(true);
    expect(state.getElapsedCycles()).toBe(3);

    decimalAdjustAccumulator(state);

    expect(state.readRegister(Register.A)).toBe(0x45);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(4);
  });

  testCpuState("CPL", ({ state }) => {
    state.writeRegister(Register.A, 0x35);

    complementAccumulator(state);

    expect(state.readRegister(Register.A)).toBe(0xca);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(true);
    expect(state.getElapsedCycles()).toBe(1);
  });
});
