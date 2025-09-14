import { describe, expect, test } from "vitest";
import {
  Flag,
  getHighRegisterOfPair,
  getLowRegisterOfPair,
  Register,
  RegisterFile,
  RegisterPair,
} from "./register";

const testRegisters = test.extend({
  registers: async ({}, use: (registers: RegisterFile) => void) => {
    await use(new RegisterFile());
  },
});

describe("Register file", () => {
  testRegisters("8-bit registers", ({ registers }) => {
    registers.writeRegister(Register.A, 0x24);
    registers.writeRegister(Register.B, 0xa0);
    registers.writeRegister(Register.C, 0xc6);
    registers.writeRegister(Register.D, 0xd3);
    registers.writeRegister(Register.E, 0x18);
    registers.writeRegister(Register.H, 0x4d);
    registers.writeRegister(Register.L, 0xbe);

    expect(registers.readRegister(Register.A)).toBe(0x24);
    expect(registers.readRegister(Register.B)).toBe(0xa0);
    expect(registers.readRegister(Register.C)).toBe(0xc6);
    expect(registers.readRegister(Register.D)).toBe(0xd3);
    expect(registers.readRegister(Register.E)).toBe(0x18);
    expect(registers.readRegister(Register.H)).toBe(0x4d);
    expect(registers.readRegister(Register.L)).toBe(0xbe);
  });

  describe("flags", () => {
    testRegisters("CY", ({ registers }) => {
      registers.setFlag(Flag.CY, true);

      expect(registers.getFlag(Flag.CY)).toBe(true);
      expect(registers.getFlag(Flag.H)).toBe(false);
      expect(registers.getFlag(Flag.N)).toBe(false);
      expect(registers.getFlag(Flag.Z)).toBe(false);
    });

    testRegisters("H", ({ registers }) => {
      registers.setFlag(Flag.H, true);

      expect(registers.getFlag(Flag.CY)).toBe(false);
      expect(registers.getFlag(Flag.H)).toBe(true);
      expect(registers.getFlag(Flag.N)).toBe(false);
      expect(registers.getFlag(Flag.Z)).toBe(false);
    });

    testRegisters("N", ({ registers }) => {
      registers.setFlag(Flag.N, true);

      expect(registers.getFlag(Flag.CY)).toBe(false);
      expect(registers.getFlag(Flag.H)).toBe(false);
      expect(registers.getFlag(Flag.N)).toBe(true);
      expect(registers.getFlag(Flag.Z)).toBe(false);
    });

    testRegisters("Z", ({ registers }) => {
      registers.setFlag(Flag.Z, true);

      expect(registers.getFlag(Flag.CY)).toBe(false);
      expect(registers.getFlag(Flag.H)).toBe(false);
      expect(registers.getFlag(Flag.N)).toBe(false);
      expect(registers.getFlag(Flag.Z)).toBe(true);
    });

    testRegisters("reading and writing the F register", ({ registers }) => {
      registers.writeRegister(Register.F, 0xde);

      expect(registers.readRegister(Register.F)).toBe(0xd0);
      expect(registers.getFlag(Flag.CY)).toBe(true);
      expect(registers.getFlag(Flag.H)).toBe(false);
      expect(registers.getFlag(Flag.N)).toBe(true);
      expect(registers.getFlag(Flag.Z)).toBe(true);

      registers.writeRegister(Register.F, 0x33);

      expect(registers.readRegister(Register.F)).toBe(0x30);
      expect(registers.getFlag(Flag.CY)).toBe(true);
      expect(registers.getFlag(Flag.H)).toBe(true);
      expect(registers.getFlag(Flag.N)).toBe(false);
      expect(registers.getFlag(Flag.Z)).toBe(false);
    });

    testRegisters("16-bit registers", ({ registers }) => {
      registers.writeRegisterPair(RegisterPair.AF, 0x2ff3);
      registers.writeRegisterPair(RegisterPair.BC, 0xce23);
      registers.writeRegisterPair(RegisterPair.DE, 0xeecf);
      registers.writeRegisterPair(RegisterPair.HL, 0x38a6);
      registers.writeRegisterPair(RegisterPair.PC, 0x2af5);
      registers.writeRegisterPair(RegisterPair.SP, 0x8004);

      expect(registers.readRegisterPair(RegisterPair.AF)).toBe(0x2ff0);
      expect(registers.readRegisterPair(RegisterPair.BC)).toBe(0xce23);
      expect(registers.readRegisterPair(RegisterPair.DE)).toBe(0xeecf);
      expect(registers.readRegisterPair(RegisterPair.HL)).toBe(0x38a6);
      expect(registers.readRegisterPair(RegisterPair.PC)).toBe(0x2af5);
      expect(registers.readRegisterPair(RegisterPair.SP)).toBe(0x8004);
    });
  });

  describe("register pairs", () => {
    testRegisters("AF", ({ registers }) => {
      registers.writeRegisterPair(RegisterPair.AF, 0xba58);

      expect(registers.readRegister(Register.A)).toBe(0xba);
      expect(registers.readRegister(Register.F)).toBe(0x50);

      registers.writeRegister(Register.F, 0xcd);
      expect(registers.readRegisterPair(RegisterPair.AF)).toBe(0xbac0);

      registers.writeRegister(Register.A, 0x11);
      expect(registers.readRegisterPair(RegisterPair.AF)).toBe(0x11c0);
    });

    testRegisters("BC", ({ registers }) => {
      registers.writeRegisterPair(RegisterPair.BC, 0xac34);

      expect(registers.readRegister(Register.B)).toBe(0xac);
      expect(registers.readRegister(Register.C)).toBe(0x34);

      registers.writeRegister(Register.B, 0x1a);
      expect(registers.readRegisterPair(RegisterPair.BC)).toBe(0x1a34);

      registers.writeRegister(Register.C, 0x22);
      expect(registers.readRegisterPair(RegisterPair.BC)).toBe(0x1a22);
    });

    testRegisters("DE", ({ registers }) => {
      registers.writeRegisterPair(RegisterPair.DE, 0xff80);

      expect(registers.readRegister(Register.D)).toBe(0xff);
      expect(registers.readRegister(Register.E)).toBe(0x80);

      registers.writeRegister(Register.E, 0x67);
      expect(registers.readRegisterPair(RegisterPair.DE)).toBe(0xff67);

      registers.writeRegister(Register.D, 0xce);
      expect(registers.readRegisterPair(RegisterPair.DE)).toBe(0xce67);
    });

    testRegisters("HL", ({ registers }) => {
      registers.writeRegisterPair(RegisterPair.HL, 0xeeec);

      expect(registers.readRegister(Register.H)).toBe(0xee);
      expect(registers.readRegister(Register.L)).toBe(0xec);

      registers.writeRegister(Register.H, 0xf8);
      expect(registers.readRegisterPair(RegisterPair.HL)).toBe(0xf8ec);

      registers.writeRegister(Register.L, 0x98);
      expect(registers.readRegisterPair(RegisterPair.HL)).toBe(0xf898);
    });

    testRegisters("SP", ({ registers }) => {
      registers.writeRegisterPair(RegisterPair.SP, 0x21ac);

      expect(registers.readRegister(Register.SP_H)).toBe(0x21);
      expect(registers.readRegister(Register.SP_L)).toBe(0xac);

      registers.writeRegister(Register.SP_H, 0xf0);
      expect(registers.readRegisterPair(RegisterPair.SP)).toBe(0xf0ac);

      registers.writeRegister(Register.SP_L, 0x92);
      expect(registers.readRegisterPair(RegisterPair.SP)).toBe(0xf092);
    });

    testRegisters("PC", ({ registers }) => {
      registers.writeRegisterPair(RegisterPair.PC, 0x51a8);

      expect(registers.readRegister(Register.PC_H)).toBe(0x51);
      expect(registers.readRegister(Register.PC_L)).toBe(0xa8);

      registers.writeRegister(Register.PC_H, 0xc8);
      expect(registers.readRegisterPair(RegisterPair.PC)).toBe(0xc8a8);

      registers.writeRegister(Register.PC_L, 0xa2);
      expect(registers.readRegisterPair(RegisterPair.PC)).toBe(0xc8a2);
    });
  });

  describe("register pair helpers", () => {
    test("getHighRegisterOfPair", () => {
      expect(getHighRegisterOfPair(RegisterPair.AF)).toBe(Register.A);
      expect(getHighRegisterOfPair(RegisterPair.BC)).toBe(Register.B);
      expect(getHighRegisterOfPair(RegisterPair.DE)).toBe(Register.D);
      expect(getHighRegisterOfPair(RegisterPair.HL)).toBe(Register.H);
      expect(getHighRegisterOfPair(RegisterPair.PC)).toBe(Register.PC_H);
      expect(getHighRegisterOfPair(RegisterPair.SP)).toBe(Register.SP_H);
    });

    test("getLowRegisterOfPair", () => {
      expect(getLowRegisterOfPair(RegisterPair.AF)).toBe(Register.F);
      expect(getLowRegisterOfPair(RegisterPair.BC)).toBe(Register.C);
      expect(getLowRegisterOfPair(RegisterPair.DE)).toBe(Register.E);
      expect(getLowRegisterOfPair(RegisterPair.HL)).toBe(Register.L);
      expect(getLowRegisterOfPair(RegisterPair.PC)).toBe(Register.PC_L);
      expect(getLowRegisterOfPair(RegisterPair.SP)).toBe(Register.SP_L);
    });
  });
});
