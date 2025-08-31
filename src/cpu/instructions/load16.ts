import { getLSB, getMSB, makeWord, wrappingIncrementWord } from "../../utils";
import { Flag, Register, RegisterPair } from "../register";

import {
  addBytes,
  makeInstruction,
  makeInstructionWithImmediateByte,
  makeInstructionWithImmediateWord,
  isNegative,
  writeMemoryCycle,
  readMemoryCycle,
  decrementAndTriggerWrite,
  incrementAndTriggerReadWrite,
} from "./lib";

export const loadRegisterPair = makeInstructionWithImmediateWord(
  (ctx, data, dst: RegisterPair) => {
    ctx.registers.writePair(dst, data);
  }
);

export const loadDirectFromStackPointer = makeInstructionWithImmediateWord(
  (ctx, address) => {
    writeMemoryCycle(ctx, address, ctx.registers.read(Register.SP_L));
    writeMemoryCycle(ctx, address + 1, ctx.registers.read(Register.SP_H));
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
  const data = ctx.registers.readPair(pair);

  let sp = ctx.registers.readPair(RegisterPair.SP);

  ctx.registers.writePair(RegisterPair.SP, decrementAndTriggerWrite(ctx, sp));

  ctx.state.beginNextCycle();

  sp = ctx.registers.readPair(RegisterPair.SP);

  ctx.registers.writePair(RegisterPair.SP, decrementAndTriggerWrite(ctx, sp));

  writeMemoryCycle(ctx, sp, getMSB(data));

  sp = ctx.registers.readPair(RegisterPair.SP);
  writeMemoryCycle(ctx, sp, getLSB(data));
});

export const popFromStack = makeInstruction((ctx, pair: RegisterPair) => {
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

  ctx.registers.writePair(pair, makeWord(msb, lsb));
});

export const loadHLFromAdjustedStackPointer = makeInstructionWithImmediateByte(
  (ctx, offset) => {
    const {
      result: lsb,
      carryFrom3,
      carryFrom7,
    } = addBytes(ctx.registers.read(Register.SP_L), offset);

    ctx.registers.write(Register.L, lsb);

    ctx.registers.setFlag(Flag.Z, false);
    ctx.registers.setFlag(Flag.N, false);
    ctx.registers.setFlag(Flag.H, carryFrom3);
    ctx.registers.setFlag(Flag.CY, carryFrom7);

    ctx.state.beginNextCycle();

    const { result: msb } = addBytes(
      ctx.registers.read(Register.SP_H),
      isNegative(offset) ? 0xff : 0x00,
      carryFrom7
    );

    ctx.registers.write(Register.H, msb);
  }
);
