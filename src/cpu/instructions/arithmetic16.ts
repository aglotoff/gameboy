import { RegisterPair, Flag } from "../register";
import { wrapIncrementWord } from "../../utils";
import {
  addSignedByteToWord,
  addWords,
  instruction,
  instructionWithImmediateByte,
} from "./lib";

export const incrementRegisterPair = instruction(function (pair: RegisterPair) {
  this.writeRegisterPair(pair, wrapIncrementWord(this.readRegisterPair(pair)));
  return 8;
});

export const decrementRegisterPair = instruction(function (pair: RegisterPair) {
  this.writeRegisterPair(pair, this.readRegisterPair(pair) - 1);
  return 8;
});

export const addRegisterPair = instruction(function (pair: RegisterPair) {
  const { result, carryFrom11, carryFrom15 } = addWords(
    this.readRegisterPair(RegisterPair.HL),
    this.readRegisterPair(pair)
  );

  this.writeRegisterPair(RegisterPair.HL, result);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, carryFrom11);
  this.setFlag(Flag.CY, carryFrom15);

  return 8;
});

export const addToStackPointer = instructionWithImmediateByte(function (e) {
  const { result, carryFrom3, carryFrom7 } = addSignedByteToWord(
    this.readRegisterPair(RegisterPair.SP),
    e
  );

  this.writeRegisterPair(RegisterPair.SP, result);
  this.setFlag(Flag.Z, false);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, carryFrom3);
  this.setFlag(Flag.CY, carryFrom7);

  return 16;
});
