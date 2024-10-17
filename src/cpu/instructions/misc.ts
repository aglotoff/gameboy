import { instruction, instructionWithImmediateByte } from "./lib";

export const halt = instruction(function () {
  this.setHalted(true);
  return 0;
});

export const stop = instructionWithImmediateByte(function () {
  this.stop();
  return 0;
});

export const disableInterrupts = instruction(function () {
  this.setIME(false);
  return 0;
});

export const enableInterrupts = instruction(function () {
  this.setIME(true);
  return 0;
});

export const noOperation = instruction(() => 0);
