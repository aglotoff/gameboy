import { RegisterPair, Flag } from "../regs";
import { incrementWord, addWords, addSignedByteToWord } from "../utils";
import { instruction, instructionWithImmediateByte } from "./lib";

export const incrementRegisterPair = instruction(
  ({ cpu }, pair: RegisterPair) => {
    cpu.regs.writePair(pair, incrementWord(cpu.regs.readPair(pair)));
    return 8;
  }
);

export const decrementRegisterPair = instruction(
  ({ cpu }, pair: RegisterPair) => {
    cpu.regs.writePair(pair, cpu.regs.readPair(pair) - 1);
    return 8;
  }
);

export const addRegisterPair = instruction(({ cpu }, pair: RegisterPair) => {
  const { result, carryFrom11, carryFrom15 } = addWords(
    cpu.regs.readPair(RegisterPair.HL),
    cpu.regs.readPair(pair)
  );

  cpu.regs.writePair(RegisterPair.HL, result);
  cpu.regs.setFlag(Flag.N, false);
  cpu.regs.setFlag(Flag.H, carryFrom11);
  cpu.regs.setFlag(Flag.CY, carryFrom15);

  return 8;
});

export const addToStackPointer = instructionWithImmediateByte((ctx, e) => {
  const { result, carryFrom3, carryFrom7 } = addSignedByteToWord(
    ctx.cpu.regs.readPair(RegisterPair.SP),
    e
  );

  ctx.cpu.regs.writePair(RegisterPair.SP, result);
  ctx.cpu.regs.setFlag(Flag.Z, false);
  ctx.cpu.regs.setFlag(Flag.N, false);
  ctx.cpu.regs.setFlag(Flag.H, carryFrom3);
  ctx.cpu.regs.setFlag(Flag.CY, carryFrom7);

  return 16;
});
