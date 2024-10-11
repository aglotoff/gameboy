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

    addRegister.call(state, Register.B);

    expect(state.readRegister(Register.A)).toBe(0);
    expect(state.isFlagSet(Flag.Z)).toBe(true);
    expect(state.isFlagSet(Flag.H)).toBe(true);
    expect(state.isFlagSet(Flag.N)).toBe(false);
    expect(state.isFlagSet(Flag.CY)).toBe(true);
  });

  testInstruction("ADD A,(HL)", ({ state }) => {
    state.writeRegister(Register.A, 0x3c);
    state.writeRegisterPair(RegisterPair.HL, 0x3ab6);
    state.writeBus(0x3ab6, 0x12);

    addIndirectHL.call(state);

    expect(state.readRegister(Register.A)).toBe(0x4e);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
  });

  testInstruction("ADD A,n", ({ state }) => {
    state.writeRegister(Register.A, 0x3c);
    state.writeBus(0, 0xff);

    addImmediate.call(state);

    expect(state.readRegister(Register.A)).toBe(0x3b);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(true);
    expect(state.isFlagSet(Flag.N)).toBe(false);
    expect(state.isFlagSet(Flag.CY)).toBe(true);
  });

  testInstruction("ADC A,r", ({ state }) => {
    state.writeRegister(Register.A, 0xe1);
    state.writeRegister(Register.E, 0x0f);
    state.setFlag(Flag.CY, true);

    addRegisterWithCarry.call(state, Register.E);

    expect(state.readRegister(Register.A)).toBe(0xf1);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(true);
    expect(state.isFlagSet(Flag.N)).toBe(false);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
  });

  testInstruction("ADC A,(HL)", ({ state }) => {
    state.writeRegister(Register.A, 0xe1);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.writeBus(0x8ac5, 0x1e);
    state.setFlag(Flag.CY, true);

    addIndirectHLWithCarry.call(state);

    expect(state.readRegister(Register.A)).toBe(0x00);
    expect(state.isFlagSet(Flag.Z)).toBe(true);
    expect(state.isFlagSet(Flag.H)).toBe(true);
    expect(state.isFlagSet(Flag.N)).toBe(false);
    expect(state.isFlagSet(Flag.CY)).toBe(true);
  });

  testInstruction("ADC A,n", ({ state }) => {
    state.writeRegister(Register.A, 0xe1);
    state.writeBus(0, 0x3b);
    state.setFlag(Flag.CY, true);

    addImmediateWithCarry.call(state);

    expect(state.readRegister(Register.A)).toBe(0x1d);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
    expect(state.isFlagSet(Flag.CY)).toBe(true);
  });

  testInstruction("SUB r", ({ state }) => {
    state.writeRegister(Register.A, 0x3e);
    state.writeRegister(Register.E, 0x3e);

    subtractRegister.call(state, Register.E);

    expect(state.readRegister(Register.A)).toBe(0);
    expect(state.isFlagSet(Flag.Z)).toBe(true);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(true);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
  });

  testInstruction("SUB (HL)", ({ state }) => {
    state.writeRegister(Register.A, 0x3e);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.writeBus(0x8ac5, 0x40);

    subtractIndirectHL.call(state);

    expect(state.readRegister(Register.A)).toBe(0xfe);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(true);
    expect(state.isFlagSet(Flag.CY)).toBe(true);
  });

  testInstruction("SUB n", ({ state }) => {
    state.writeRegister(Register.A, 0x3e);
    state.writeBus(0, 0x0f);

    subtractImmediate.call(state);

    expect(state.readRegister(Register.A)).toBe(0x2f);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(true);
    expect(state.isFlagSet(Flag.N)).toBe(true);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
  });

  testInstruction("SBC A,r", ({ state }) => {
    state.writeRegister(Register.A, 0x3b);
    state.writeRegister(Register.H, 0x2a);
    state.setFlag(Flag.CY, true);

    subtractRegisterWithCarry.call(state, Register.H);

    expect(state.readRegister(Register.A)).toBe(0x10);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(true);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
  });

  testInstruction("SBC A,(HL)", ({ state }) => {
    state.writeRegister(Register.A, 0x3b);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.writeBus(0x8ac5, 0x4f);
    state.setFlag(Flag.CY, true);

    subtractIndirectHLWithCarry.call(state);

    expect(state.readRegister(Register.A)).toBe(0xeb);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(true);
    expect(state.isFlagSet(Flag.N)).toBe(true);
    expect(state.isFlagSet(Flag.CY)).toBe(true);
  });

  testInstruction("SBC A,n", ({ state }) => {
    state.writeRegister(Register.A, 0x3b);
    state.writeBus(0, 0x3a);
    state.setFlag(Flag.CY, true);

    subtractImmediateWithCarry.call(state);

    expect(state.readRegister(Register.A)).toBe(0x00);
    expect(state.isFlagSet(Flag.Z)).toBe(true);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(true);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
  });

  testInstruction("CP r", ({ state }) => {
    state.writeRegister(Register.A, 0x3c);
    state.writeRegister(Register.B, 0x2f);

    compareRegister.call(state, Register.B);

    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(true);
    expect(state.isFlagSet(Flag.N)).toBe(true);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
  });

  testInstruction("CP (HL)", ({ state }) => {
    state.writeRegister(Register.A, 0x3c);
    state.writeRegisterPair(RegisterPair.HL, 0x3ab6);
    state.writeBus(0x3ab6, 0x40);

    compareIndirectHL.call(state);

    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(true);
    expect(state.isFlagSet(Flag.CY)).toBe(true);
  });

  testInstruction("CP n", ({ state }) => {
    state.writeRegister(Register.A, 0x3c);
    state.writeBus(0, 0x3c);

    compareImmediate.call(state);

    expect(state.isFlagSet(Flag.Z)).toBe(true);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(true);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
  });

  testInstruction("INC r", ({ state }) => {
    state.writeRegister(Register.A, 0xff);

    incrementRegister.call(state, Register.A);

    expect(state.readRegister(Register.A)).toBe(0x00);
    expect(state.isFlagSet(Flag.Z)).toBe(true);
    expect(state.isFlagSet(Flag.H)).toBe(true);
    expect(state.isFlagSet(Flag.N)).toBe(false);
  });

  testInstruction("INC (HL)", ({ state }) => {
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.writeBus(0x8ac5, 0x50);

    incrementIndirectHL.call(state);

    expect(state.readBus(state.readRegisterPair(RegisterPair.HL))).toBe(0x51);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
  });

  testInstruction("DEC r", ({ state }) => {
    state.writeRegister(Register.L, 0x01);

    decrementRegister.call(state, Register.L);

    expect(state.readRegister(Register.L)).toBe(0x00);
    expect(state.isFlagSet(Flag.Z)).toBe(true);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(true);
  });

  testInstruction("DEC (HL)", ({ state }) => {
    state.writeRegisterPair(RegisterPair.HL, 0xff34);
    state.writeBus(0xff34, 0x00);

    decrementIndirectHL.call(state);

    expect(state.readBus(state.readRegisterPair(RegisterPair.HL))).toBe(0xff);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(true);
    expect(state.isFlagSet(Flag.N)).toBe(true);
  });

  testInstruction("AND r", ({ state }) => {
    state.writeRegister(Register.A, 0x5a);
    state.writeRegister(Register.L, 0x3f);

    andRegister.call(state, Register.L);

    expect(state.readRegister(Register.A)).toBe(0x1a);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(true);
    expect(state.isFlagSet(Flag.N)).toBe(false);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
  });

  testInstruction("AND (HL)", ({ state }) => {
    state.writeRegister(Register.A, 0x5a);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.writeBus(0x8ac5, 0x00);

    andIndirectHL.call(state);

    expect(state.readRegister(Register.A)).toBe(0x00);
    expect(state.isFlagSet(Flag.Z)).toBe(true);
    expect(state.isFlagSet(Flag.H)).toBe(true);
    expect(state.isFlagSet(Flag.N)).toBe(false);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
  });

  testInstruction("AND n", ({ state }) => {
    state.writeRegister(Register.A, 0x5a);
    state.writeBus(0, 0x38);

    andImmediate.call(state);

    expect(state.readRegister(Register.A)).toBe(0x18);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(true);
    expect(state.isFlagSet(Flag.N)).toBe(false);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
  });

  testInstruction("OR r", ({ state }) => {
    state.writeRegister(Register.A, 0x5a);

    orRegister.call(state, Register.A);

    expect(state.readRegister(Register.A)).toBe(0x5a);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
  });

  testInstruction("OR (HL)", ({ state }) => {
    state.writeRegister(Register.A, 0x5a);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac2);
    state.writeBus(0x8ac2, 0x0f);

    orIndirectHL.call(state);

    expect(state.readRegister(Register.A)).toBe(0x5f);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
  });

  testInstruction("OR n", ({ state }) => {
    state.writeRegister(Register.A, 0x5a);
    state.writeBus(0, 0x3);

    orImmediate.call(state);

    expect(state.readRegister(Register.A)).toBe(0x5b);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
  });

  testInstruction("XOR r", ({ state }) => {
    state.writeRegister(Register.A, 0xff);

    xorRegister.call(state, Register.A);

    expect(state.readRegister(Register.A)).toBe(0x00);
    expect(state.isFlagSet(Flag.Z)).toBe(true);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
  });

  testInstruction("XOR (HL)", ({ state }) => {
    state.writeRegister(Register.A, 0xff);
    state.writeRegisterPair(RegisterPair.HL, 0x8ac5);
    state.writeBus(0x8ac5, 0x8a);

    xorIndirectHL.call(state);

    expect(state.readRegister(Register.A)).toBe(0x75);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
  });

  testInstruction("XOR n", ({ state }) => {
    state.writeRegister(Register.A, 0xff);
    state.writeBus(0, 0xf);

    xorImmediate.call(state);

    expect(state.readRegister(Register.A)).toBe(0xf0);
    expect(state.isFlagSet(Flag.Z)).toBe(false);
    expect(state.isFlagSet(Flag.H)).toBe(false);
    expect(state.isFlagSet(Flag.N)).toBe(false);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
  });

  testInstruction("CCF", ({ state }) => {
    state.setFlag(Flag.CY, true);

    complementCarryFlag.call(state);

    expect(state.isFlagSet(Flag.CY)).toBe(false);

    complementCarryFlag.call(state);

    expect(state.isFlagSet(Flag.CY)).toBe(true);
  });

  testInstruction("SCF", ({ state }) => {
    state.setFlag(Flag.CY, false);

    setCarryFlag.call(state);

    expect(state.isFlagSet(Flag.CY)).toBe(true);

    setCarryFlag.call(state);

    expect(state.isFlagSet(Flag.CY)).toBe(true);
  });

  testInstruction("DAA", ({ state }) => {
    state.writeRegister(Register.A, 0x45);
    state.writeRegister(Register.B, 0x38);

    addRegister.call(state, Register.B);

    expect(state.readRegister(Register.A)).toBe(0x7d);
    expect(state.isFlagSet(Flag.N)).toBe(false);

    decimalAdjustAccumulator.call(state);

    expect(state.readRegister(Register.A)).toBe(0x83);
    expect(state.isFlagSet(Flag.CY)).toBe(false);

    subtractRegister.call(state, Register.B);

    expect(state.readRegister(Register.A)).toBe(0x4b);
    expect(state.isFlagSet(Flag.N)).toBe(true);

    decimalAdjustAccumulator.call(state);

    expect(state.readRegister(Register.A)).toBe(0x45);
    expect(state.isFlagSet(Flag.CY)).toBe(false);
  });

  testInstruction("CPL", ({ state }) => {
    state.writeRegister(Register.A, 0x35);

    complementAccumulator.call(state);

    expect(state.readRegister(Register.A)).toBe(0xca);
    expect(state.isFlagSet(Flag.H)).toBe(true);
    expect(state.isFlagSet(Flag.N)).toBe(true);
  });
});
