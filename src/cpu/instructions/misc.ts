import { instruction, instructionWithImmediateByte } from "./lib";

export const halt = instruction((cpu) => {
  cpu.setHalted(true);
});

export const stop = instructionWithImmediateByte((cpu) => {
  cpu.stop();
});

export const disableInterrupts = instruction((cpu) => {
  cpu.setInterruptMasterEnable(false);
});

export const enableInterrupts = instruction((cpu) => {
  cpu.scheduleInterruptMasterEnable();
});

export const noOperation = instruction(() => {});
