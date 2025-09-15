import {
  Flag,
  getHighRegisterOfPair,
  getLowRegisterOfPair,
  Register,
  RegisterPair,
} from "../register";
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

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#INC_r16
// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#INC_SP
export const incrementRegisterPair = makeInstruction(
  (ctx, pair: RegisterPair) => {
    const data = ctx.registers.readPair(pair);

    ctx.registers.writePair(pair, wrappingIncrementWord(data));
    ctx.memory.triggerWrite(data);

    ctx.state.beginNextCycle();
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#DEC_r16
// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#DEC_SP
export const decrementRegisterPair = makeInstruction(
  (ctx, pair: RegisterPair) => {
    const data = ctx.registers.readPair(pair);

    ctx.registers.writePair(pair, wrappingDecrementWord(data));
    ctx.memory.triggerWrite(data);

    ctx.state.beginNextCycle();
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#ADD_HL,r16
// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#ADD_HL,SP
export const addRegisterPair = makeInstruction((ctx, pair: RegisterPair) => {
  const lsb1 = ctx.registers.read(Register.L);
  const lsb2 = ctx.registers.read(getLowRegisterOfPair(pair));

  const { result: lsbResult, carryFrom3, carryFrom7 } = addBytes(lsb1, lsb2);

  ctx.registers.write(Register.L, lsbResult);
  ctx.registers.setFlag(Flag.N, false);
  ctx.registers.setFlag(Flag.H, carryFrom3);
  ctx.registers.setFlag(Flag.CY, carryFrom7);

  ctx.state.beginNextCycle();

  const msb1 = ctx.registers.read(Register.H);
  const msb2 = ctx.registers.read(getHighRegisterOfPair(pair));

  const {
    result: msbResult,
    carryFrom3: carryFrom11,
    carryFrom7: carryFrom15,
  } = addBytes(msb1, msb2, carryFrom7);

  ctx.registers.write(Register.H, msbResult);
  ctx.registers.setFlag(Flag.N, false);
  ctx.registers.setFlag(Flag.H, carryFrom11);
  ctx.registers.setFlag(Flag.CY, carryFrom15);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#ADD_SP,e8
export const addOffsetToStackPointer = makeInstructionWithImmediateByte(
  (ctx, offset) => {
    const lsb = ctx.registers.read(Register.SP_L);

    const { result: resultLsb, carryFrom3, carryFrom7 } = addBytes(lsb, offset);

    ctx.registers.setFlag(Flag.Z, false);
    ctx.registers.setFlag(Flag.N, false);
    ctx.registers.setFlag(Flag.H, carryFrom3);
    ctx.registers.setFlag(Flag.CY, carryFrom7);

    ctx.state.beginNextCycle();

    const msb1 = ctx.registers.read(Register.SP_H);
    const msb2 = isNegative(offset) ? 0xff : 0x00;

    const { result: resultMsb } = addBytes(msb1, msb2, carryFrom7);

    ctx.state.beginNextCycle();

    const result = makeWord(resultMsb, resultLsb);
    ctx.registers.writePair(RegisterPair.SP, result);
  }
);
