import { describe, expect } from "vitest";
import {
  getLowRegister,
  getHighRegister,
  Register,
  RegisterPair,
} from "./register";
import { testCpuState } from "./test-lib";

describe("CPU state", () => {
  testCpuState("16-bit registers", ({ state }) => {
    state.writeRegisterPair(RegisterPair.AF, 0x2ff3);
    state.writeRegisterPair(RegisterPair.BC, 0xce23);
    state.writeRegisterPair(RegisterPair.DE, 0xeecf);
    state.writeRegisterPair(RegisterPair.HL, 0x38a6);
    state.writeRegisterPair(RegisterPair.PC, 0x2af5);
    state.writeRegisterPair(RegisterPair.SP, 0x8004);

    expect(state.readRegisterPair(RegisterPair.AF)).toBe(0x2ff0);
    expect(state.readRegisterPair(RegisterPair.BC)).toBe(0xce23);
    expect(state.readRegisterPair(RegisterPair.DE)).toBe(0xeecf);
    expect(state.readRegisterPair(RegisterPair.HL)).toBe(0x38a6);
    expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x2af5);
    expect(state.readRegisterPair(RegisterPair.SP)).toBe(0x8004);
  });

  describe("register pairs", () => {
    testCpuState("AF", ({ state }) => {
      expect(getHighRegister(RegisterPair.AF)).toBe(Register.A);
      expect(getLowRegister(RegisterPair.AF)).toBe(Register.F);

      state.writeRegisterPair(RegisterPair.AF, 0xba58);

      expect(state.readRegister(Register.A)).toBe(0xba);
      expect(state.readRegister(Register.F)).toBe(0x50);

      state.writeRegister(Register.F, 0xcd);
      expect(state.readRegisterPair(RegisterPair.AF)).toBe(0xbac0);

      state.writeRegister(Register.A, 0x11);
      expect(state.readRegisterPair(RegisterPair.AF)).toBe(0x11c0);
    });

    testCpuState("BC", ({ state }) => {
      expect(getHighRegister(RegisterPair.BC)).toBe(Register.B);
      expect(getLowRegister(RegisterPair.BC)).toBe(Register.C);

      state.writeRegisterPair(RegisterPair.BC, 0xac34);

      expect(state.readRegister(Register.B)).toBe(0xac);
      expect(state.readRegister(Register.C)).toBe(0x34);

      state.writeRegister(Register.B, 0x1a);
      expect(state.readRegisterPair(RegisterPair.BC)).toBe(0x1a34);

      state.writeRegister(Register.C, 0x22);
      expect(state.readRegisterPair(RegisterPair.BC)).toBe(0x1a22);
    });

    testCpuState("DE", ({ state }) => {
      expect(getHighRegister(RegisterPair.DE)).toBe(Register.D);
      expect(getLowRegister(RegisterPair.DE)).toBe(Register.E);

      state.writeRegisterPair(RegisterPair.DE, 0xff80);

      expect(state.readRegister(Register.D)).toBe(0xff);
      expect(state.readRegister(Register.E)).toBe(0x80);

      state.writeRegister(Register.E, 0x67);
      expect(state.readRegisterPair(RegisterPair.DE)).toBe(0xff67);

      state.writeRegister(Register.D, 0xce);
      expect(state.readRegisterPair(RegisterPair.DE)).toBe(0xce67);
    });

    testCpuState("HL", ({ state }) => {
      expect(getHighRegister(RegisterPair.HL)).toBe(Register.H);
      expect(getLowRegister(RegisterPair.HL)).toBe(Register.L);

      state.writeRegisterPair(RegisterPair.HL, 0xeeec);

      expect(state.readRegister(Register.H)).toBe(0xee);
      expect(state.readRegister(Register.L)).toBe(0xec);

      state.writeRegister(Register.H, 0xf8);
      expect(state.readRegisterPair(RegisterPair.HL)).toBe(0xf8ec);

      state.writeRegister(Register.L, 0x98);
      expect(state.readRegisterPair(RegisterPair.HL)).toBe(0xf898);
    });

    testCpuState("SP", ({ state }) => {
      expect(getHighRegister(RegisterPair.SP)).toBe(Register.SP_H);
      expect(getLowRegister(RegisterPair.SP)).toBe(Register.SP_L);

      state.writeRegisterPair(RegisterPair.SP, 0x21ac);

      expect(state.readRegister(Register.SP_H)).toBe(0x21);
      expect(state.readRegister(Register.SP_L)).toBe(0xac);

      state.writeRegister(Register.SP_H, 0xf0);
      expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xf0ac);

      state.writeRegister(Register.SP_L, 0x92);
      expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xf092);
    });

    testCpuState("PC", ({ state }) => {
      expect(getHighRegister(RegisterPair.PC)).toBe(Register.PC_H);
      expect(getLowRegister(RegisterPair.PC)).toBe(Register.PC_L);

      state.writeRegisterPair(RegisterPair.PC, 0x51a8);

      expect(state.readRegister(Register.PC_H)).toBe(0x51);
      expect(state.readRegister(Register.PC_L)).toBe(0xa8);

      state.writeRegister(Register.PC_H, 0xc8);
      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0xc8a8);

      state.writeRegister(Register.PC_L, 0xa2);
      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0xc8a2);
    });
  });
});
