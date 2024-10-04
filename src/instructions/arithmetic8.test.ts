import { describe, expect, test as baseTest } from "vitest";

import {
  Flag,
  InterruptFlags,
  Register,
  RegisterFile,
  RegisterPair,
} from "../cpu";
import { Memory } from "../memory";

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
import { InstructionCtx } from "./lib";

const test = baseTest.extend({
  ctx: async ({}, use: (ctx: InstructionCtx) => Promise<void>) => {
    await use({
      regs: new RegisterFile(),
      memory: new Memory(),
      interruptFlags: new InterruptFlags(),
    });
  },
});

describe("8-bit arithmetic and logical instructions", () => {
  test("ADD A,r", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x3a);
    ctx.regs.write(Register.B, 0xc6);

    addRegister(ctx, Register.B);

    expect(ctx.regs.read(Register.A)).toBe(0);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(true);
  });

  test("ADD A,(HL)", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x3c);
    ctx.regs.writePair(RegisterPair.HL, 0x3ab6);
    ctx.memory.write(0x3ab6, 0x12);

    addIndirectHL(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0x4e);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("ADD A,n", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x3c);
    ctx.memory.write(0, 0xff);

    addImmediate(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0x3b);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(true);
  });

  test("ADC A,r", ({ ctx }) => {
    ctx.regs.write(Register.A, 0xe1);
    ctx.regs.write(Register.E, 0x0f);
    ctx.regs.setFlag(Flag.CY, true);

    addRegisterWithCarry(ctx, Register.E);

    expect(ctx.regs.read(Register.A)).toBe(0xf1);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("ADC A,(HL)", ({ ctx }) => {
    ctx.regs.write(Register.A, 0xe1);
    ctx.regs.writePair(RegisterPair.HL, 0x8ac5);
    ctx.memory.write(0x8ac5, 0x1e);
    ctx.regs.setFlag(Flag.CY, true);

    addIndirectHLWithCarry(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0x00);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(true);
  });

  test("ADC A,n", ({ ctx }) => {
    ctx.regs.write(Register.A, 0xe1);
    ctx.memory.write(0, 0x3b);
    ctx.regs.setFlag(Flag.CY, true);

    addImmediateWithCarry(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0x1d);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(true);
  });

  test("SUB r", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x3e);
    ctx.regs.write(Register.E, 0x3e);

    subtractRegister(ctx, Register.E);

    expect(ctx.regs.read(Register.A)).toBe(0);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("SUB (HL)", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x3e);
    ctx.regs.writePair(RegisterPair.HL, 0x8ac5);
    ctx.memory.write(0x8ac5, 0x40);

    subtractIndirectHL(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0xfe);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(true);
  });

  test("SUB n", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x3e);
    ctx.memory.write(0, 0x0f);

    subtractImmediate(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0x2f);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("SBC A,r", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x3b);
    ctx.regs.write(Register.H, 0x2a);
    ctx.regs.setFlag(Flag.CY, true);

    subtractRegisterWithCarry(ctx, Register.H);

    expect(ctx.regs.read(Register.A)).toBe(0x10);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("SBC A,(HL)", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x3b);
    ctx.regs.writePair(RegisterPair.HL, 0x8ac5);
    ctx.memory.write(0x8ac5, 0x4f);
    ctx.regs.setFlag(Flag.CY, true);

    subtractIndirectHLWithCarry(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0xeb);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(true);
  });

  test("SBC A,n", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x3b);
    ctx.memory.write(0, 0x3a);
    ctx.regs.setFlag(Flag.CY, true);

    subtractImmediateWithCarry(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0x00);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("CP r", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x3c);
    ctx.regs.write(Register.B, 0x2f);

    compareRegister(ctx, Register.B);

    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("CP (HL)", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x3c);
    ctx.regs.writePair(RegisterPair.HL, 0x3ab6);
    ctx.memory.write(0x3ab6, 0x40);

    compareIndirectHL(ctx);

    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(true);
  });

  test("CP n", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x3c);
    ctx.memory.write(0, 0x3c);

    compareImmediate(ctx);

    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("INC r", ({ ctx }) => {
    ctx.regs.write(Register.A, 0xff);

    incrementRegister(ctx, Register.A);

    expect(ctx.regs.read(Register.A)).toBe(0x00);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("INC (HL)", ({ ctx }) => {
    ctx.regs.writePair(RegisterPair.HL, 0x8ac5);
    ctx.memory.write(0x8ac5, 0x50);

    incrementIndirectHL(ctx);

    expect(ctx.memory.read(ctx.regs.readPair(RegisterPair.HL))).toBe(0x51);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
  });

  test("DEC r", ({ ctx }) => {
    ctx.regs.write(Register.L, 0x01);

    decrementRegister(ctx, Register.L);

    expect(ctx.regs.read(Register.L)).toBe(0x00);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(true);
  });

  test("DEC (HL)", ({ ctx }) => {
    ctx.regs.writePair(RegisterPair.HL, 0xff34);
    ctx.memory.write(0xff34, 0x00);

    decrementIndirectHL(ctx);

    expect(ctx.memory.read(ctx.regs.readPair(RegisterPair.HL))).toBe(0xff);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(true);
  });

  test("AND r", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x5a);
    ctx.regs.write(Register.L, 0x3f);

    andRegister(ctx, Register.L);

    expect(ctx.regs.read(Register.A)).toBe(0x1a);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("AND (HL)", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x5a);
    ctx.regs.writePair(RegisterPair.HL, 0x8ac5);
    ctx.memory.write(0x8ac5, 0x00);

    andIndirectHL(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0x00);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("AND n", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x5a);
    ctx.memory.write(0, 0x38);

    andImmediate(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0x18);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("OR r", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x5a);

    orRegister(ctx, Register.A);

    expect(ctx.regs.read(Register.A)).toBe(0x5a);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("OR (HL)", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x5a);
    ctx.regs.writePair(RegisterPair.HL, 0x8ac2);
    ctx.memory.write(0x8ac2, 0x0f);

    orIndirectHL(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0x5f);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("OR n", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x5a);
    ctx.memory.write(0, 0x3);

    orImmediate(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0x5b);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("XOR r", ({ ctx }) => {
    ctx.regs.write(Register.A, 0xff);

    xorRegister(ctx, Register.A);

    expect(ctx.regs.read(Register.A)).toBe(0x00);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("XOR (HL)", ({ ctx }) => {
    ctx.regs.write(Register.A, 0xff);
    ctx.regs.writePair(RegisterPair.HL, 0x8ac5);
    ctx.memory.write(0x8ac5, 0x8a);

    xorIndirectHL(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0x75);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("XOR n", ({ ctx }) => {
    ctx.regs.write(Register.A, 0xff);
    ctx.memory.write(0, 0xf);

    xorImmediate(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0xf0);
    expect(ctx.regs.isFlagSet(Flag.Z)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("CCF", ({ ctx }) => {
    ctx.regs.setFlag(Flag.CY, true);

    complementCarryFlag(ctx);

    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);

    complementCarryFlag(ctx);

    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(true);
  });

  test("SCF", ({ ctx }) => {
    ctx.regs.setFlag(Flag.CY, false);

    setCarryFlag(ctx);

    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(true);

    setCarryFlag(ctx);

    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(true);
  });

  test("DAA", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x45);
    ctx.regs.write(Register.B, 0x38);

    addRegister(ctx, Register.B);

    expect(ctx.regs.read(Register.A)).toBe(0x7d);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(false);

    decimalAdjustAccumulator(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0x83);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);

    subtractRegister(ctx, Register.B);

    expect(ctx.regs.read(Register.A)).toBe(0x4b);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(true);

    decimalAdjustAccumulator(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0x45);
    expect(ctx.regs.isFlagSet(Flag.CY)).toBe(false);
  });

  test("CPL", ({ ctx }) => {
    ctx.regs.write(Register.A, 0x35);

    complementAccumulator(ctx);

    expect(ctx.regs.read(Register.A)).toBe(0xca);
    expect(ctx.regs.isFlagSet(Flag.H)).toBe(true);
    expect(ctx.regs.isFlagSet(Flag.N)).toBe(true);
  });
});
