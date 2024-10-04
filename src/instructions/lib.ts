import { InterruptFlags, RegisterFile, RegisterPair } from "../cpu";
import { Memory } from "../memory";
import { incrementWord, makeWord } from "../utils";

export interface InstructionCtx {
  regs: RegisterFile;
  memory: Memory;
  interruptFlags: InterruptFlags;
}

export type Instruction = [string, (ctx: InstructionCtx) => number];

export function fetchImmediateByte(ctx: InstructionCtx) {
  let pc = ctx.regs.readPair(RegisterPair.PC);
  const data = ctx.memory.read(pc);
  ctx.regs.writePair(RegisterPair.PC, incrementWord(pc));
  return data;
}

export function fetchImmediateWord(ctx: InstructionCtx) {
  let lowByte = fetchImmediateByte(ctx);
  let highByte = fetchImmediateByte(ctx);
  return makeWord(highByte, lowByte);
}
