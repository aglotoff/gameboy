import { makeInstruction, makeInstructionWithImmediateByte } from "./lib";

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#HALT
export const halt = makeInstruction((ctx) => {
  ctx.state.halt();
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#STOP
export const stop = makeInstructionWithImmediateByte((ctx) => {
  ctx.state.stop();
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#DI
export const disableInterrupts = makeInstruction((ctx) => {
  ctx.state.setInterruptMasterEnable(false);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#EI
export const enableInterrupts = makeInstruction((ctx) => {
  ctx.state.scheduleInterruptMasterEnable();
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#NOP
export const noOperation = makeInstruction(() => {});
