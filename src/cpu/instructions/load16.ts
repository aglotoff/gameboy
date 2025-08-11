import { getLSB, getMSB, makeWord, wrappingIncrementWord } from "../../utils";
import { RegisterPair } from "../cpu-state";
import { Flag, Register } from "../register";

import {
  addBytes,
  makeInstruction,
  makeInstructionWithImmediateByte,
  makeInstructionWithImmediateWord,
  isNegative,
} from "./lib";

export const loadRegisterPair = makeInstructionWithImmediateWord(
  (ctx, data, dst: RegisterPair) => {
    ctx.writeRegisterPair(dst, data);
  }
);

export const loadDirectFromStackPointer = makeInstructionWithImmediateWord(
  (ctx, address) => {
    ctx.writeMemoryCycle(address, ctx.readRegister(Register.SP_L));
    ctx.writeMemoryCycle(address + 1, ctx.readRegister(Register.SP_H));
  }
);

export const loadStackPointerFromHL = makeInstruction((ctx) => {
  ctx.writeRegisterPair(RegisterPair.SP, ctx.readRegisterPair(RegisterPair.HL));
  ctx.beginNextCycle();
});

export const pushToStack = makeInstruction((ctx, pair: RegisterPair) => {
  const data = ctx.readRegisterPair(pair);

  let sp = ctx.readRegisterPair(RegisterPair.SP);

  ctx.writeRegisterPair(RegisterPair.SP, ctx.decrementAndTriggerWrite(sp));

  ctx.beginNextCycle();

  sp = ctx.readRegisterPair(RegisterPair.SP);

  ctx.writeRegisterPair(RegisterPair.SP, ctx.decrementAndTriggerWrite(sp));

  ctx.writeMemoryCycle(sp, getMSB(data));

  sp = ctx.readRegisterPair(RegisterPair.SP);
  ctx.writeMemoryCycle(sp, getLSB(data));
});

export const popFromStack = makeInstruction((ctx, pair: RegisterPair) => {
  let sp = ctx.readRegisterPair(RegisterPair.SP);

  ctx.writeRegisterPair(RegisterPair.SP, ctx.incrementAndTriggerReadWrite(sp));

  const lsb = ctx.readMemoryCycle(sp);

  sp = ctx.readRegisterPair(RegisterPair.SP);

  ctx.writeRegisterPair(RegisterPair.SP, wrappingIncrementWord(sp));
  // do not trigger OAM corruption bug this time!

  const msb = ctx.readMemoryCycle(sp);

  ctx.writeRegisterPair(pair, makeWord(msb, lsb));
});

export const loadHLFromAdjustedStackPointer = makeInstructionWithImmediateByte(
  (ctx, offset) => {
    const {
      result: lsb,
      carryFrom3,
      carryFrom7,
    } = addBytes(ctx.readRegister(Register.SP_L), offset);

    ctx.writeRegister(Register.L, lsb);

    ctx.setFlag(Flag.Z, false);
    ctx.setFlag(Flag.N, false);
    ctx.setFlag(Flag.H, carryFrom3);
    ctx.setFlag(Flag.CY, carryFrom7);

    ctx.beginNextCycle();

    const { result: msb } = addBytes(
      ctx.readRegister(Register.SP_H),
      isNegative(offset) ? 0xff : 0x00,
      carryFrom7
    );

    ctx.writeRegister(Register.H, msb);
  }
);
