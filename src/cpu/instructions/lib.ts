import { InstructionContext } from "../cpu-state";

export type OpTable = Array<(ctx: InstructionContext) => void>;

export const invalidOpcode = makeInstruction((_ctx, opcode: number) => {
  throw new Error(`Invalid opcode ${opcode.toString(16)}`);
});

export function makeInstruction<T extends unknown[]>(
  cb: (ctx: InstructionContext, ...args: T) => void
) {
  return function (ctx: InstructionContext, ...args: T) {
    ctx.beginNextCycle();
    cb(ctx, ...args);
  };
}

export function makeInstructionWithImmediateByte<T extends unknown[]>(
  cb: (ctx: InstructionContext, byte: number, ...args: T) => void
) {
  return (ctx: InstructionContext, ...args: T) => {
    ctx.beginNextCycle();
    cb(ctx, ctx.fetchImmediateByte(), ...args);
  };
}

export function makeInstructionWithImmediateWord<T extends unknown[]>(
  cb: (ctx: InstructionContext, word: number, ...args: T) => void
) {
  return (ctx: InstructionContext, ...args: T) => {
    ctx.beginNextCycle();
    cb(ctx, ctx.fetchImmediateWord(), ...args);
  };
}

export function bindInstructionArgs<T extends unknown[]>(
  instruction: (ctx: InstructionContext, ...args: T) => void,
  ...args: T
) {
  return (ctx: InstructionContext) => {
    instruction(ctx, ...args);
  };
}

const BYTE_MASK = 0xff;
const NIBBLE_MASK = 0xf;
const BYTE_SIGN_MASK = 0b10000000;

export function addBytes(a: number, b: number, carryFlag = false) {
  const c = carryFlag ? 1 : 0;

  return {
    carryFrom3: (a & NIBBLE_MASK) + (b & NIBBLE_MASK) + c > NIBBLE_MASK,
    carryFrom7: (a & BYTE_MASK) + (b & BYTE_MASK) + c > BYTE_MASK,
    result: (a + b + c) & BYTE_MASK,
  };
}

export function isNegative(a: number) {
  return (a & BYTE_SIGN_MASK) !== 0;
}

export function subtractBytes(a: number, b: number, carryFlag = false) {
  const c = carryFlag ? 1 : 0;

  return {
    borrowTo3: (a & NIBBLE_MASK) < (b & NIBBLE_MASK) + c,
    borrowTo7: (a & BYTE_MASK) < (b & BYTE_MASK) + c,
    result: (a - b - c) & BYTE_MASK,
  };
}
