import { RegisterPair, Flag } from "../register";
import { wrappingIncrementWord } from "../../utils";
import {
  addSignedByteToWord,
  addWords,
  instruction,
  instructionWithImmediateByte,
} from "./lib";

export const incrementRegisterPair = instruction((cpu, pair: RegisterPair) => {
  cpu.writeRegisterPair(
    pair,
    wrappingIncrementWord(cpu.readRegisterPair(pair))
  );
  cpu.cycle();
});

export const decrementRegisterPair = instruction((cpu, pair: RegisterPair) => {
  cpu.writeRegisterPair(pair, cpu.readRegisterPair(pair) - 1);
  cpu.cycle();
});

export const addRegisterPair = instruction((cpu, pair: RegisterPair) => {
  const { result, carryFrom11, carryFrom15 } = addWords(
    cpu.readRegisterPair(RegisterPair.HL),
    cpu.readRegisterPair(pair)
  );

  cpu.writeRegisterPair(RegisterPair.HL, result);
  // TODO: L on the first cycle, H on the second
  cpu.cycle();

  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, carryFrom11);
  cpu.setFlag(Flag.CY, carryFrom15);
});

export const addToStackPointer = instructionWithImmediateByte((cpu, e) => {
  const { result, carryFrom3, carryFrom7 } = addSignedByteToWord(
    cpu.readRegisterPair(RegisterPair.SP),
    e
  );

  // TODO: addition split in two steps
  cpu.cycle();
  cpu.cycle();

  cpu.writeRegisterPair(RegisterPair.SP, result);
  cpu.setFlag(Flag.Z, false);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, carryFrom3);
  cpu.setFlag(Flag.CY, carryFrom7);
});
