import { InstructionContext } from "../cpu-state";
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
} from "./lib";

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#JP_n16
export const jumpToAddress = makeInstructionWithImmediateWord(
  (ctx, address) => {
    ctx.writeRegisterPair(RegisterPair.PC, address);
    ctx.beginNextCycle();
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#JP_HL
export const jumpToAddressInHL = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  ctx.writeRegisterPair(RegisterPair.PC, address);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#JR_cc,n16
export const jumpToAddressConditionally = makeInstructionWithImmediateWord(
  (ctx, address, condition: Condition) => {
    // FIXME: condition check is performed during M3
    if (checkCondition(ctx, condition)) {
      ctx.writeRegisterPair(RegisterPair.PC, address);
      ctx.beginNextCycle();
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
    ctx.readRegister(Register.PC_L),
    offset
  );

  let msb = ctx.readRegister(Register.PC_H);

  if (carryFrom7 && !isOffsetNegative) {
    msb = wrappingIncrementByte(msb);
  } else if (!carryFrom7 && isOffsetNegative) {
    msb = wrappingDecrementByte(msb);
  }

  ctx.beginNextCycle();

  ctx.writeRegisterPair(RegisterPair.PC, makeWord(msb, lsb));
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
  const data = ctx.readRegisterPair(RegisterPair.PC);

  let sp = ctx.readRegisterPair(RegisterPair.SP);

  ctx.writeRegisterPair(RegisterPair.SP, ctx.decrementAndTriggerWrite(sp));

  ctx.beginNextCycle();

  sp = ctx.readRegisterPair(RegisterPair.SP);

  ctx.writeRegisterPair(RegisterPair.SP, ctx.decrementAndTriggerWrite(sp));
  ctx.writeMemoryCycle(sp, getMSB(data));

  ctx.writeRegisterPair(RegisterPair.PC, address);

  sp = ctx.readRegisterPair(RegisterPair.SP);
  ctx.writeMemoryCycle(sp, getLSB(data));
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RET
export const returnFromFunction = makeInstruction(doReturn);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RET_cc
export const returnFromFunctionConditionally = makeInstruction(
  (ctx, condition: Condition) => {
    const isConditionTrue = checkCondition(ctx, condition);

    ctx.beginNextCycle();

    if (isConditionTrue) {
      doReturn(ctx);
    }
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#RETI
export const returnFromInterruptHandler = makeInstruction((ctx) => {
  doReturn(ctx);
  ctx.setInterruptMasterEnable(true);
});

function doReturn(ctx: InstructionContext) {
  let sp = ctx.readRegisterPair(RegisterPair.SP);

  ctx.writeRegisterPair(RegisterPair.SP, ctx.incrementAndTriggerReadWrite(sp));

  const lsb = ctx.readMemoryCycle(sp);

  sp = ctx.readRegisterPair(RegisterPair.SP);

  ctx.writeRegisterPair(RegisterPair.SP, wrappingIncrementWord(sp));
  // do not trigger OAM corruption bug this time!

  const msb = ctx.readMemoryCycle(sp);

  ctx.writeRegisterPair(RegisterPair.PC, makeWord(msb, lsb));

  ctx.beginNextCycle();
}

export const enum Condition {
  Z,
  C,
  NZ,
  NC,
}

function checkCondition(ctx: InstructionContext, condition: Condition) {
  switch (condition) {
    case Condition.Z:
      return ctx.getFlag(Flag.Z);
    case Condition.C:
      return ctx.getFlag(Flag.CY);
    case Condition.NZ:
      return !ctx.getFlag(Flag.Z);
    case Condition.NC:
      return !ctx.getFlag(Flag.CY);
  }
}
