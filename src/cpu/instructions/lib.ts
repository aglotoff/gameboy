import { Mask } from "../../utils";
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

export function addBytes(a: number, b: number, carryFlag = false) {
  const c = carryFlag ? 1 : 0;

  return {
    carryFrom3: (a & Mask.Nibble) + (b & Mask.Nibble) + c > Mask.Nibble,
    carryFrom7: (a & Mask.Byte) + (b & Mask.Byte) + c > Mask.Byte,
    result: (a + b + c) & Mask.Byte,
  };
}

export function isNegative(a: number) {
  return (a & Mask.MSB) !== 0;
}

export function subtractBytes(a: number, b: number, carryFlag = false) {
  const c = carryFlag ? 1 : 0;

  return {
    borrowTo3: (a & Mask.Nibble) < (b & Mask.Nibble) + c,
    borrowTo7: (a & Mask.Byte) < (b & Mask.Byte) + c,
    result: (a - b - c) & Mask.Byte,
  };
}
