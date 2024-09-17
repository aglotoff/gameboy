import { Flag, RegisterPair } from "../cpu";
import {
  addSignedByteToWord,
  decrementWord,
  getLSB,
  getMSB,
  incrementWord,
  makeWord,
} from "../utils";
import { fetchImmediateByte, fetchImmediateWord, InstructionCtx } from "./lib";

export function loadRegisterPair(
  ctx: InstructionCtx,
  destination: RegisterPair
) {
  const data = fetchImmediateWord(ctx);
  ctx.regs.writePair(destination, data);
  return 12;
}

export function loadDirectFromStackPointer(ctx: InstructionCtx) {
  const address = fetchImmediateWord(ctx);
  const data = ctx.regs.readPair(RegisterPair.SP);
  ctx.memory.write(address, getLSB(data));
  ctx.memory.write(address + 1, getMSB(data));
  return 20;
}

export function loadStackPointerFromHL(ctx: InstructionCtx) {
  ctx.regs.writePair(RegisterPair.SP, ctx.regs.readPair(RegisterPair.HL));
  return 8;
}

export function pushToStack(ctx: InstructionCtx, rr: RegisterPair) {
  const data = ctx.regs.readPair(rr);
  let sp = ctx.regs.readPair(RegisterPair.SP);
  sp = decrementWord(sp);
  ctx.memory.write(sp, getMSB(data));
  sp = decrementWord(sp);
  ctx.memory.write(sp, getLSB(data));
  ctx.regs.writePair(RegisterPair.SP, sp);
  return 16;
}

export function popFromStack(ctx: InstructionCtx, rr: RegisterPair) {
  let sp = ctx.regs.readPair(RegisterPair.SP);
  const lsb = ctx.memory.read(sp);
  sp = incrementWord(sp);
  const msb = ctx.memory.read(sp);
  sp = incrementWord(sp);
  ctx.regs.writePair(rr, makeWord(msb, lsb));
  ctx.regs.writePair(RegisterPair.SP, sp);
  return 12;
}

export function loadHLFromAdjustedStackPointer(ctx: InstructionCtx) {
  const e = fetchImmediateByte(ctx);
  const { result, carryFrom3, carryFrom7 } = addSignedByteToWord(
    ctx.regs.readPair(RegisterPair.SP),
    e
  );
  ctx.regs.writePair(RegisterPair.HL, result);
  ctx.regs.setFlag(Flag.Z, false);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, carryFrom3);
  ctx.regs.setFlag(Flag.CY, carryFrom7);
  return 12;
}
