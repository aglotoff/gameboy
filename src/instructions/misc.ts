import { instruction, instructionWithImmediateByte } from "./lib";

export const halt = instruction(({ cpu }) => {
  cpu.halted = true;
  return 4;
});

export const stop = instructionWithImmediateByte(({ cpu }) => {
  cpu.stopped = true;
  return 4;
});

export const disableInterrupts = instruction(({ cpu }) => {
  cpu.ime = false;
  return 4;
});

export const enableInterrupts = instruction(({ cpu }) => {
  cpu.ime = true;
  return 4;
});

export const noOperation = instruction(() => 4);
