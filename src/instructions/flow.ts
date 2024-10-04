import { checkCondition, Condition, RegisterPair } from "../cpu";
import { addSignedByteToWord, getLSB, getMSB, makeWord } from "../utils";
import { fetchImmediateByte, fetchImmediateWord, InstructionCtx } from "./lib";

export function jump(ctx: InstructionCtx) {
  const address = fetchImmediateWord(ctx);
  ctx.regs.writePair(RegisterPair.PC, address);
  return 16;
}

export function jumpToHL(ctx: InstructionCtx) {
  ctx.regs.writePair(RegisterPair.PC, ctx.regs.readPair(RegisterPair.HL));
  return 4;
}

export function jumpConditional(ctx: InstructionCtx, condition: Condition) {
  const address = fetchImmediateWord(ctx);

  if (checkCondition(ctx.regs, condition)) {
    ctx.regs.writePair(RegisterPair.PC, address);
    return 16;
  }

  return 12;
}

export function relativeJump(ctx: InstructionCtx) {
  const offset = fetchImmediateByte(ctx);

  const { result } = addSignedByteToWord(
    ctx.regs.readPair(RegisterPair.PC),
    offset
  );
  ctx.regs.writePair(RegisterPair.PC, result);

  return 12;
}

export function relativeJumpConditional(
  ctx: InstructionCtx,
  condition: Condition
) {
  const offset = fetchImmediateByte(ctx);

  if (checkCondition(ctx.regs, condition)) {
    const { result } = addSignedByteToWord(
      ctx.regs.readPair(RegisterPair.PC),
      offset
    );
    ctx.regs.writePair(RegisterPair.PC, result);
    return 12;
  }

  return 8;
}

export function callFunction(ctx: InstructionCtx) {
  const address = fetchImmediateWord(ctx);

  const pc = ctx.regs.readPair(RegisterPair.PC);
  let sp = ctx.regs.readPair(RegisterPair.SP);

  sp -= 1;
  ctx.memory.write(sp, getMSB(pc));
  sp -= 1;
  ctx.memory.write(sp, getLSB(pc));

  ctx.regs.writePair(RegisterPair.SP, sp);
  ctx.regs.writePair(RegisterPair.PC, address);

  return 24;
}

export function callFunctionConditional(
  ctx: InstructionCtx,
  condition: Condition
) {
  const address = fetchImmediateWord(ctx);

  if (checkCondition(ctx.regs, condition)) {
    const pc = ctx.regs.readPair(RegisterPair.PC);
    let sp = ctx.regs.readPair(RegisterPair.SP);

    sp -= 1;
    ctx.memory.write(sp, getMSB(pc));
    sp -= 1;
    ctx.memory.write(sp, getLSB(pc));

    ctx.regs.writePair(RegisterPair.SP, sp);
    ctx.regs.writePair(RegisterPair.PC, address);

    return 24;
  }

  return 12;
}

export function returnFromFunction(ctx: InstructionCtx) {
  let sp = ctx.regs.readPair(RegisterPair.SP);

  const lsb = ctx.memory.read(sp);
  sp += 1;
  const msb = ctx.memory.read(sp);
  sp += 1;

  ctx.regs.writePair(RegisterPair.SP, sp);
  ctx.regs.writePair(RegisterPair.PC, makeWord(msb, lsb));

  return 16;
}

export function returnFromFunctionConditional(
  ctx: InstructionCtx,
  condition: Condition
) {
  if (!checkCondition(ctx.regs, condition)) {
    return 8;
  }

  let sp = ctx.regs.readPair(RegisterPair.SP);

  const lsb = ctx.memory.read(sp);
  sp += 1;
  const msb = ctx.memory.read(sp);
  sp += 1;

  ctx.regs.writePair(RegisterPair.SP, sp);
  ctx.regs.writePair(RegisterPair.PC, makeWord(msb, lsb));

  return 20;
}

export function returnFromInterruptHandler(ctx: InstructionCtx) {
  let sp = ctx.regs.readPair(RegisterPair.SP);

  const lsb = ctx.memory.read(sp);
  sp += 1;
  const msb = ctx.memory.read(sp);
  sp += 1;

  ctx.regs.writePair(RegisterPair.SP, sp);
  ctx.regs.writePair(RegisterPair.PC, makeWord(msb, lsb));

  ctx.interruptFlags.masterEnable();

  return 16;
}

export function restartFunction(ctx: InstructionCtx, address: number) {
  const pc = ctx.regs.readPair(RegisterPair.PC);
  let sp = ctx.regs.readPair(RegisterPair.SP);

  sp -= 1;
  ctx.memory.write(sp, getMSB(pc));
  sp -= 1;
  ctx.memory.write(sp, getLSB(pc));

  ctx.regs.writePair(RegisterPair.SP, sp);
  ctx.regs.writePair(RegisterPair.PC, makeWord(0x00, address));

  return 16;
}
