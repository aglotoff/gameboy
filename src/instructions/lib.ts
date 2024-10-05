import { RegisterFile, RegisterPair } from "../regs";
import { Memory } from "../memory";
import { wrapIncrementWord, makeWord } from "../utils";

export interface CpuState {
  regs: RegisterFile;
  ime: boolean;
  halted: boolean;
  stopped: boolean;
}

export interface InstructionCtx {
  cpu: CpuState;
  memory: Memory;
}

export type OpTable = Partial<
  Record<number, [string, (ctx: InstructionCtx) => number]>
>;

export function fetchImmediateByte({ cpu, memory }: InstructionCtx) {
  let pc = cpu.regs.readPair(RegisterPair.PC);
  const data = memory.read(pc);
  cpu.regs.writePair(RegisterPair.PC, wrapIncrementWord(pc));
  return data;
}

export function fetchImmediateWord(ctx: InstructionCtx) {
  let lowByte = fetchImmediateByte(ctx);
  let highByte = fetchImmediateByte(ctx);
  return makeWord(highByte, lowByte);
}

export function instruction<T extends unknown[]>(
  cb: (ctx: InstructionCtx, ...args: T) => number
) {
  return cb;
}

export function instructionWithImmediateByte<T extends unknown[]>(
  cb: (ctx: InstructionCtx, byte: number, ...args: T) => number
) {
  return (ctx: InstructionCtx, ...args: T) =>
    cb(ctx, fetchImmediateByte(ctx), ...args);
}

export function instructionWithImmediateWord<T extends unknown[]>(
  cb: (ctx: InstructionCtx, word: number, ...args: T) => number
) {
  return (ctx: InstructionCtx, ...args: T) =>
    cb(ctx, fetchImmediateWord(ctx), ...args);
}
