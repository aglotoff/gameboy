import { describe, expect } from "vitest";

import { testInstructions } from "../test-lib";

import {
  disableInterrupts,
  enableInterrupts,
  halt,
  noOperation,
  stop,
} from "./misc";

describe("Miscellaneous instructions", () => {
  testInstructions("HALT", ({ ctx }) => {
    halt(ctx);

    expect(ctx.state.isHalted()).toBe(true);
  });

  testInstructions("STOP", ({ ctx }) => {
    stop(ctx);

    expect(ctx.state.isStopped()).toBe(true);
  });

  testInstructions("DI", ({ ctx, onCycle }) => {
    ctx.state.setInterruptMasterEnable(true);

    disableInterrupts(ctx);

    expect(ctx.state.isInterruptMasterEnabled()).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testInstructions("EI", ({ ctx, onCycle }) => {
    enableInterrupts(ctx);

    expect(ctx.state.isInterruptMasterEnableScheduled()).toBe(true);
    expect(ctx.state.isInterruptMasterEnabled()).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testInstructions("NOP", ({ ctx, onCycle }) => {
    noOperation(ctx);

    expect(onCycle).toBeCalledTimes(1);
  });
});
