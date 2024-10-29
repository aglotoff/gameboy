import { Flag, RegisterPair } from "../register";
import { getLSB, getMSB } from "../../utils";
import {
  addSignedByteToWord,
  instruction,
  instructionWithImmediateByte,
  instructionWithImmediateWord,
} from "./lib";

export const loadRegisterPair = instructionWithImmediateWord(function (
  data,
  dst: RegisterPair
) {
  this.writeRegisterPair(dst, data);
});

export const loadDirectFromStackPointer = instructionWithImmediateWord(
  function (address) {
    const data = this.readRegisterPair(RegisterPair.SP);
    this.writeBus(address, getLSB(data));
    this.cycle();
    this.writeBus(address + 1, getMSB(data));
    this.cycle();
  }
);

export const loadStackPointerFromHL = instruction(function () {
  this.writeRegisterPair(
    RegisterPair.SP,
    this.readRegisterPair(RegisterPair.HL)
  );
  this.cycle();
});

export const pushToStack = instruction(function (pair: RegisterPair) {
  this.pushWord(this.readRegisterPair(pair));
});

export const popFromStack = instruction(function (rr: RegisterPair) {
  this.writeRegisterPair(rr, this.popWord());
});

export const loadHLFromAdjustedStackPointer = instructionWithImmediateByte(
  function (e) {
    const { result, carryFrom3, carryFrom7 } = addSignedByteToWord(
      this.readRegisterPair(RegisterPair.SP),
      e
    );

    this.writeRegisterPair(RegisterPair.HL, result);
    // Loading L on first cycle, H on second
    this.cycle();

    this.setFlag(Flag.Z, false);
    this.setFlag(Flag.N, false);
    this.setFlag(Flag.H, carryFrom3);
    this.setFlag(Flag.CY, carryFrom7);
  }
);
