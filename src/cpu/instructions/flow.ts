import { CpuState } from "../cpu-state";
import { RegisterPair } from "../register";
import { makeWord } from "../../utils";
import {
  addSignedByteToWord,
  checkCondition,
  Condition,
  instruction,
  instructionWithImmediateByte,
  instructionWithImmediateWord,
  popWord,
  pushWord,
} from "./lib";

export const jump = instructionWithImmediateWord(function (address) {
  this.writeRegisterPair(RegisterPair.PC, address);
  this.cycle();
});

export const jumpToHL = instruction(function () {
  this.writeRegisterPair(
    RegisterPair.PC,
    this.readRegisterPair(RegisterPair.HL)
  );
});

export const jumpConditional = instructionWithImmediateWord(function (
  address,
  condition: Condition
) {
  if (!checkCondition(this, condition)) {
    return;
  }

  this.writeRegisterPair(RegisterPair.PC, address);
  this.cycle();
});

export const relativeJump = instructionWithImmediateByte(function (offset) {
  const { result } = addSignedByteToWord(
    this.readRegisterPair(RegisterPair.PC),
    offset
  );

  this.writeRegisterPair(RegisterPair.PC, result);
  this.cycle();
});

export const relativeJumpConditional = instructionWithImmediateByte(function (
  offset,
  condition: Condition
) {
  if (!checkCondition(this, condition)) {
    return;
  }

  const { result } = addSignedByteToWord(
    this.readRegisterPair(RegisterPair.PC),
    offset
  );

  this.writeRegisterPair(RegisterPair.PC, result);
  this.cycle();
});

export const callFunction = instructionWithImmediateWord(function (address) {
  pushProgramCounter.call(this);
  this.writeRegisterPair(RegisterPair.PC, address);
});

export const callFunctionConditional = instructionWithImmediateWord(function (
  address,
  condition: Condition
) {
  if (!checkCondition(this, condition)) {
    return;
  }

  pushProgramCounter.call(this);
  this.writeRegisterPair(RegisterPair.PC, address);
});

export const returnFromFunction = instruction(function () {
  popProgramCounter.call(this);
});

export const returnFromFunctionConditional = instruction(function (
  condition: Condition
) {
  let result = checkCondition(this, condition);
  this.cycle();

  if (result) {
    popProgramCounter.call(this);
  }
});

export const returnFromInterruptHandler = instruction(function () {
  popProgramCounter.call(this);
  this.setInterruptMasterEnable(true);
});

function popProgramCounter(this: CpuState) {
  this.writeRegisterPair(RegisterPair.PC, popWord(this));
  this.cycle();
}

export const restartFunction = instruction(function (address: number) {
  pushProgramCounter.call(this);

  this.writeRegisterPair(RegisterPair.PC, makeWord(0x00, address));
});

function pushProgramCounter(this: CpuState) {
  pushWord(this, this.readRegisterPair(RegisterPair.PC));
}
