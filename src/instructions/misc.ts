import { instruction, instructionWithImmediateByte } from "./lib";

export const halt = instruction((state) => {
  state.setHalted(true);
  return 4;
});

export const stop = instructionWithImmediateByte((state) => {
  state.stop();
  return 4;
});

export const disableInterrupts = instruction((state) => {
  state.setIME(false);
  return 4;
});

export const enableInterrupts = instruction((state) => {
  state.setIME(true);
  return 4;
});

export const noOperation = instruction(() => 4);
