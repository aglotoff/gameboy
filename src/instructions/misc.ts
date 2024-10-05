import { InstructionCtx } from "./lib";

export function halt() {
  // TODO
  throw new Error("HALT");
  return 4;
}

export function stop() {
  // TODO
  throw new Error("STOP");
  return 4;
}

export function disableInterrupts(ctx: InstructionCtx) {
  ctx.interruptFlags.masterDisable();
  return 4;
}

export function enableInterrupts(ctx: InstructionCtx) {
  ctx.interruptFlags.masterEnable();
  return 4;
}

export function noOperation() {
  return 4;
}
