import { instruction, instructionWithImmediateByte } from "./lib";

export const halt = instruction(function () {
  this.setHalted(true);
  return 4;
});

export const stop = instructionWithImmediateByte(function () {
  this.stop();
  return 4;
});

export const disableInterrupts = instruction(function () {
  this.setIME(false);
  return 4;
});

export const enableInterrupts = instruction(function () {
  this.setIME(true);
  return 4;
});

export const noOperation = instruction(() => 4);
