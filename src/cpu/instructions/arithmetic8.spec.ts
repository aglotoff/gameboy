import { describe, expect } from "vitest";

import { Flag, Register, RegisterPair } from "../register";
import {
  addImmediate,
  addImmediateWithCarry,
  addIndirectHL,
  addIndirectHLWithCarry,
  addRegister,
  addRegisterWithCarry,
  andImmediate,
  andIndirectHL,
  andRegister,
  compareImmediate,
  compareIndirectHL,
  compareRegister,
  complementAccumulator,
  complementCarryFlag,
  decimalAdjustAccumulator,
  decrementIndirectHL,
  decrementRegister,
  incrementIndirectHL,
  incrementRegister,
  orImmediate,
  orIndirectHL,
  orRegister,
  setCarryFlag,
  subtractImmediate,
  subtractImmediateWithCarry,
  subtractIndirectHL,
  subtractIndirectHLWithCarry,
  subtractRegister,
  subtractRegisterWithCarry,
  xorImmediate,
  xorIndirectHL,
  xorRegister,
} from "./arithmetic8";
import { testInstruction } from "./test-lib";

describe("8-bit arithmetic and logical instructions", () => {
  testInstruction("ADD A,r", ({ state }) => {
    state.writeRegister(Register.A, 0x3a);
    state.writeRegister(Register.B, 0xc6);

    addRegister(state, Register.B);

    expect(state.readRegister(Register.A)).toBe(0);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testInstruction("ADD A,(HL)", ({ state }) => {
    state.writeRegister(Register.A, 0x3c);
    state.writeRegisterPair(RegisterPair.HL, 0x3ab6);
    state.writeMemory(0x3ab6, 0x12);

    addIndirectHL(state);

    expect(state.readRegister(Register.A)).toBe(0x4e);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("ADD A,n", ({ state }) => {
    state.writeRegister(Register.A, 0x3c);
    state.writeMemory(0, 0xff);

    addImmediate(state);

    expect(state.readRegister(Register.A)).toBe(0x3b);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("ADC A,r", ({ state }) => {
    state.writeRegister(Register.A, 0xe1);
    state.writeRegister(Register.E, 0x0f);
    state.setFlag(Flag.CY, true);

    addRegisterWithCarry(state, Register.E);

    expect(state.readRegister(Register.A)).toBe(0xf1);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testInstruction("ADC A,(HL)", ({ state }) => {
    state.writeRegister(Register.A, 0xe1);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.writeMemory(0x8ac5, 0x1e);
    state.setFlag(Flag.CY, true);

    addIndirectHLWithCarry(state);

    expect(state.readRegister(Register.A)).toBe(0x00);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("ADC A,n", ({ state }) => {
    state.writeRegister(Register.A, 0xe1);
    state.writeMemory(0, 0x3b);
    state.setFlag(Flag.CY, true);

    addImmediateWithCarry(state);

    expect(state.readRegister(Register.A)).toBe(0x1d);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("SUB r", ({ state }) => {
    state.writeRegister(Register.A, 0x3e);
    state.writeRegister(Register.E, 0x3e);

    subtractRegister(state, Register.E);

    expect(state.readRegister(Register.A)).toBe(0);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(true);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testInstruction("SUB (HL)", ({ state }) => {
    state.writeRegister(Register.A, 0x3e);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.writeMemory(0x8ac5, 0x40);

    subtractIndirectHL(state);

    expect(state.readRegister(Register.A)).toBe(0xfe);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(true);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("SUB n", ({ state }) => {
    state.writeRegister(Register.A, 0x3e);
    state.writeMemory(0, 0x0f);

    subtractImmediate(state);

    expect(state.readRegister(Register.A)).toBe(0x2f);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(true);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("SBC A,r", ({ state }) => {
    state.writeRegister(Register.A, 0x3b);
    state.writeRegister(Register.H, 0x2a);
    state.setFlag(Flag.CY, true);

    subtractRegisterWithCarry(state, Register.H);

    expect(state.readRegister(Register.A)).toBe(0x10);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(true);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testInstruction("SBC A,(HL)", ({ state }) => {
    state.writeRegister(Register.A, 0x3b);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.writeMemory(0x8ac5, 0x4f);
    state.setFlag(Flag.CY, true);

    subtractIndirectHLWithCarry(state);

    expect(state.readRegister(Register.A)).toBe(0xeb);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(true);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("SBC A,n", ({ state }) => {
    state.writeRegister(Register.A, 0x3b);
    state.writeMemory(0, 0x3a);
    state.setFlag(Flag.CY, true);

    subtractImmediateWithCarry(state);

    expect(state.readRegister(Register.A)).toBe(0x00);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(true);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("CP r", ({ state }) => {
    state.writeRegister(Register.A, 0x3c);
    state.writeRegister(Register.B, 0x2f);

    compareRegister(state, Register.B);

    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(true);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testInstruction("CP (HL)", ({ state }) => {
    state.writeRegister(Register.A, 0x3c);
    state.writeRegisterPair(RegisterPair.HL, 0x3ab6);
    state.writeMemory(0x3ab6, 0x40);

    compareIndirectHL(state);

    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(true);
    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("CP n", ({ state }) => {
    state.writeRegister(Register.A, 0x3c);
    state.writeMemory(0, 0x3c);

    compareImmediate(state);

    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(true);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("INC r", ({ state }) => {
    state.writeRegister(Register.A, 0xff);

    incrementRegister(state, Register.A);

    expect(state.readRegister(Register.A)).toBe(0x00);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testInstruction("INC (HL)", ({ state }) => {
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

  testInstruction("DEC r", ({ state }) => {
    state.writeRegister(Register.L, 0x01);

    decrementRegister(state, Register.L);

    expect(state.readRegister(Register.L)).toBe(0x00);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(true);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testInstruction("DEC (HL)", ({ state }) => {
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

  testInstruction("AND r", ({ state }) => {
    state.writeRegister(Register.A, 0x5a);
    state.writeRegister(Register.L, 0x3f);

    andRegister(state, Register.L);

    expect(state.readRegister(Register.A)).toBe(0x1a);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testInstruction("AND (HL)", ({ state }) => {
    state.writeRegister(Register.A, 0x5a);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.writeMemory(0x8ac5, 0x00);

    andIndirectHL(state);

    expect(state.readRegister(Register.A)).toBe(0x00);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("AND n", ({ state }) => {
    state.writeRegister(Register.A, 0x5a);
    state.writeMemory(0, 0x38);

    andImmediate(state);

    expect(state.readRegister(Register.A)).toBe(0x18);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("OR r", ({ state }) => {
    state.writeRegister(Register.A, 0x5a);

    orRegister(state, Register.A);

    expect(state.readRegister(Register.A)).toBe(0x5a);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testInstruction("OR (HL)", ({ state }) => {
    state.writeRegister(Register.A, 0x5a);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac2);
    state.writeMemory(0x8ac2, 0x0f);

    orIndirectHL(state);

    expect(state.readRegister(Register.A)).toBe(0x5f);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("OR n", ({ state }) => {
    state.writeRegister(Register.A, 0x5a);
    state.writeMemory(0, 0x3);

    orImmediate(state);

    expect(state.readRegister(Register.A)).toBe(0x5b);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("XOR r", ({ state }) => {
    state.writeRegister(Register.A, 0xff);

    xorRegister(state, Register.A);

    expect(state.readRegister(Register.A)).toBe(0x00);
    expect(state.getFlag(Flag.Z)).toBe(true);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testInstruction("XOR (HL)", ({ state }) => {
    state.writeRegister(Register.A, 0xff);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.writeMemory(0x8ac5, 0x8a);

    xorIndirectHL(state);

    expect(state.readRegister(Register.A)).toBe(0x75);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("XOR n", ({ state }) => {
    state.writeRegister(Register.A, 0xff);
    state.writeMemory(0, 0xf);

    xorImmediate(state);

    expect(state.readRegister(Register.A)).toBe(0xf0);
    expect(state.getFlag(Flag.Z)).toBe(false);
    expect(state.getFlag(Flag.H)).toBe(false);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("CCF", ({ state }) => {
    state.setFlag(Flag.CY, true);

    complementCarryFlag(state);

    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);

    complementCarryFlag(state);

    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("SCF", ({ state }) => {
    state.setFlag(Flag.CY, false);

    setCarryFlag(state);

    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getElapsedCycles()).toBe(1);

    setCarryFlag(state);

    expect(state.getFlag(Flag.CY)).toBe(true);
    expect(state.getElapsedCycles()).toBe(2);
  });

  testInstruction("DAA", ({ state }) => {
    state.writeRegister(Register.A, 0x45);
    state.writeRegister(Register.B, 0x38);

    addRegister(state, Register.B);

    expect(state.readRegister(Register.A)).toBe(0x7d);
    expect(state.getFlag(Flag.N)).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);

    decimalAdjustAccumulator(state);

    expect(state.readRegister(Register.A)).toBe(0x83);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(2);

    subtractRegister(state, Register.B);

    expect(state.readRegister(Register.A)).toBe(0x4b);
    expect(state.getFlag(Flag.N)).toBe(true);
    expect(state.getElapsedCycles()).toBe(3);

    decimalAdjustAccumulator(state);

    expect(state.readRegister(Register.A)).toBe(0x45);
    expect(state.getFlag(Flag.CY)).toBe(false);
    expect(state.getElapsedCycles()).toBe(4);
  });

  testInstruction("CPL", ({ state }) => {
    state.writeRegister(Register.A, 0x35);

    complementAccumulator(state);

    expect(state.readRegister(Register.A)).toBe(0xca);
    expect(state.getFlag(Flag.H)).toBe(true);
    expect(state.getFlag(Flag.N)).toBe(true);
    expect(state.getElapsedCycles()).toBe(1);
  });
});
