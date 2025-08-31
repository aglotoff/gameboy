import { getLSB, getMSB, makeWord, wrappingIncrementWord } from "../../utils";
import { Flag, Register, RegisterPair } from "../register";

import {
  addBytes,
  makeInstruction,
  makeInstructionWithImmediateByte,
  makeInstructionWithImmediateWord,
  isNegative,
} from "./lib";

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#LD_r16,n16
export const loadRegisterPair = makeInstructionWithImmediateWord(
  (ctx, data, dst: RegisterPair) => {
    ctx.writeRegisterPair(dst, data);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#LD__n16_,SP
export const loadDirectFromStackPointer = makeInstructionWithImmediateWord(
  (ctx, address) => {
    ctx.writeMemoryCycle(address, ctx.readRegister(Register.SP_L));
    ctx.writeMemoryCycle(address + 1, ctx.readRegister(Register.SP_H));
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#LD_SP,HL
export const loadStackPointerFromHL = makeInstruction((ctx) => {
  const data = ctx.readRegisterPair(RegisterPair.HL);
  ctx.writeRegisterPair(RegisterPair.SP, data);

  ctx.beginNextCycle();
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#PUSH_r16
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

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#POP_r16
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

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#LD_HL,SP+e8
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
