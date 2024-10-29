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
  if (!this.checkCondition(condition)) {
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
  if (!this.checkCondition(condition)) {
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
  if (!this.checkCondition(condition)) {
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
  let result = this.checkCondition(condition);
  this.cycle();

  if (result) {
    popProgramCounter.call(this);
  }
});

export const returnFromInterruptHandler = instruction(function () {
  popProgramCounter.call(this);
  this.setIME(true);
});

function popProgramCounter(this: CpuState) {
  this.writeRegisterPair(RegisterPair.PC, this.popWord());
  this.cycle();
}

export const restartFunction = instruction(function (address: number) {
  pushProgramCounter.call(this);

  this.writeRegisterPair(RegisterPair.PC, makeWord(0x00, address));
});

function pushProgramCounter(this: CpuState) {
  this.pushWord(this.readRegisterPair(RegisterPair.PC));
}
