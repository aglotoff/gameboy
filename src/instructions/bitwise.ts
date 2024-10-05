import { Flag, Register, RegisterPair } from "../cpu";
import { InstructionCtx } from "./lib";

function rotateLeftCircular(value: number) {
  return {
    result: ((value << 1) | (value >> 7)) & 0xff,
    carry: (value & 0x80) != 0,
  };
}

function rotateLeft(value: number, carry: boolean) {
  return {
    result: ((value << 1) & 0xff) | (carry ? 0x01 : 0x00),
    carry: (value & 0x80) != 0,
  };
}

function rotateRightCircular(value: number) {
  return {
    result: ((value >> 1) | (value << 7)) & 0xff,
    carry: (value & 0x01) != 0,
  };
}

function rotateRight(value: number, carry: boolean) {
  return {
    result: ((value >> 1) & 0xff) | (carry ? 0x80 : 0x00),
    carry: (value & 0x01) != 0,
  };
}

export function rotateLeftCircularAccumulator(ctx: InstructionCtx) {
  const { result, carry } = rotateLeftCircular(ctx.regs.read(Register.A));

  ctx.regs.write(Register.A, result);
  ctx.regs.setFlag(Flag.Z, false);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, carry);

  return 4;
}

export function rotateRightCircularAccumulator(ctx: InstructionCtx) {
  const { result, carry } = rotateRightCircular(ctx.regs.read(Register.A));

  ctx.regs.write(Register.A, result);
  ctx.regs.setFlag(Flag.Z, false);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, carry);

  return 4;
}

export function rotateLeftAccumulator(ctx: InstructionCtx) {
  const { result, carry } = rotateLeft(
    ctx.regs.read(Register.A),
    ctx.regs.isFlagSet(Flag.CY)
  );

  ctx.regs.write(Register.A, result);
  ctx.regs.setFlag(Flag.Z, false);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, carry);

  return 4;
}

export function rotateRightAccumulator(ctx: InstructionCtx) {
  const { result, carry } = rotateRight(
    ctx.regs.read(Register.A),
    ctx.regs.isFlagSet(Flag.CY)
  );

  ctx.regs.write(Register.A, result);
  ctx.regs.setFlag(Flag.Z, false);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, carry);

  return 4;
}

export function rotateLeftCircularRegister(
  ctx: InstructionCtx,
  register: Register
) {
  const { result, carry } = rotateLeftCircular(ctx.regs.read(register));

  ctx.regs.write(register, result);
  ctx.regs.setFlag(Flag.Z, result === 0);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, carry);

  return 8;
}

export function rotateLeftCircularIndirectHL(ctx: InstructionCtx) {
  const address = ctx.regs.readPair(RegisterPair.HL);

  const { result, carry } = rotateLeftCircular(ctx.memory.read(address));

  ctx.memory.write(address, result);
  ctx.regs.setFlag(Flag.Z, result === 0);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, carry);

  return 16;
}

export function rotateRightCircularRegister(
  ctx: InstructionCtx,
  register: Register
) {
  const { result, carry } = rotateRightCircular(ctx.regs.read(register));

  ctx.regs.write(register, result);
  ctx.regs.setFlag(Flag.Z, result === 0);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, carry);

  return 8;
}

export function rotateRightCircularIndirectHL(ctx: InstructionCtx) {
  const address = ctx.regs.readPair(RegisterPair.HL);

  const { result, carry } = rotateRightCircular(ctx.memory.read(address));

  ctx.memory.write(address, result);
  ctx.regs.setFlag(Flag.Z, result === 0);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, carry);

  return 16;
}

export function rotateLeftRegister(ctx: InstructionCtx, register: Register) {
  const { result, carry } = rotateLeft(
    ctx.regs.read(register),
    ctx.regs.isFlagSet(Flag.CY)
  );

  ctx.regs.write(register, result);
  ctx.regs.setFlag(Flag.Z, result === 0);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, carry);

  return 8;
}

export function rotateLeftIndirectHL(ctx: InstructionCtx) {
  const address = ctx.regs.readPair(RegisterPair.HL);

  const { result, carry } = rotateLeft(
    ctx.memory.read(address),
    ctx.regs.isFlagSet(Flag.CY)
  );

  ctx.memory.write(address, result);
  ctx.regs.setFlag(Flag.Z, result === 0);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, carry);

  return 16;
}

export function rotateRightRegister(ctx: InstructionCtx, register: Register) {
  const { result, carry } = rotateRight(
    ctx.regs.read(register),
    ctx.regs.isFlagSet(Flag.CY)
  );

  ctx.regs.write(register, result);
  ctx.regs.setFlag(Flag.Z, result === 0);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, carry);

  return 8;
}

export function rotateRightIndirectHL(ctx: InstructionCtx) {
  const address = ctx.regs.readPair(RegisterPair.HL);

  const { result, carry } = rotateRight(
    ctx.memory.read(address),
    ctx.regs.isFlagSet(Flag.CY)
  );

  ctx.memory.write(address, result);
  ctx.regs.setFlag(Flag.Z, result === 0);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, carry);

  return 16;
}

