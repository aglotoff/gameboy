import { Condition, CpuState } from "../cpu-state";
import { RegisterPair } from "../register";
import { makeWord } from "../../utils";
import {
  addSignedByteToWord,
  instruction,
  instructionWithImmediateByte,
  instructionWithImmediateWord,
} from "./lib";

export const jump = instructionWithImmediateWord(function (address) {
  this.writeRegisterPair(RegisterPair.PC, address);
  return 4;
});

export const jumpToHL = instruction(function () {
  this.writeRegisterPair(
    RegisterPair.PC,
    this.readRegisterPair(RegisterPair.HL)
  );
  return 0;
});

export const jumpConditional = instructionWithImmediateWord(function (
  address,
  condition: Condition
) {
  if (!this.checkCondition(condition)) {
    return 0;
  }

  this.writeRegisterPair(RegisterPair.PC, address);

  return 4;
});

export const relativeJump = instructionWithImmediateByte(function (offset) {
  const { result } = addSignedByteToWord(
    this.readRegisterPair(RegisterPair.PC),
    offset
  );

  this.writeRegisterPair(RegisterPair.PC, result);

  return 4;
});

export const relativeJumpConditional = instructionWithImmediateByte(function (
  offset,
  condition: Condition
) {
  if (!this.checkCondition(condition)) {
    return 0;
  }

  const { result } = addSignedByteToWord(
    this.readRegisterPair(RegisterPair.PC),
    offset
  );

  this.writeRegisterPair(RegisterPair.PC, result);

  return 4;
});

export const callFunction = instructionWithImmediateWord(function (address) {
  pushProgramCounter.call(this);
  this.writeRegisterPair(RegisterPair.PC, address);
  return 12;
});

export const callFunctionConditional = instructionWithImmediateWord(function (
  address,
  condition: Condition
) {
  if (!this.checkCondition(condition)) {
    return 0;
  }

  pushProgramCounter.call(this);
  this.writeRegisterPair(RegisterPair.PC, address);

  return 12;
});

export const returnFromFunction = instruction(function () {
  popProgramCounter.call(this);
  return 12;
});

export const returnFromFunctionConditional = instruction(function (
  condition: Condition
) {
  if (!this.checkCondition(condition)) {
    return 4;
  }

  popProgramCounter.call(this);

  return 16;
});

export const returnFromInterruptHandler = instruction(function () {
  popProgramCounter.call(this);
  this.setIME(true);
  return 12;
});

function popProgramCounter(this: CpuState) {
  this.writeRegisterPair(RegisterPair.PC, this.popWord());
}

export const restartFunction = instruction(function (address: number) {
  pushProgramCounter.call(this);

  this.writeRegisterPair(RegisterPair.PC, makeWord(0x00, address));

  return 12;
});

function pushProgramCounter(this: CpuState) {
  this.pushWord(this.readRegisterPair(RegisterPair.PC));
}
