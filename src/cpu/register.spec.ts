import { describe, expect, test } from "vitest";
import { Flag, Register, RegisterFile, RegisterPair } from "./register";

export const testRegisters = test.extend({
  registers: async ({}, use: (registers: RegisterFile) => Promise<void>) => {
    await use(new RegisterFile());
  },
});

describe("Register file", () => {
  testRegisters("8-bit registers", ({ registers }) => {
    registers.write(Register.A, 0x24);
    registers.write(Register.B, 0xa0);
    registers.write(Register.C, 0xc6);
    registers.write(Register.D, 0xd3);
    registers.write(Register.E, 0x18);
    registers.write(Register.H, 0x4d);
    registers.write(Register.L, 0xbe);

    expect(registers.read(Register.A)).toBe(0x24);
    expect(registers.read(Register.B)).toBe(0xa0);
    expect(registers.read(Register.C)).toBe(0xc6);
    expect(registers.read(Register.D)).toBe(0xd3);
    expect(registers.read(Register.E)).toBe(0x18);
    expect(registers.read(Register.H)).toBe(0x4d);
    expect(registers.read(Register.L)).toBe(0xbe);
  });

  describe("flags", () => {
    testRegisters("CY", ({ registers }) => {
      registers.setFlag(Flag.CY, true);

      expect(registers.isFlagSet(Flag.CY)).toBe(true);
      expect(registers.isFlagSet(Flag.H)).toBe(false);
      expect(registers.isFlagSet(Flag.N)).toBe(false);
      expect(registers.isFlagSet(Flag.Z)).toBe(false);
    });

    testRegisters("H", ({ registers }) => {
      registers.setFlag(Flag.H, true);

      expect(registers.isFlagSet(Flag.CY)).toBe(false);
      expect(registers.isFlagSet(Flag.H)).toBe(true);
      expect(registers.isFlagSet(Flag.N)).toBe(false);
      expect(registers.isFlagSet(Flag.Z)).toBe(false);
    });

    testRegisters("N", ({ registers }) => {
      registers.setFlag(Flag.N, true);

      expect(registers.isFlagSet(Flag.CY)).toBe(false);
      expect(registers.isFlagSet(Flag.H)).toBe(false);
      expect(registers.isFlagSet(Flag.N)).toBe(true);
      expect(registers.isFlagSet(Flag.Z)).toBe(false);
    });

    testRegisters("Z", ({ registers }) => {
      registers.setFlag(Flag.Z, true);

      expect(registers.isFlagSet(Flag.CY)).toBe(false);
      expect(registers.isFlagSet(Flag.H)).toBe(false);
      expect(registers.isFlagSet(Flag.N)).toBe(false);
      expect(registers.isFlagSet(Flag.Z)).toBe(true);
    });

    testRegisters("reading and writing the F register", ({ registers }) => {
      registers.write(Register.F, 0xde);

      expect(registers.read(Register.F)).toBe(0xd0);
      expect(registers.isFlagSet(Flag.CY)).toBe(true);
      expect(registers.isFlagSet(Flag.H)).toBe(false);
      expect(registers.isFlagSet(Flag.N)).toBe(true);
      expect(registers.isFlagSet(Flag.Z)).toBe(true);

      registers.write(Register.F, 0x33);

      expect(registers.read(Register.F)).toBe(0x30);
      expect(registers.isFlagSet(Flag.CY)).toBe(true);
      expect(registers.isFlagSet(Flag.H)).toBe(true);
      expect(registers.isFlagSet(Flag.N)).toBe(false);
      expect(registers.isFlagSet(Flag.Z)).toBe(false);
    });
  });

  testRegisters("16-bit registers", ({ registers }) => {
    registers.writePair(RegisterPair.AF, 0x2ff3);
    registers.writePair(RegisterPair.BC, 0xce23);
    registers.writePair(RegisterPair.DE, 0xeecf);
    registers.writePair(RegisterPair.HL, 0x38a6);
    registers.writePair(RegisterPair.PC, 0x2af5);
    registers.writePair(RegisterPair.SP, 0x8004);

    expect(registers.readPair(RegisterPair.AF)).toBe(0x2ff0);
    expect(registers.readPair(RegisterPair.BC)).toBe(0xce23);
    expect(registers.readPair(RegisterPair.DE)).toBe(0xeecf);
    expect(registers.readPair(RegisterPair.HL)).toBe(0x38a6);
    expect(registers.readPair(RegisterPair.PC)).toBe(0x2af5);
    expect(registers.readPair(RegisterPair.SP)).toBe(0x8004);
  });

  describe("register pairs", () => {
    testRegisters("AF", ({ registers }) => {
      registers.writePair(RegisterPair.AF, 0xba58);

      expect(registers.read(Register.A)).toBe(0xba);
      expect(registers.read(Register.F)).toBe(0x50);

      registers.write(Register.F, 0xcd);
      expect(registers.readPair(RegisterPair.AF)).toBe(0xbac0);

      registers.write(Register.A, 0x11);
      expect(registers.readPair(RegisterPair.AF)).toBe(0x11c0);
    });

    testRegisters("BC", ({ registers }) => {
      registers.writePair(RegisterPair.BC, 0xac34);

      expect(registers.read(Register.B)).toBe(0xac);
      expect(registers.read(Register.C)).toBe(0x34);

      registers.write(Register.B, 0x1a);
      expect(registers.readPair(RegisterPair.BC)).toBe(0x1a34);

      registers.write(Register.C, 0x22);
      expect(registers.readPair(RegisterPair.BC)).toBe(0x1a22);
    });

    testRegisters("DE", ({ registers }) => {
      registers.writePair(RegisterPair.DE, 0xff80);

      expect(registers.read(Register.D)).toBe(0xff);
      expect(registers.read(Register.E)).toBe(0x80);

      registers.write(Register.E, 0x67);
      expect(registers.readPair(RegisterPair.DE)).toBe(0xff67);

      registers.write(Register.D, 0xce);
      expect(registers.readPair(RegisterPair.DE)).toBe(0xce67);
    });

    testRegisters("HL", ({ registers }) => {
      registers.writePair(RegisterPair.HL, 0xeeec);

      expect(registers.read(Register.H)).toBe(0xee);
      expect(registers.read(Register.L)).toBe(0xec);

      registers.write(Register.H, 0xf8);
      expect(registers.readPair(RegisterPair.HL)).toBe(0xf8ec);

      registers.write(Register.L, 0x98);
      expect(registers.readPair(RegisterPair.HL)).toBe(0xf898);
    });
  });
});
