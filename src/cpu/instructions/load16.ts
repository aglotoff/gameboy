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
    ctx.registers.writePair(dst, data);
  }
);

export const loadDirectFromStackPointer = makeInstructionWithImmediateWord(
  (ctx, address) => {
    ctx.memory.write(address, ctx.registers.read(Register.SP_L));
    ctx.state.beginNextCycle();
    ctx.memory.write(address + 1, ctx.registers.read(Register.SP_H));
    ctx.state.beginNextCycle();
  }
);

export const loadStackPointerFromHL = makeInstruction((ctx) => {
  ctx.registers.writePair(
    RegisterPair.SP,
    ctx.registers.readPair(RegisterPair.HL)
  );
  ctx.state.beginNextCycle();
});

export const pushToStack = makeInstruction((ctx, pair: RegisterPair) => {
  pushWord(ctx, ctx.registers.readPair(pair));
  ctx.state.beginNextCycle();
});

export const popFromStack = makeInstruction((ctx, pair: RegisterPair) => {
  ctx.registers.writePair(pair, popWord(ctx));
});

export const loadHLFromAdjustedStackPointer = makeInstructionWithImmediateByte(
  (ctx, e) => {
    const {
      result: lsb,
      carryFrom3,
      carryFrom7,
    } = addBytes(ctx.registers.read(Register.SP_L), e);

    ctx.registers.write(Register.L, lsb);

    ctx.registers.setFlag(Flag.Z, false);
    ctx.registers.setFlag(Flag.N, false);
    ctx.registers.setFlag(Flag.H, carryFrom3);
    ctx.registers.setFlag(Flag.CY, carryFrom7);

    ctx.state.beginNextCycle();

    const { result: msb } = addBytes(
      ctx.registers.read(Register.SP_H),
      isNegative(e) ? 0xff : 0x00,
      carryFrom7
    );

    ctx.registers.write(Register.H, msb);
  }
);
