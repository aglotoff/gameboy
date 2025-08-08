import { makeInstruction, makeInstructionWithImmediateByte } from "./lib";

export const halt = makeInstruction((ctx) => {
  ctx.halt();
});

export const stop = makeInstructionWithImmediateByte((ctx) => {
  ctx.stop();
});

export const disableInterrupts = makeInstruction((ctx) => {
  ctx.setInterruptMasterEnable(false);
});

export const enableInterrupts = makeInstruction((ctx) => {
  ctx.scheduleInterruptMasterEnable();
});

export const noOperation = makeInstruction(() => {});
