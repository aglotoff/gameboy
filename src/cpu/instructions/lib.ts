import {
  getLSB,
  getMSB,
  makeWord,
  wrappingDecrementWord,
  wrappingIncrementWord,
} from "../../utils";
import { InstructionContext } from "../cpu-state";
import { Flag, RegisterPair } from "../register";

export type OpTable = Array<(ctx: InstructionContext) => void>;

export const invalidOpcode = makeInstruction((_ctx, opcode: number) => {
  throw new Error(`Invalid opcode ${opcode.toString(16)}`);
});

export function makeInstruction<T extends unknown[]>(
  cb: (ctx: InstructionContext, ...args: T) => void
) {
  return function (ctx: InstructionContext, ...args: T) {
    ctx.state.beginNextCycle();
    cb(ctx, ...args);
  };
}

export function makeInstructionWithImmediateByte<T extends unknown[]>(
  cb: (ctx: InstructionContext, byte: number, ...args: T) => void
) {
  return (ctx: InstructionContext, ...args: T) => {
    ctx.state.beginNextCycle();
    cb(ctx, fetchImmediateByte(ctx), ...args);
  };
}

export function fetchImmediateByte(ctx: InstructionContext) {
  const address = ctx.registers.readPair(RegisterPair.PC);
  const data = ctx.memory.read(address);

  ctx.state.beginNextCycle();

  ctx.registers.writePair(RegisterPair.PC, wrappingIncrementWord(address));

  return data;
}

export function makeInstructionWithImmediateWord<T extends unknown[]>(
  cb: (ctx: InstructionContext, word: number, ...args: T) => void
) {
  return (ctx: InstructionContext, ...args: T) => {
    ctx.state.beginNextCycle();
    cb(ctx, fetchImmediateWord(ctx), ...args);
  };
}

function fetchImmediateWord(ctx: InstructionContext) {
  const lsb = fetchImmediateByte(ctx);
  const msb = fetchImmediateByte(ctx);
  return makeWord(msb, lsb);
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

export const enum Condition {
  Z,
  C,
  NZ,
  NC,
}

export function checkCondition(ctx: InstructionContext, condition: Condition) {
  switch (condition) {
    case Condition.Z:
      return ctx.registers.getFlag(Flag.Z);
    case Condition.C:
      return ctx.registers.getFlag(Flag.CY);
    case Condition.NZ:
      return !ctx.registers.getFlag(Flag.Z);
    case Condition.NC:
      return !ctx.registers.getFlag(Flag.CY);
  }
}

export function pushWord(ctx: InstructionContext, data: number) {
  let address = ctx.registers.readPair(RegisterPair.SP);

  ctx.memory.triggerWrite(address);
  ctx.registers.writePair(RegisterPair.SP, wrappingDecrementWord(address));

  ctx.state.beginNextCycle();

  address = ctx.registers.readPair(RegisterPair.SP);

  ctx.memory.triggerWrite(address);
  ctx.registers.writePair(RegisterPair.SP, wrappingDecrementWord(address));

  ctx.memory.write(address, getMSB(data));

  ctx.state.beginNextCycle();

  address = ctx.registers.readPair(RegisterPair.SP);
  ctx.memory.write(address, getLSB(data));
}

export function popWord(ctx: InstructionContext) {
  let address = ctx.registers.readPair(RegisterPair.SP);

  ctx.registers.writePair(RegisterPair.SP, wrappingIncrementWord(address));
  ctx.memory.triggerReadWrite(address);

  const lsb = ctx.memory.read(address);

  ctx.state.beginNextCycle();

  address = ctx.registers.readPair(RegisterPair.SP);

  ctx.registers.writePair(RegisterPair.SP, wrappingIncrementWord(address));

  const msb = ctx.memory.read(address);

  ctx.state.beginNextCycle();

  return makeWord(msb, lsb);
}
