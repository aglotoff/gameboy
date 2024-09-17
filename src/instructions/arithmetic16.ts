import { RegisterPair, Flag } from "../cpu";
import { incrementWord, addWords, addSignedByteToWord } from "../utils";
import { InstructionCtx, fetchImmediateByte } from "./lib";

export function incrementRegisterPair(ctx: InstructionCtx, rr: RegisterPair) {
  ctx.regs.writePair(rr, incrementWord(ctx.regs.readPair(rr)));
  return 8;
}

export function decrementRegisterPair(ctx: InstructionCtx, rr: RegisterPair) {
  ctx.regs.writePair(rr, ctx.regs.readPair(rr) - 1);
  return 8;
}

export function addRegisterPair(ctx: InstructionCtx, rr: RegisterPair) {
  const { result, carryFrom11, carryFrom15 } = addWords(
    ctx.regs.readPair(RegisterPair.HL),
    ctx.regs.readPair(rr)
  );

  ctx.regs.writePair(RegisterPair.HL, result);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, carryFrom11);
  ctx.regs.setFlag(Flag.CY, carryFrom15);

  return 8;
}

export function addToStackPointer(ctx: InstructionCtx) {
  const e = fetchImmediateByte(ctx);
  const { result, carryFrom3, carryFrom7 } = addSignedByteToWord(
    ctx.regs.readPair(RegisterPair.SP),
    e
  );
  ctx.regs.writePair(RegisterPair.SP, result);
  ctx.regs.setFlag(Flag.Z, false);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, carryFrom3);
  ctx.regs.setFlag(Flag.CY, carryFrom7);
  return 16;
}
