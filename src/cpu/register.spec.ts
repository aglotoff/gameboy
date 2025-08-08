import { describe, expect, test } from "vitest";
import { Flag, Register, RegisterFile } from "./register";

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
  });
});
