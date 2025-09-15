import { makeInstruction, makeInstructionWithImmediateByte } from "./lib";

export const halt = makeInstruction((ctx) => {
  ctx.state.halt();
});

export const stop = makeInstructionWithImmediateByte((ctx) => {
  ctx.state.stop();
});

export const disableInterrupts = makeInstruction((ctx) => {
  ctx.state.setInterruptMasterEnable(false);
});

export const enableInterrupts = makeInstruction((ctx) => {
  ctx.state.scheduleInterruptMasterEnable();
});

export const noOperation = makeInstruction(() => {});
