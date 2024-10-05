import { describe, expect } from "vitest";

import { Flag, Register, RegisterPair } from "../regs";
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
import { test } from "./test-lib";

describe("8-bit arithmetic and logical instructions", () => {
  test("ADD A,r", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x3a);
    cpu.regs.write(Register.B, 0xc6);

    addRegister({ cpu, memory }, Register.B);

    expect(cpu.regs.read(Register.A)).toBe(0);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(true);
  });

  test("ADD A,(HL)", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x3c);
    cpu.regs.writePair(RegisterPair.HL, 0x3ab6);
    memory.write(0x3ab6, 0x12);

    addIndirectHL({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0x4e);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("ADD A,n", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x3c);
    memory.write(0, 0xff);

    addImmediate({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0x3b);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(true);
  });

  test("ADC A,r", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0xe1);
    cpu.regs.write(Register.E, 0x0f);
    cpu.regs.setFlag(Flag.CY, true);

    addRegisterWithCarry({ cpu, memory }, Register.E);

    expect(cpu.regs.read(Register.A)).toBe(0xf1);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("ADC A,(HL)", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0xe1);
    cpu.regs.writePair(RegisterPair.HL, 0x8ac5);
    memory.write(0x8ac5, 0x1e);
    cpu.regs.setFlag(Flag.CY, true);

    addIndirectHLWithCarry({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0x00);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(true);
  });

  test("ADC A,n", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0xe1);
    memory.write(0, 0x3b);
    cpu.regs.setFlag(Flag.CY, true);

    addImmediateWithCarry({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0x1d);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(true);
  });

  test("SUB r", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x3e);
    cpu.regs.write(Register.E, 0x3e);

    subtractRegister({ cpu, memory }, Register.E);

    expect(cpu.regs.read(Register.A)).toBe(0);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("SUB (HL)", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x3e);
    cpu.regs.writePair(RegisterPair.HL, 0x8ac5);
    memory.write(0x8ac5, 0x40);

    subtractIndirectHL({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0xfe);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(true);
  });

  test("SUB n", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x3e);
    memory.write(0, 0x0f);

    subtractImmediate({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0x2f);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("SBC A,r", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x3b);
    cpu.regs.write(Register.H, 0x2a);
    cpu.regs.setFlag(Flag.CY, true);

    subtractRegisterWithCarry({ cpu, memory }, Register.H);

    expect(cpu.regs.read(Register.A)).toBe(0x10);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("SBC A,(HL)", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x3b);
    cpu.regs.writePair(RegisterPair.HL, 0x8ac5);
    memory.write(0x8ac5, 0x4f);
    cpu.regs.setFlag(Flag.CY, true);

    subtractIndirectHLWithCarry({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0xeb);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(true);
  });

  test("SBC A,n", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x3b);
    memory.write(0, 0x3a);
    cpu.regs.setFlag(Flag.CY, true);

    subtractImmediateWithCarry({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0x00);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("CP r", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x3c);
    cpu.regs.write(Register.B, 0x2f);

    compareRegister({ cpu, memory }, Register.B);

    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("CP (HL)", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x3c);
    cpu.regs.writePair(RegisterPair.HL, 0x3ab6);
    memory.write(0x3ab6, 0x40);

    compareIndirectHL({ cpu, memory });

    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(true);
  });

  test("CP n", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x3c);
    memory.write(0, 0x3c);

    compareImmediate({ cpu, memory });

    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("INC r", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0xff);

    incrementRegister({ cpu, memory }, Register.A);

    expect(cpu.regs.read(Register.A)).toBe(0x00);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("INC (HL)", ({ cpu, memory }) => {
    cpu.regs.writePair(RegisterPair.HL, 0x8ac5);
    memory.write(0x8ac5, 0x50);

    incrementIndirectHL({ cpu, memory });

    expect(memory.read(cpu.regs.readPair(RegisterPair.HL))).toBe(0x51);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("DEC r", ({ cpu, memory }) => {
    cpu.regs.write(Register.L, 0x01);

    decrementRegister({ cpu, memory }, Register.L);

    expect(cpu.regs.read(Register.L)).toBe(0x00);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(true);
  });

  test("DEC (HL)", ({ cpu, memory }) => {
    cpu.regs.writePair(RegisterPair.HL, 0xff34);
    memory.write(0xff34, 0x00);

    decrementIndirectHL({ cpu, memory });

    expect(memory.read(cpu.regs.readPair(RegisterPair.HL))).toBe(0xff);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(true);
  });

  test("AND r", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x5a);
    cpu.regs.write(Register.L, 0x3f);

    andRegister({ cpu, memory }, Register.L);

    expect(cpu.regs.read(Register.A)).toBe(0x1a);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("AND (HL)", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x5a);
    cpu.regs.writePair(RegisterPair.HL, 0x8ac5);
    memory.write(0x8ac5, 0x00);

    andIndirectHL({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0x00);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("AND n", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x5a);
    memory.write(0, 0x38);

    andImmediate({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0x18);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("OR r", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x5a);

    orRegister({ cpu, memory }, Register.A);

    expect(cpu.regs.read(Register.A)).toBe(0x5a);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("OR (HL)", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x5a);
    cpu.regs.writePair(RegisterPair.HL, 0x8ac2);
    memory.write(0x8ac2, 0x0f);

    orIndirectHL({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0x5f);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("OR n", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x5a);
    memory.write(0, 0x3);

    orImmediate({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0x5b);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("XOR r", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0xff);

    xorRegister({ cpu, memory }, Register.A);

    expect(cpu.regs.read(Register.A)).toBe(0x00);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("XOR (HL)", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0xff);
    cpu.regs.writePair(RegisterPair.HL, 0x8ac5);
    memory.write(0x8ac5, 0x8a);

    xorIndirectHL({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0x75);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("XOR n", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0xff);
    memory.write(0, 0xf);

    xorImmediate({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0xf0);
    expect(cpu.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("CCF", ({ cpu, memory }) => {
    cpu.regs.setFlag(Flag.CY, true);

    complementCarryFlag({ cpu, memory });

    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);

    complementCarryFlag({ cpu, memory });

    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(true);
  });

  test("SCF", ({ cpu, memory }) => {
    cpu.regs.setFlag(Flag.CY, false);

    setCarryFlag({ cpu, memory });

    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(true);

    setCarryFlag({ cpu, memory });

    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(true);
  });

  test("DAA", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x45);
    cpu.regs.write(Register.B, 0x38);

    addRegister({ cpu, memory }, Register.B);

    expect(cpu.regs.read(Register.A)).toBe(0x7d);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(false);

    decimalAdjustAccumulator({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0x83);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);

    subtractRegister({ cpu, memory }, Register.B);

    expect(cpu.regs.read(Register.A)).toBe(0x4b);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(true);

    decimalAdjustAccumulator({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0x45);
    expect(cpu.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("CPL", ({ cpu, memory }) => {
    cpu.regs.write(Register.A, 0x35);

    complementAccumulator({ cpu, memory });

    expect(cpu.regs.read(Register.A)).toBe(0xca);
    expect(cpu.regs.isFlagSet(Flag.H)).toBe(true);
    expect(cpu.regs.isFlagSet(Flag.N)).toBe(true);
  });
});
