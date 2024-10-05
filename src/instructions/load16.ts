import { Flag, RegisterPair } from "../regs";
import {
  addSignedByteToWord,
  decrementWord,
  getLSB,
  getMSB,
  incrementWord,
  makeWord,
} from "../utils";
import {
  instruction,
  instructionWithImmediateByte,
  instructionWithImmediateWord,
} from "./lib";

export const loadRegisterPair = instructionWithImmediateWord(
  ({ cpu }, data, dst: RegisterPair) => {
    cpu.regs.writePair(dst, data);
    return 12;
  }
);

export const loadDirectFromStackPointer = instructionWithImmediateWord(
  ({ cpu, memory }, address) => {
    const data = cpu.regs.readPair(RegisterPair.SP);
    memory.write(address, getLSB(data));
    memory.write(address + 1, getMSB(data));
    return 20;
  }
);

export const loadStackPointerFromHL = instruction(({ cpu }) => {
  cpu.regs.writePair(RegisterPair.SP, cpu.regs.readPair(RegisterPair.HL));
  return 8;
});

export const pushToStack = instruction(
  ({ cpu, memory }, pair: RegisterPair) => {
    const data = cpu.regs.readPair(pair);
    let sp = cpu.regs.readPair(RegisterPair.SP);

    sp = decrementWord(sp);
    memory.write(sp, getMSB(data));
    sp = decrementWord(sp);
    memory.write(sp, getLSB(data));

    cpu.regs.writePair(RegisterPair.SP, sp);

    return 16;
  }
);

export const popFromStack = instruction(({ cpu, memory }, rr: RegisterPair) => {
  let sp = cpu.regs.readPair(RegisterPair.SP);

  const lsb = memory.read(sp);
  sp = incrementWord(sp);
  const msb = memory.read(sp);
  sp = incrementWord(sp);

  cpu.regs.writePair(rr, makeWord(msb, lsb));
  cpu.regs.writePair(RegisterPair.SP, sp);

  return 12;
});

export const loadHLFromAdjustedStackPointer = instructionWithImmediateByte(
  ({ cpu }, e) => {
    const { result, carryFrom3, carryFrom7 } = addSignedByteToWord(
      cpu.regs.readPair(RegisterPair.SP),
      e
    );

    cpu.regs.writePair(RegisterPair.HL, result);
    cpu.regs.setFlag(Flag.Z, false);
    cpu.regs.setFlag(Flag.N, false);
    cpu.regs.setFlag(Flag.H, carryFrom3);
    cpu.regs.setFlag(Flag.CY, carryFrom7);

    return 12;
  }
);
