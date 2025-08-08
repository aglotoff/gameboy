import { Flag, Register } from "../register";
import {
  makeWord,
  wrappingDecrementWord,
  wrappingIncrementWord,
} from "../../utils";
import {
  addBytes,
  makeInstruction,
  makeInstructionWithImmediateByte,
  isNegative,
} from "./lib";
import { RegisterPair } from "../cpu-state";

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#INC_r16
// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#INC_SP
export const incrementRegisterPair = makeInstruction(
  (ctx, pair: RegisterPair) => {
    const data = ctx.readRegisterPair(pair);

    ctx.writeRegisterPair(pair, wrappingIncrementWord(data));
    ctx.triggerMemoryWrite(data);

    ctx.beginNextCycle();
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#DEC_r16
// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#DEC_SP
export const decrementRegisterPair = makeInstruction(
  (ctx, pair: RegisterPair) => {
    const data = ctx.readRegisterPair(pair);

    ctx.writeRegisterPair(pair, wrappingDecrementWord(data));
    ctx.triggerMemoryWrite(data);

    ctx.beginNextCycle();
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#ADD_HL,r16
// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#ADD_HL,SP
export const addRegisterPair = makeInstruction((ctx, pair: RegisterPair) => {
  const lsb1 = ctx.readRegister(Register.L);
  const lsb2 = ctx.readLowRegisterOfPair(pair);

  const { result: lsbResult, carryFrom3, carryFrom7 } = addBytes(lsb1, lsb2);

  ctx.writeRegister(Register.L, lsbResult);
  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, carryFrom3);
  ctx.setFlag(Flag.CY, carryFrom7);

  ctx.beginNextCycle();

  const msb1 = ctx.readRegister(Register.H);
  const msb2 = ctx.readHighRegisterOfPair(pair);

  const {
    result: msbResult,
    carryFrom3: carryFrom11,
    carryFrom7: carryFrom15,
  } = addBytes(msb1, msb2, carryFrom7);

  ctx.writeRegister(Register.H, msbResult);
  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, carryFrom11);
  ctx.setFlag(Flag.CY, carryFrom15);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#ADD_SP,e8
export const addOffsetToStackPointer = makeInstructionWithImmediateByte(
  (ctx, offset) => {
    const lsb = ctx.readRegister(Register.SP_L);

    const { result: resultLsb, carryFrom3, carryFrom7 } = addBytes(lsb, offset);

    ctx.setFlag(Flag.Z, false);
    ctx.setFlag(Flag.N, false);
    ctx.setFlag(Flag.H, carryFrom3);
    ctx.setFlag(Flag.CY, carryFrom7);

    ctx.beginNextCycle();

    const msb1 = ctx.readRegister(Register.SP_H);
    const msb2 = isNegative(offset) ? 0xff : 0x00;

    const { result: resultMsb } = addBytes(msb1, msb2, carryFrom7);

    ctx.beginNextCycle();

    const result = makeWord(resultMsb, resultLsb);
    ctx.writeRegisterPair(RegisterPair.SP, result);
  }
);
