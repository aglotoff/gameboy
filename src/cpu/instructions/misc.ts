import { instruction, instructionWithImmediateByte } from "./lib";

export const halt = instruction(function () {
  this.setHalted(true);
});

export const stop = instructionWithImmediateByte(function () {
  this.stop();
});

export const disableInterrupts = instruction(function () {
  this.setInterruptMasterEnable(false);
});

export const enableInterrupts = instruction(function () {
  this.scheduleInterruptMasterEnable();
});

export const noOperation = instruction(() => {});
