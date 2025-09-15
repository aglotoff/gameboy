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
  const data = ctx.registers.read(Register.A);

  const result = rotateLeft(ctx, data);

  ctx.registers.write(Register.A, result);
  ctx.registers.setFlag(Flag.Z, false);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RLC_r8
export const rotateRegisterLeft = makeInstruction((ctx, reg: Register) => {
  const data = ctx.registers.read(reg);

  const result = rotateLeft(ctx, data);

  ctx.registers.write(reg, result);
  ctx.registers.setFlag(Flag.Z, result === 0);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RLC__HL_
export const rotateIndirectHLLeft = makeInstruction((ctx) => {
  const address = ctx.registers.readPair(RegisterPair.HL);
  const data = ctx.memory.read(address);

  ctx.state.beginNextCycle();

  const result = rotateLeft(ctx, data);

  ctx.registers.setFlag(Flag.Z, result === 0);
  ctx.memory.write(address, result);

  ctx.state.beginNextCycle();
});

function rotateLeft(ctx: InstructionContext, value: number) {
  const result = ((value << 1) | (value >> 7)) & BYTE_MASK;
  const carry = (value & HIGH_BIT_MASK) != 0;

  ctx.registers.setFlag(Flag.N, false);
  ctx.registers.setFlag(Flag.H, false);
  ctx.registers.setFlag(Flag.CY, carry);

  return result;
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RRCA
export const rotateAccumulatorRight = makeInstruction((ctx) => {
  const data = ctx.registers.read(Register.A);

  const result = rotateRight(ctx, data);

  ctx.registers.write(Register.A, result);
  ctx.registers.setFlag(Flag.Z, false);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RRC_r8
export const rotateRegisterRight = makeInstruction((ctx, reg: Register) => {
  const data = ctx.registers.read(reg);

  const result = rotateRight(ctx, data);

  ctx.registers.write(reg, result);
  ctx.registers.setFlag(Flag.Z, result === 0);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RRC__HL_
export const rotateIndirectHLRight = makeInstruction((ctx) => {
  const address = ctx.registers.readPair(RegisterPair.HL);
  const data = ctx.memory.read(address);

  ctx.state.beginNextCycle();

  const result = rotateRight(ctx, data);

  ctx.registers.setFlag(Flag.Z, result === 0);
  ctx.memory.write(address, result);

  ctx.state.beginNextCycle();
});

function rotateRight(ctx: InstructionContext, value: number) {
  const result = ((value >> 1) | (value << 7)) & BYTE_MASK;
  const carry = (value & 1) != 0;

  ctx.registers.setFlag(Flag.N, false);
  ctx.registers.setFlag(Flag.H, false);
  ctx.registers.setFlag(Flag.CY, carry);

  return result;
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RLA
export const rotateAccumulatorLeftThroughCarry = makeInstruction((ctx) => {
  const data = ctx.registers.read(Register.A);

  const result = rotateLeftThroughCarry(ctx, data);

  ctx.registers.write(Register.A, result);
  ctx.registers.setFlag(Flag.Z, false);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RL_r8
export const rotateRegisterLeftThroughCarry = makeInstruction(
  (ctx, reg: Register) => {
    const data = ctx.registers.read(reg);
    const result = rotateLeftThroughCarry(ctx, data);

    ctx.registers.write(reg, result);
    ctx.registers.setFlag(Flag.Z, result === 0);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RL__HL_
export const rotateIndirectHLLeftThroughCarry = makeInstruction((ctx) => {
  const address = ctx.registers.readPair(RegisterPair.HL);
  const data = ctx.memory.read(address);

  ctx.state.beginNextCycle();

  const result = rotateLeftThroughCarry(ctx, data);

  ctx.registers.setFlag(Flag.Z, result === 0);
  ctx.memory.write(address, result);

  ctx.state.beginNextCycle();
});

function rotateLeftThroughCarry(ctx: InstructionContext, value: number) {
  const result =
    ((value << 1) & BYTE_MASK) |
    (ctx.registers.getFlag(Flag.CY) ? LOW_BIT_MASK : 0);
  const carry = (value & HIGH_BIT_MASK) != 0;

  ctx.registers.setFlag(Flag.N, false);
  ctx.registers.setFlag(Flag.H, false);
  ctx.registers.setFlag(Flag.CY, carry);

  return result;
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RRA
export const rotateAccumulatorRightThroughCarry = makeInstruction((ctx) => {
  const data = ctx.registers.read(Register.A);

  const result = rotateRightThroughCarry(ctx, data);

  ctx.registers.write(Register.A, result);
  ctx.registers.setFlag(Flag.Z, false);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RR_r8
export const rotateRegisterRightThroughCarry = makeInstruction(
  (ctx, reg: Register) => {
    const data = ctx.registers.read(reg);

    const result = rotateRightThroughCarry(ctx, data);

    ctx.registers.write(reg, result);
    ctx.registers.setFlag(Flag.Z, result === 0);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RR__HL_
export const rotateIndirectHLRightThroughCarry = makeInstruction((ctx) => {
  const address = ctx.registers.readPair(RegisterPair.HL);
  const data = ctx.memory.read(address);

  ctx.state.beginNextCycle();

  const result = rotateRightThroughCarry(ctx, data);

  ctx.registers.setFlag(Flag.Z, result === 0);
  ctx.memory.write(address, result);

  ctx.state.beginNextCycle();
});

function rotateRightThroughCarry(ctx: InstructionContext, value: number) {
  const result =
    ((value >> 1) & BYTE_MASK) |
    (ctx.registers.getFlag(Flag.CY) ? HIGH_BIT_MASK : 0);
  const carry = (value & LOW_BIT_MASK) != 0;

  ctx.registers.setFlag(Flag.N, false);
  ctx.registers.setFlag(Flag.H, false);
  ctx.registers.setFlag(Flag.CY, carry);

  return result;
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SLA_r8
export const shiftLeftArithmeticallyRegister = makeInstruction(
  (ctx, reg: Register) => {
    const data = ctx.registers.read(reg);

    const result = shiftLeftArithmetically(ctx, data);

    ctx.registers.write(reg, result);
    ctx.registers.setFlag(Flag.Z, result === 0);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SLA__HL_
export const shiftLeftArithmeticallyIndirectHL = makeInstruction((ctx) => {
  const address = ctx.registers.readPair(RegisterPair.HL);
  const data = ctx.memory.read(address);

  ctx.state.beginNextCycle();

  const result = shiftLeftArithmetically(ctx, data);

  ctx.registers.setFlag(Flag.Z, result === 0);
  ctx.memory.write(address, result);

  ctx.state.beginNextCycle();
});

function shiftLeftArithmetically(ctx: InstructionContext, value: number) {
  const result = (value << 1) & BYTE_MASK;
  const carry = (value & HIGH_BIT_MASK) !== 0;

  ctx.registers.setFlag(Flag.N, false);
  ctx.registers.setFlag(Flag.H, false);
  ctx.registers.setFlag(Flag.CY, carry);

  return result;
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SRA_r8
export const shiftRightArithmeticallyRegister = makeInstruction(
  (ctx, reg: Register) => {
    const data = ctx.registers.read(reg);

    const result = shiftRightArithmetically(ctx, data);

    ctx.registers.write(reg, result);
    ctx.registers.setFlag(Flag.Z, result === 0);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SRA__HL_
export const shiftRightArithmeticallyIndirectHL = makeInstruction((ctx) => {
  const address = ctx.registers.readPair(RegisterPair.HL);
  const data = ctx.memory.read(address);

  ctx.state.beginNextCycle();

  const result = shiftRightArithmetically(ctx, data);

  ctx.registers.setFlag(Flag.Z, result === 0);
  ctx.memory.write(address, result);

  ctx.state.beginNextCycle();
});

function shiftRightArithmetically(ctx: InstructionContext, value: number) {
  const result = ((value >> 1) & BYTE_MASK) | (value & HIGH_BIT_MASK);
  const carry = (value & 1) !== 0;

  ctx.registers.setFlag(Flag.N, false);
  ctx.registers.setFlag(Flag.H, false);
  ctx.registers.setFlag(Flag.CY, carry);

  return result;
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SRL_r8
export const shiftRightLogicallyRegister = makeInstruction(
  (ctx, reg: Register) => {
    const data = ctx.registers.read(reg);

    const result = shiftRightLogically(ctx, data);

    ctx.registers.write(reg, result);
    ctx.registers.setFlag(Flag.Z, result === 0);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SRL__HL_
export const shiftRightLogicallyIndirectHL = makeInstruction((ctx) => {
  const address = ctx.registers.readPair(RegisterPair.HL);
  const data = ctx.memory.read(address);

  ctx.state.beginNextCycle();

  const result = shiftRightLogically(ctx, data);

  ctx.registers.setFlag(Flag.Z, result === 0);
  ctx.memory.write(address, result);

  ctx.state.beginNextCycle();
});

function shiftRightLogically(ctx: InstructionContext, value: number) {
  const result = (value >> 1) & BYTE_MASK;
  const carry = (value & LOW_BIT_MASK) !== 0;

  ctx.registers.setFlag(Flag.N, false);
  ctx.registers.setFlag(Flag.H, false);
  ctx.registers.setFlag(Flag.CY, carry);

  return result;
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SWAP_r8
export const swapNibblesInRegister = makeInstruction((ctx, reg: Register) => {
  const data = ctx.registers.read(reg);
  const result = swapNibbles(ctx, data);
  ctx.registers.write(reg, result);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SWAP__HL_
export const swapNibblesInIndirectHL = makeInstruction((ctx) => {
  const address = ctx.registers.readPair(RegisterPair.HL);
  const data = ctx.memory.read(address);

  ctx.state.beginNextCycle();

  const result = swapNibbles(ctx, data);
  ctx.memory.write(address, result);

  ctx.state.beginNextCycle();
});

function swapNibbles(ctx: InstructionContext, value: number) {
  const result = ((value & NIBBLE_MASK) << 4) | ((value >> 4) & NIBBLE_MASK);

  ctx.registers.setFlag(Flag.Z, result === 0);
  ctx.registers.setFlag(Flag.N, false);
  ctx.registers.setFlag(Flag.H, false);
  ctx.registers.setFlag(Flag.CY, false);

  return result;
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#BIT_u3,r8
export const testBitInRegister = makeInstruction(
  (ctx, bit: number, reg: Register) => {
    const data = ctx.registers.read(reg);
    testBit(ctx, data, bit);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#BIT_u3,_HL_
export const testBitInIndirectHL = makeInstruction((ctx, bit: number) => {
  const address = ctx.registers.readPair(RegisterPair.HL);
  const data = ctx.memory.read(address);

  ctx.state.beginNextCycle();

  testBit(ctx, data, bit);
});

function testBit(ctx: InstructionContext, value: number, bit: number) {
  ctx.registers.setFlag(Flag.Z, !(value & (1 << bit)));
  ctx.registers.setFlag(Flag.N, false);
  ctx.registers.setFlag(Flag.H, true);
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RES_u3,r8
export const resetBitInRegister = makeInstruction(
  (ctx, bit: number, reg: Register) => {
    const data = ctx.registers.read(reg);
    ctx.registers.write(reg, resetBit(data, bit));
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RES_u3,_HL_
export const resetBitInIndirectHL = makeInstruction((ctx, bit: number) => {
  const address = ctx.registers.readPair(RegisterPair.HL);
  const data = ctx.memory.read(address);

  ctx.state.beginNextCycle();

  ctx.memory.write(address, resetBit(data, bit));

  ctx.state.beginNextCycle();
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SET_u3,r8
export const setBitInRegister = makeInstruction(
  (ctx, bit: number, reg: Register) => {
    const data = ctx.registers.read(reg);
    ctx.registers.write(reg, setBit(data, bit));
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SET_u3,_HL_
export const setBitInIndirectHL = makeInstruction((ctx, bit: number) => {
  const address = ctx.registers.readPair(RegisterPair.HL);
  const data = ctx.memory.read(address);

  ctx.state.beginNextCycle();

  ctx.memory.write(address, setBit(data, bit));

  ctx.state.beginNextCycle();
});
