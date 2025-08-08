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

export const incrementRegisterPair = makeInstruction(
  (ctx, pair: RegisterPair) => {
    ctx.triggerMemoryWrite(ctx.readRegisterPair(pair));

    ctx.writeRegisterPair(
      pair,
      wrappingIncrementWord(ctx.readRegisterPair(pair))
    );

    ctx.beginNextCycle();
  }
);

export const decrementRegisterPair = makeInstruction(
  (ctx, pair: RegisterPair) => {
    ctx.triggerMemoryWrite(ctx.readRegisterPair(pair));

    ctx.writeRegisterPair(
      pair,
      wrappingDecrementWord(ctx.readRegisterPair(pair))
    );

    ctx.beginNextCycle();
  }
);

export const addRegisterPair = makeInstruction((ctx, pair: RegisterPair) => {
  const {
    result: lsb,
    carryFrom3,
    carryFrom7,
  } = addBytes(ctx.readRegister(Register.L), ctx.readLowRegisterOfPair(pair));

  ctx.writeRegister(Register.L, lsb);

  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, carryFrom3);
  ctx.setFlag(Flag.CY, carryFrom7);

  ctx.beginNextCycle();

  const {
    result: msb,
    carryFrom3: carryFrom11,
    carryFrom7: carryFrom15,
  } = addBytes(
    ctx.readRegister(Register.H),
    ctx.readHighRegisterOfPair(pair),
    carryFrom7
  );

  ctx.writeRegister(Register.H, msb);

  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, carryFrom11);
  ctx.setFlag(Flag.CY, carryFrom15);
});

export const addToStackPointer = makeInstructionWithImmediateByte((ctx, e) => {
  const {
    result: lsb,
    carryFrom3,
    carryFrom7,
  } = addBytes(ctx.readRegister(Register.SP_L), e);

  ctx.setFlag(Flag.Z, false);
  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, carryFrom3);
  ctx.setFlag(Flag.CY, carryFrom7);

  ctx.beginNextCycle();

  const { result: msb } = addBytes(
    ctx.readRegister(Register.SP_H),
    isNegative(e) ? 0xff : 0x00,
    carryFrom7
  );

  ctx.beginNextCycle();

  ctx.writeRegisterPair(RegisterPair.SP, makeWord(msb, lsb));
});
