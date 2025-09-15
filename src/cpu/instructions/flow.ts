import { InstructionContext } from "../cpu-state";
import { Register, RegisterPair } from "../register";
import {
  makeWord,
  wrappingDecrementByte,
  wrappingIncrementByte,
} from "../../utils";
import {
  addBytes,
  makeInstruction,
  makeInstructionWithImmediateByte,
  makeInstructionWithImmediateWord,
  isNegative,
  checkCondition,
  Condition,
  pushWord,
  popWord,
} from "./lib";

export const jump = makeInstructionWithImmediateWord((ctx, address) => {
  ctx.registers.writePair(RegisterPair.PC, address);
  ctx.state.beginNextCycle();
});

export const jumpToHL = makeInstruction((ctx) => {
  ctx.registers.writePair(
    RegisterPair.PC,
    ctx.registers.readPair(RegisterPair.HL)
  );
});

export const jumpConditional = makeInstructionWithImmediateWord(
  (ctx, address, condition: Condition) => {
    // FIXME: condition check is performed during M3
    if (!checkCondition(ctx, condition)) {
      return;
    }

    ctx.registers.writePair(RegisterPair.PC, address);

    ctx.state.beginNextCycle();
  }
);

export const relativeJump = makeInstructionWithImmediateByte(doRelativeJump);

export const relativeJumpConditional = makeInstructionWithImmediateByte(
  (ctx, offset, condition: Condition) => {
    // FIXME: condition check is performed during M2
    if (checkCondition(ctx, condition)) {
      doRelativeJump(ctx, offset);
    }
  }
);

function doRelativeJump(ctx: InstructionContext, offset: number) {
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

export const callFunction = makeInstructionWithImmediateWord(doCallFunction);

export const callFunctionConditional = makeInstructionWithImmediateWord(
  (ctx, address, condition: Condition) => {
    // FIXME: condition check is performed during M3
    if (checkCondition(ctx, condition)) {
      doCallFunction(ctx, address);
    }
  }
);

export const restartFunction = makeInstruction(
  (ctx, lowAddressByte: number) => {
    doCallFunction(ctx, makeWord(0x00, lowAddressByte));
  }
);

function doCallFunction(ctx: InstructionContext, address: number) {
  pushWord(ctx, ctx.registers.readPair(RegisterPair.PC));

  ctx.registers.writePair(RegisterPair.PC, address);

  ctx.state.beginNextCycle();
}

export const returnFromFunction = makeInstruction((ctx) => {
  doReturn(ctx);
});

export const returnFromFunctionConditional = makeInstruction(
  (ctx, condition: Condition) => {
    const result = checkCondition(ctx, condition);

    ctx.state.beginNextCycle();

    if (result) {
      doReturn(ctx);
    }
  }
);

export const returnFromInterruptHandler = makeInstruction((ctx) => {
  doReturn(ctx);
  ctx.state.setInterruptMasterEnable(true);
});

function doReturn(ctx: InstructionContext) {
  ctx.registers.writePair(RegisterPair.PC, popWord(ctx));
  ctx.state.beginNextCycle();
}
