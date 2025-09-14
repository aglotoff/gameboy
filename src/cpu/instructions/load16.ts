import { Flag, Register, RegisterPair } from "../register";

import {
  addBytes,
  makeInstruction,
  makeInstructionWithImmediateByte,
  makeInstructionWithImmediateWord,
  isNegative,
  pushWord,
  popWord,
} from "./lib";

export const loadRegisterPair = makeInstructionWithImmediateWord(
  (ctx, data, dst: RegisterPair) => {
    ctx.writeRegisterPair(dst, data);
  }
);

export const loadDirectFromStackPointer = makeInstructionWithImmediateWord(
  (ctx, address) => {
    ctx.writeMemory(address, ctx.readRegister(Register.SP_L));
    ctx.beginNextCycle();
    ctx.writeMemory(address + 1, ctx.readRegister(Register.SP_H));
    ctx.beginNextCycle();
  }
);

export const loadStackPointerFromHL = makeInstruction((ctx) => {
  ctx.writeRegisterPair(RegisterPair.SP, ctx.readRegisterPair(RegisterPair.HL));
  ctx.beginNextCycle();
});

export const pushToStack = makeInstruction((ctx, pair: RegisterPair) => {
  pushWord(ctx, ctx.readRegisterPair(pair));
  ctx.beginNextCycle();
});

export const popFromStack = makeInstruction((ctx, pair: RegisterPair) => {
  ctx.writeRegisterPair(pair, popWord(ctx));
});

export const loadHLFromAdjustedStackPointer = makeInstructionWithImmediateByte(
  (ctx, e) => {
    const {
      result: lsb,
      carryFrom3,
      carryFrom7,
    } = addBytes(ctx.readRegister(Register.SP_L), e);

    ctx.writeRegister(Register.L, lsb);

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

    ctx.writeRegister(Register.H, msb);
  }
);
