import { Flag, RegisterPair } from "../regs";
import { addSignedByteToWord, getLSB, getMSB } from "../utils";
import {
  instruction,
  instructionWithImmediateByte,
  instructionWithImmediateWord,
} from "./lib";

export const loadRegisterPair = instructionWithImmediateWord(function (
  data,
  dst: RegisterPair
) {
  this.writeRegisterPair(dst, data);
  return 12;
});

export const loadDirectFromStackPointer = instructionWithImmediateWord(
  function (address) {
    const data = this.readRegisterPair(RegisterPair.SP);
    this.writeBus(address, getLSB(data));
    this.writeBus(address + 1, getMSB(data));
    return 20;
  }
);

export const loadStackPointerFromHL = instruction(function () {
  this.writeRegisterPair(
    RegisterPair.SP,
    this.readRegisterPair(RegisterPair.HL)
  );
  return 8;
});

export const pushToStack = instruction(function (pair: RegisterPair) {
  this.pushWord(this.readRegisterPair(pair));
  return 16;
});

export const popFromStack = instruction(function (rr: RegisterPair) {
  this.writeRegisterPair(rr, this.popWord());
  return 12;
});

export const loadHLFromAdjustedStackPointer = instructionWithImmediateByte(
  function (e) {
    const { result, carryFrom3, carryFrom7 } = addSignedByteToWord(
      this.readRegisterPair(RegisterPair.SP),
      e
    );

    this.writeRegisterPair(RegisterPair.HL, result);
    this.setFlag(Flag.Z, false);
    this.setFlag(Flag.N, false);
    this.setFlag(Flag.H, carryFrom3);
    this.setFlag(Flag.CY, carryFrom7);

    return 12;
  }
);