function shiftLeftArithmetic(value: number) {
  return {
    result: (value << 1) & 0xff,
    carry: (value & 0x80) !== 0,
  };
}

export function shiftLeftArithmeticRegister(
  ctx: InstructionCtx,
  register: Register
) {
  const { result, carry } = shiftLeftArithmetic(ctx.regs.read(register));

  ctx.regs.write(register, result);
  ctx.regs.setFlag(Flag.Z, result === 0);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, carry);

  return 8;
}

export function shiftLeftArithmeticIndirectHL(ctx: InstructionCtx) {
  const address = ctx.regs.readPair(RegisterPair.HL);

  const { result, carry } = shiftLeftArithmetic(ctx.memory.read(address));

  ctx.memory.write(address, result);
  ctx.regs.setFlag(Flag.Z, result === 0);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, carry);

  return 16;
}

function shiftRightArithmetic(value: number) {
  return {
    result: ((value >> 1) & 0xff) | (value & 0x80),
    carry: (value & 0x01) !== 0,
  };
}

export function shiftRightArithmeticRegister(
  ctx: InstructionCtx,
  register: Register
) {
  const { result, carry } = shiftRightArithmetic(ctx.regs.read(register));

  ctx.regs.write(register, result);
  ctx.regs.setFlag(Flag.Z, result === 0);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, carry);

  return 8;
}

export function shiftRightArithmeticIndirectHL(ctx: InstructionCtx) {
  const address = ctx.regs.readPair(RegisterPair.HL);

  const { result, carry } = shiftRightArithmetic(ctx.memory.read(address));

  ctx.memory.write(address, result);
  ctx.regs.setFlag(Flag.Z, result === 0);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, carry);

  return 16;
}

function shiftRightLogical(value: number) {
  return {
    result: (value >> 1) & 0xff,
    carry: (value & 0x01) !== 0,
  };
}

export function shiftRightLogicalRegister(
  ctx: InstructionCtx,
  register: Register
) {
  const { result, carry } = shiftRightLogical(ctx.regs.read(register));

  ctx.regs.write(register, result);
  ctx.regs.setFlag(Flag.Z, result === 0);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, carry);

  return 8;
}

export function shiftRightLogicalIndirectHL(ctx: InstructionCtx) {
  const address = ctx.regs.readPair(RegisterPair.HL);

  const { result, carry } = shiftRightLogical(ctx.memory.read(address));

  ctx.memory.write(address, result);
  ctx.regs.setFlag(Flag.Z, result === 0);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, carry);

  return 16;
}

function swapNibbles(value: number) {
  return ((value & 0xf) << 4) | ((value >> 4) & 0xf);
}

export function swapNibblesRegister(ctx: InstructionCtx, register: Register) {
  const result = swapNibbles(ctx.regs.read(register));

  ctx.regs.write(register, result);
  ctx.regs.setFlag(Flag.Z, result === 0);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, false);

  return 8;
}

export function swapNibblesIndirectHL(ctx: InstructionCtx) {
  const address = ctx.regs.readPair(RegisterPair.HL);

  const result = swapNibbles(ctx.memory.read(address));

  ctx.memory.write(address, result);
  ctx.regs.setFlag(Flag.Z, result === 0);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, false);

  return 16;
}

function testBit(value: number, bit: number) {
  return !(value & (1 << bit));
}

export function testBitRegister(
  ctx: InstructionCtx,
  bit: number,
  register: Register
) {
  ctx.regs.setFlag(Flag.Z, testBit(ctx.regs.read(register), bit));
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, true);

  return 8;
}

export function testBitIndirectHL(ctx: InstructionCtx, bit: number) {
  const address = ctx.regs.readPair(RegisterPair.HL);

  ctx.regs.setFlag(Flag.Z, testBit(ctx.memory.read(address), bit));
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, true);

  return 12;
}

function resetBit(value: number, bit: number) {
  return value & ~(1 << bit);
}

export function resetBitRegister(
  ctx: InstructionCtx,
  bit: number,
  register: Register
) {
  ctx.regs.write(register, resetBit(ctx.regs.read(register), bit));
  return 8;
}

export function resetBitIndirectHL(ctx: InstructionCtx, bit: number) {
  const address = ctx.regs.readPair(RegisterPair.HL);
  ctx.memory.write(address, resetBit(ctx.memory.read(address), bit));
  return 16;
}

function setBit(value: number, bit: number) {
  return value | (1 << bit);
}

export function setBitRegister(
  ctx: InstructionCtx,
  bit: number,
  register: Register
) {
  ctx.regs.write(register, setBit(ctx.regs.read(register), bit));
  return 8;
}

export function setBitIndirectHL(ctx: InstructionCtx, bit: number) {
  const address = ctx.regs.readPair(RegisterPair.HL);
  ctx.memory.write(address, setBit(ctx.memory.read(address), bit));
  return 16;
}
