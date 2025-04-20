import { describe, expect, test } from "vitest";
import {
  Flag,
  highRegister,
  lowRegister,
  Register,
  RegisterFile,
  RegisterPair,
} from "./register";

export const testRegisters = test.extend({
  registers: async ({}, use: (registers: RegisterFile) => Promise<void>) => {
    await use(new RegisterFile());
  },
});

describe("Register file", () => {
  testRegisters("8-bit registers", ({ registers }) => {
    registers.setRegister(Register.A, 0x24);
    registers.setRegister(Register.B, 0xa0);
    registers.setRegister(Register.C, 0xc6);
    registers.setRegister(Register.D, 0xd3);
    registers.setRegister(Register.E, 0x18);
    registers.setRegister(Register.H, 0x4d);
    registers.setRegister(Register.L, 0xbe);

    expect(registers.getRegister(Register.A)).toBe(0x24);
    expect(registers.getRegister(Register.B)).toBe(0xa0);
    expect(registers.getRegister(Register.C)).toBe(0xc6);
    expect(registers.getRegister(Register.D)).toBe(0xd3);
    expect(registers.getRegister(Register.E)).toBe(0x18);
    expect(registers.getRegister(Register.H)).toBe(0x4d);
    expect(registers.getRegister(Register.L)).toBe(0xbe);
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
      registers.setRegister(Register.F, 0xde);

      expect(registers.getRegister(Register.F)).toBe(0xd0);
      expect(registers.getFlag(Flag.CY)).toBe(true);
      expect(registers.getFlag(Flag.H)).toBe(false);
      expect(registers.getFlag(Flag.N)).toBe(true);
      expect(registers.getFlag(Flag.Z)).toBe(true);

      registers.setRegister(Register.F, 0x33);

      expect(registers.getRegister(Register.F)).toBe(0x30);
      expect(registers.getFlag(Flag.CY)).toBe(true);
      expect(registers.getFlag(Flag.H)).toBe(true);
      expect(registers.getFlag(Flag.N)).toBe(false);
      expect(registers.getFlag(Flag.Z)).toBe(false);
    });
  });

  testRegisters("16-bit registers", ({ registers }) => {
    registers.setRegisterPair(RegisterPair.AF, 0x2ff3);
    registers.setRegisterPair(RegisterPair.BC, 0xce23);
    registers.setRegisterPair(RegisterPair.DE, 0xeecf);
    registers.setRegisterPair(RegisterPair.HL, 0x38a6);
    registers.setRegisterPair(RegisterPair.PC, 0x2af5);
    registers.setRegisterPair(RegisterPair.SP, 0x8004);

    expect(registers.getRegisterPair(RegisterPair.AF)).toBe(0x2ff0);
    expect(registers.getRegisterPair(RegisterPair.BC)).toBe(0xce23);
    expect(registers.getRegisterPair(RegisterPair.DE)).toBe(0xeecf);
    expect(registers.getRegisterPair(RegisterPair.HL)).toBe(0x38a6);
    expect(registers.getRegisterPair(RegisterPair.PC)).toBe(0x2af5);
    expect(registers.getRegisterPair(RegisterPair.SP)).toBe(0x8004);
  });

  describe("register pairs", () => {
    testRegisters("AF", ({ registers }) => {
      expect(highRegister(RegisterPair.AF)).toBe(Register.A);
      expect(lowRegister(RegisterPair.AF)).toBe(Register.F);

      registers.setRegisterPair(RegisterPair.AF, 0xba58);

      expect(registers.getRegister(Register.A)).toBe(0xba);
      expect(registers.getRegister(Register.F)).toBe(0x50);

      registers.setRegister(Register.F, 0xcd);
      expect(registers.getRegisterPair(RegisterPair.AF)).toBe(0xbac0);

      registers.setRegister(Register.A, 0x11);
      expect(registers.getRegisterPair(RegisterPair.AF)).toBe(0x11c0);
    });

    testRegisters("BC", ({ registers }) => {
      expect(highRegister(RegisterPair.BC)).toBe(Register.B);
      expect(lowRegister(RegisterPair.BC)).toBe(Register.C);

      registers.setRegisterPair(RegisterPair.BC, 0xac34);

      expect(registers.getRegister(Register.B)).toBe(0xac);
      expect(registers.getRegister(Register.C)).toBe(0x34);

      registers.setRegister(Register.B, 0x1a);
      expect(registers.getRegisterPair(RegisterPair.BC)).toBe(0x1a34);

      registers.setRegister(Register.C, 0x22);
      expect(registers.getRegisterPair(RegisterPair.BC)).toBe(0x1a22);
    });

    testRegisters("DE", ({ registers }) => {
      expect(highRegister(RegisterPair.DE)).toBe(Register.D);
      expect(lowRegister(RegisterPair.DE)).toBe(Register.E);

      registers.setRegisterPair(RegisterPair.DE, 0xff80);

      expect(registers.getRegister(Register.D)).toBe(0xff);
      expect(registers.getRegister(Register.E)).toBe(0x80);

      registers.setRegister(Register.E, 0x67);
      expect(registers.getRegisterPair(RegisterPair.DE)).toBe(0xff67);

      registers.setRegister(Register.D, 0xce);
      expect(registers.getRegisterPair(RegisterPair.DE)).toBe(0xce67);
    });

    testRegisters("HL", ({ registers }) => {
      expect(highRegister(RegisterPair.HL)).toBe(Register.H);
      expect(lowRegister(RegisterPair.HL)).toBe(Register.L);

      registers.setRegisterPair(RegisterPair.HL, 0xeeec);

      expect(registers.getRegister(Register.H)).toBe(0xee);
      expect(registers.getRegister(Register.L)).toBe(0xec);

      registers.setRegister(Register.H, 0xf8);
      expect(registers.getRegisterPair(RegisterPair.HL)).toBe(0xf8ec);

      registers.setRegister(Register.L, 0x98);
      expect(registers.getRegisterPair(RegisterPair.HL)).toBe(0xf898);
    });

    testRegisters("SP", ({ registers }) => {
      expect(highRegister(RegisterPair.SP)).toBe(Register.SP_H);
      expect(lowRegister(RegisterPair.SP)).toBe(Register.SP_L);

      registers.setRegisterPair(RegisterPair.SP, 0x21ac);

      expect(registers.getRegister(Register.SP_H)).toBe(0x21);
      expect(registers.getRegister(Register.SP_L)).toBe(0xac);

      registers.setRegister(Register.SP_H, 0xf0);
      expect(registers.getRegisterPair(RegisterPair.SP)).toBe(0xf0ac);

      registers.setRegister(Register.SP_L, 0x92);
      expect(registers.getRegisterPair(RegisterPair.SP)).toBe(0xf092);
    });

    testRegisters("PC", ({ registers }) => {
      expect(highRegister(RegisterPair.PC)).toBe(Register.PC_H);
      expect(lowRegister(RegisterPair.PC)).toBe(Register.PC_L);

      registers.setRegisterPair(RegisterPair.PC, 0x51a8);

      expect(registers.getRegister(Register.PC_H)).toBe(0x51);
      expect(registers.getRegister(Register.PC_L)).toBe(0xa8);

      registers.setRegister(Register.PC_H, 0xc8);
      expect(registers.getRegisterPair(RegisterPair.PC)).toBe(0xc8a8);

      registers.setRegister(Register.PC_L, 0xa2);
      expect(registers.getRegisterPair(RegisterPair.PC)).toBe(0xc8a2);
    });
  });
});
