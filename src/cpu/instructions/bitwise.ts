import { Flag, Register, RegisterPair } from "../register";
import { resetBit, setBit } from "../../utils";
import { makeInstruction } from "./lib";
import { InstructionContext } from "../cpu-state";

const BYTE_MASK = 0b11111111;
const NIBBLE_MASK = 0b1111;
const HIGH_BIT_MASK = 0b10000000;
const LOW_BIT_MASK = 0b00000001;

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RLCA
export const rotateAccumulatorLeft = makeInstruction((ctx) => {
  const data = ctx.readRegister(Register.A);

  const result = rotateLeft(ctx, data);

  ctx.writeRegister(Register.A, result);
  ctx.setFlag(Flag.Z, false);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RLC_r8
export const rotateRegisterLeft = makeInstruction((ctx, reg: Register) => {
  const data = ctx.readRegister(reg);

  const result = rotateLeft(ctx, data);

  ctx.writeRegister(reg, result);
  ctx.setFlag(Flag.Z, result === 0);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RLC__HL_
export const rotateIndirectHLLeft = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  const result = rotateLeft(ctx, data);

  ctx.setFlag(Flag.Z, result === 0);
  ctx.writeMemoryCycle(address, result);
});

function rotateLeft(ctx: InstructionContext, value: number) {
  const result = ((value << 1) | (value >> 7)) & BYTE_MASK;
  const carry = (value & HIGH_BIT_MASK) != 0;

  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, false);
  ctx.setFlag(Flag.CY, carry);

  return result;
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RRCA
export const rotateAccumulatorRight = makeInstruction((ctx) => {
  const data = ctx.readRegister(Register.A);

  const result = rotateRight(ctx, data);

  ctx.writeRegister(Register.A, result);
  ctx.setFlag(Flag.Z, false);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RRC_r8
export const rotateRegisterRight = makeInstruction((ctx, reg: Register) => {
  const data = ctx.readRegister(reg);

  const result = rotateRight(ctx, data);

  ctx.writeRegister(reg, result);
  ctx.setFlag(Flag.Z, result === 0);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RRC__HL_
export const rotateIndirectHLRight = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  const result = rotateRight(ctx, data);

  ctx.setFlag(Flag.Z, result === 0);
  ctx.writeMemoryCycle(address, result);
});

function rotateRight(ctx: InstructionContext, value: number) {
  const result = ((value >> 1) | (value << 7)) & BYTE_MASK;
  const carry = (value & 1) != 0;

  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, false);
  ctx.setFlag(Flag.CY, carry);

  return result;
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RLA
export const rotateAccumulatorLeftThroughCarry = makeInstruction((ctx) => {
  const data = ctx.readRegister(Register.A);

  const result = rotateLeftThroughCarry(ctx, data);

  ctx.writeRegister(Register.A, result);
  ctx.setFlag(Flag.Z, false);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RL_r8
export const rotateRegisterLeftThroughCarry = makeInstruction(
  (ctx, reg: Register) => {
    const data = ctx.readRegister(reg);
    const result = rotateLeftThroughCarry(ctx, data);

    ctx.writeRegister(reg, result);
    ctx.setFlag(Flag.Z, result === 0);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RL__HL_
export const rotateIndirectHLLeftThroughCarry = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  const result = rotateLeftThroughCarry(ctx, data);

  ctx.setFlag(Flag.Z, result === 0);
  ctx.writeMemoryCycle(address, result);
});

function rotateLeftThroughCarry(ctx: InstructionContext, value: number) {
  const result =
    ((value << 1) & BYTE_MASK) | (ctx.getFlag(Flag.CY) ? LOW_BIT_MASK : 0);
  const carry = (value & HIGH_BIT_MASK) != 0;

  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, false);
  ctx.setFlag(Flag.CY, carry);

  return result;
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RRA
export const rotateAccumulatorRightThroughCarry = makeInstruction((ctx) => {
  const data = ctx.readRegister(Register.A);

  const result = rotateRightThroughCarry(ctx, data);

  ctx.writeRegister(Register.A, result);
  ctx.setFlag(Flag.Z, false);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RR_r8
export const rotateRegisterRightThroughCarry = makeInstruction(
  (ctx, reg: Register) => {
    const data = ctx.readRegister(reg);

    const result = rotateRightThroughCarry(ctx, data);

    ctx.writeRegister(reg, result);
    ctx.setFlag(Flag.Z, result === 0);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RR__HL_
export const rotateIndirectHLRightThroughCarry = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  const result = rotateRightThroughCarry(ctx, data);

  ctx.setFlag(Flag.Z, result === 0);
  ctx.writeMemoryCycle(address, result);
});

function rotateRightThroughCarry(ctx: InstructionContext, value: number) {
  const result =
    ((value >> 1) & BYTE_MASK) | (ctx.getFlag(Flag.CY) ? HIGH_BIT_MASK : 0);
  const carry = (value & LOW_BIT_MASK) != 0;

  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, false);
  ctx.setFlag(Flag.CY, carry);

  return result;
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SLA_r8
export const shiftLeftArithmeticallyRegister = makeInstruction(
  (ctx, reg: Register) => {
    const data = ctx.readRegister(reg);

    const result = shiftLeftArithmetically(ctx, data);

    ctx.writeRegister(reg, result);
    ctx.setFlag(Flag.Z, result === 0);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SLA__HL_
export const shiftLeftArithmeticallyIndirectHL = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  const result = shiftLeftArithmetically(ctx, data);

  ctx.setFlag(Flag.Z, result === 0);
  ctx.writeMemoryCycle(address, result);
});

function shiftLeftArithmetically(ctx: InstructionContext, value: number) {
  const result = (value << 1) & BYTE_MASK;
  const carry = (value & HIGH_BIT_MASK) !== 0;

  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, false);
  ctx.setFlag(Flag.CY, carry);

  return result;
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SRA_r8
export const shiftRightArithmeticallyRegister = makeInstruction(
  (ctx, reg: Register) => {
    const data = ctx.readRegister(reg);

    const result = shiftRightArithmetically(ctx, data);

    ctx.writeRegister(reg, result);
    ctx.setFlag(Flag.Z, result === 0);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SRA__HL_
export const shiftRightArithmeticallyIndirectHL = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  const result = shiftRightArithmetically(ctx, data);

  ctx.setFlag(Flag.Z, result === 0);
  ctx.writeMemoryCycle(address, result);
});

function shiftRightArithmetically(ctx: InstructionContext, value: number) {
  const result = ((value >> 1) & BYTE_MASK) | (value & HIGH_BIT_MASK);
  const carry = (value & 1) !== 0;

  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, false);
  ctx.setFlag(Flag.CY, carry);

  return result;
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SRL_r8
export const shiftRightLogicallyRegister = makeInstruction(
  (ctx, reg: Register) => {
    const data = ctx.readRegister(reg);

    const result = shiftRightLogically(ctx, data);

    ctx.writeRegister(reg, result);
    ctx.setFlag(Flag.Z, result === 0);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SRL__HL_
export const shiftRightLogicallyIndirectHL = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  const result = shiftRightLogically(ctx, data);

  ctx.setFlag(Flag.Z, result === 0);
  ctx.writeMemoryCycle(address, result);
});

function shiftRightLogically(ctx: InstructionContext, value: number) {
  const result = (value >> 1) & BYTE_MASK;
  const carry = (value & LOW_BIT_MASK) !== 0;

  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, false);
  ctx.setFlag(Flag.CY, carry);

  return result;
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SWAP_r8
export const swapNibblesInRegister = makeInstruction((ctx, reg: Register) => {
  const data = ctx.readRegister(reg);
  const result = swapNibbles(ctx, data);
  ctx.writeRegister(reg, result);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SWAP__HL_
export const swapNibblesInIndirectHL = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  const result = swapNibbles(ctx, data);

  ctx.writeMemoryCycle(address, result);
});

function swapNibbles(ctx: InstructionContext, value: number) {
  const result = ((value & NIBBLE_MASK) << 4) | ((value >> 4) & NIBBLE_MASK);

  ctx.setFlag(Flag.Z, result === 0);
  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, false);
  ctx.setFlag(Flag.CY, false);

  return result;
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#BIT_u3,r8
export const testBitInRegister = makeInstruction(
  (ctx, bit: number, reg: Register) => {
    const data = ctx.readRegister(reg);
    testBit(ctx, data, bit);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#BIT_u3,_HL_
export const testBitInIndirectHL = makeInstruction((ctx, bit: number) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  testBit(ctx, data, bit);
});

function testBit(ctx: InstructionContext, value: number, bit: number) {
  ctx.setFlag(Flag.Z, !(value & (1 << bit)));
  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, true);
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RES_u3,r8
export const resetBitInRegister = makeInstruction(
  (ctx, bit: number, reg: Register) => {
    const data = ctx.readRegister(reg);
    ctx.writeRegister(reg, resetBit(data, bit));
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RES_u3,_HL_
export const resetBitInIndirectHL = makeInstruction((ctx, bit: number) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  ctx.writeMemoryCycle(address, resetBit(data, bit));
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SET_u3,r8
export const setBitInRegister = makeInstruction(
  (ctx, bit: number, reg: Register) => {
    const data = ctx.readRegister(reg);
    ctx.writeRegister(reg, setBit(data, bit));
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SET_u3,_HL_
export const setBitInIndirectHL = makeInstruction((ctx, bit: number) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  ctx.writeMemoryCycle(address, setBit(data, bit));
});
