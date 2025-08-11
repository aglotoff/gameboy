import { makeInstruction, makeInstructionWithImmediateByte } from "./lib";

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#HALT
export const halt = makeInstruction((ctx) => {
  ctx.halt();
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#STOP
export const stop = makeInstructionWithImmediateByte((ctx) => {
  ctx.stop();
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#DI
export const disableInterrupts = makeInstruction((ctx) => {
  ctx.setInterruptMasterEnable(false);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#EI
export const enableInterrupts = makeInstruction((ctx) => {
  ctx.scheduleInterruptMasterEnable();
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#NOP
export const noOperation = makeInstruction(() => {});
