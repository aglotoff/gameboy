import { makeInstruction, makeInstructionWithImmediateByte } from "./lib";

export const halt = makeInstruction((cpu) => {
  cpu.setHalted(true);
});

export const stop = makeInstructionWithImmediateByte((cpu) => {
  cpu.stop();
});

export const disableInterrupts = makeInstruction((cpu) => {
  cpu.setInterruptMasterEnable(false);
});

export const enableInterrupts = makeInstruction((cpu) => {
  cpu.scheduleInterruptMasterEnable();
});

export const noOperation = makeInstruction(() => {});
