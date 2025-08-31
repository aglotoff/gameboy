import { Flag, Register, RegisterPair } from "../register";
import {
  getLSB,
  getMSB,
  makeWord,
  wrappingDecrementByte,
  wrappingIncrementByte,
  wrappingIncrementWord,
} from "../../utils";

import {
  addBytes,
  makeInstruction,
  makeInstructionWithImmediateByte,
  makeInstructionWithImmediateWord,
  isNegative,
  readMemoryCycle,
  writeMemoryCycle,
  decrementAndTriggerWrite,
  incrementAndTriggerReadWrite,
  Condition,
  InstructionContext,
} from "./lib";

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#JP_n16
export const jumpToAddress = makeInstructionWithImmediateWord(
  (ctx, address) => {
    ctx.registers.writePair(RegisterPair.PC, address);
    ctx.state.beginNextCycle();
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#JP_HL
export const jumpToAddressInHL = makeInstruction((ctx) => {
  const address = ctx.registers.readPair(RegisterPair.HL);
  ctx.registers.writePair(RegisterPair.PC, address);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#JR_cc,n16
export const jumpToAddressConditionally = makeInstructionWithImmediateWord(
  (ctx, address, condition: Condition) => {
    // FIXME: condition check is performed during M3
    if (checkCondition(ctx, condition)) {
      ctx.registers.writePair(RegisterPair.PC, address);
      ctx.state.beginNextCycle();
    }
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#JR_n16
export const jumpToRelative = makeInstructionWithImmediateByte(jump);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#JR_cc,n16
export const jumpToRelativeConditionally = makeInstructionWithImmediateByte(
  (ctx, offset, condition: Condition) => {
    // FIXME: condition check is performed during M2
    if (checkCondition(ctx, condition)) {
      jump(ctx, offset);
    }
  }
);

function jump(ctx: InstructionContext, offset: number) {
  const isOffsetNegative = isNegative(offset);

  const { result: lsb, carryFrom7 } = addBytes(
    ctx.registers.read(Register.PC_L),
    offset
  );

  let msb = ctx.registers.read(Register.PC_H);

  if (carryFrom7 && !isOffsetNegative) {
    msb = wrappingIncrementByte(msb);
  } else if (!carryFrom7 && isOffsetNegative) {
    msb = wrappingDecrementByte(msb);
  }

  ctx.state.beginNextCycle();

  ctx.registers.writePair(RegisterPair.PC, makeWord(msb, lsb));
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#CALL_n16
export const callFunction = makeInstructionWithImmediateWord(call);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#CALL_cc,n16
export const callFunctionConditionally = makeInstructionWithImmediateWord(
  (ctx, address, condition: Condition) => {
    // FIXME: condition check is performed during M3
    if (checkCondition(ctx, condition)) {
      call(ctx, address);
    }
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RST_vec
export const restartFunction = makeInstruction(
  (ctx, lowAddressByte: number) => {
    call(ctx, makeWord(0x00, lowAddressByte));
  }
);

function call(ctx: InstructionContext, address: number) {
  const data = ctx.registers.readPair(RegisterPair.PC);

  let sp = ctx.registers.readPair(RegisterPair.SP);

  ctx.registers.writePair(RegisterPair.SP, decrementAndTriggerWrite(ctx, sp));

  ctx.state.beginNextCycle();

  sp = ctx.registers.readPair(RegisterPair.SP);

  ctx.registers.writePair(RegisterPair.SP, decrementAndTriggerWrite(ctx, sp));
  writeMemoryCycle(ctx, sp, getMSB(data));

  ctx.registers.writePair(RegisterPair.PC, address);

  sp = ctx.registers.readPair(RegisterPair.SP);
  writeMemoryCycle(ctx, sp, getLSB(data));
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RET
export const returnFromFunction = makeInstruction(doReturn);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RET_cc
export const returnFromFunctionConditionally = makeInstruction(
  (ctx, condition: Condition) => {
    const isConditionTrue = checkCondition(ctx, condition);

    ctx.state.beginNextCycle();

    if (isConditionTrue) {
      doReturn(ctx);
    }
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RETI
export const returnFromInterruptHandler = makeInstruction((ctx) => {
  doReturn(ctx);
  ctx.state.setInterruptMasterEnable(true);
});

function doReturn(ctx: InstructionContext) {
  let sp = ctx.registers.readPair(RegisterPair.SP);

  ctx.registers.writePair(
    RegisterPair.SP,
    incrementAndTriggerReadWrite(ctx, sp)
  );

  const lsb = readMemoryCycle(ctx, sp);

  sp = ctx.registers.readPair(RegisterPair.SP);

  ctx.registers.writePair(RegisterPair.SP, wrappingIncrementWord(sp));
  // do not trigger OAM corruption bug this time!

  const msb = readMemoryCycle(ctx, sp);

  ctx.registers.writePair(RegisterPair.PC, makeWord(msb, lsb));

  ctx.state.beginNextCycle();
}

function checkCondition(ctx: InstructionContext, condition: Condition) {
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
