import { checkCondition, Condition, RegisterPair } from "../regs";
import {
  addSignedByteToWord,
  wrapDecrementWord,
  getLSB,
  getMSB,
  wrapIncrementWord,
  makeWord,
} from "../utils";
import {
  instruction,
  InstructionCtx,
  instructionWithImmediateByte,
  instructionWithImmediateWord,
} from "./lib";

export const jump = instructionWithImmediateWord(({ cpu }, address) => {
  cpu.regs.writePair(RegisterPair.PC, address);
  return 16;
});

export const jumpToHL = instruction(({ cpu }) => {
  cpu.regs.writePair(RegisterPair.PC, cpu.regs.readPair(RegisterPair.HL));
  return 4;
});

export const jumpConditional = instructionWithImmediateWord(
  ({ cpu }, address, condition: Condition) => {
    if (!checkCondition(cpu.regs, condition)) {
      return 12;
    }

    cpu.regs.writePair(RegisterPair.PC, address);

    return 16;
  }
);

export const relativeJump = instructionWithImmediateByte(({ cpu }, offset) => {
  const { result } = addSignedByteToWord(
    cpu.regs.readPair(RegisterPair.PC),
    offset
  );

  cpu.regs.writePair(RegisterPair.PC, result);

  return 12;
});

export const relativeJumpConditional = instructionWithImmediateByte(
  ({ cpu }, offset, condition: Condition) => {
    if (!checkCondition(cpu.regs, condition)) {
      return 8;
    }

    const { result } = addSignedByteToWord(
      cpu.regs.readPair(RegisterPair.PC),
      offset
    );

    cpu.regs.writePair(RegisterPair.PC, result);

    return 12;
  }
);

export const callFunction = instructionWithImmediateWord((ctx, address) => {
  pushProgramCounter(ctx);
  ctx.cpu.regs.writePair(RegisterPair.PC, address);

  return 24;
});

export const callFunctionConditional = instructionWithImmediateWord(
  (ctx, address, condition: Condition) => {
    if (!checkCondition(ctx.cpu.regs, condition)) {
      return 12;
    }

    pushProgramCounter(ctx);
    ctx.cpu.regs.writePair(RegisterPair.PC, address);

    return 24;
  }
);

export const returnFromFunction = instruction((ctx) => {
  popProgramCounter(ctx);
  return 16;
});

export const returnFromFunctionConditional = instruction(
  (ctx, condition: Condition) => {
    if (!checkCondition(ctx.cpu.regs, condition)) {
      return 8;
    }

    popProgramCounter(ctx);

    return 20;
  }
);

export const returnFromInterruptHandler = instruction((ctx) => {
  popProgramCounter(ctx);

  console.log("IME = true");
  ctx.cpu.ime = true;

  return 16;
});

function popProgramCounter({ cpu, memory }: InstructionCtx) {
  let sp = cpu.regs.readPair(RegisterPair.SP);

  const lsb = memory.read(sp);
  sp = wrapIncrementWord(sp);
  const msb = memory.read(sp);
  sp = wrapIncrementWord(sp);

  cpu.regs.writePair(RegisterPair.SP, sp);
  cpu.regs.writePair(RegisterPair.PC, makeWord(msb, lsb));
}

export const restartFunction = instruction((ctx, address: number) => {
  pushProgramCounter(ctx);

  ctx.cpu.regs.writePair(RegisterPair.PC, makeWord(0x00, address));

  return 16;
});

function pushProgramCounter({ cpu, memory }: InstructionCtx) {
  const pc = cpu.regs.readPair(RegisterPair.PC);
  let sp = cpu.regs.readPair(RegisterPair.SP);

  sp = wrapDecrementWord(sp);
  memory.write(sp, getMSB(pc));
  sp = wrapDecrementWord(sp);
  memory.write(sp, getLSB(pc));

  cpu.regs.writePair(RegisterPair.SP, sp);
}
