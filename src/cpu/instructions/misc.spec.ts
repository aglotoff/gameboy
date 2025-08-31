import { describe, expect } from "vitest";

import { testInstruction } from "./test-lib";

import {
  disableInterrupts,
  enableInterrupts,
  halt,
  noOperation,
  stop,
} from "./misc";

describe("Miscellaneous instructions", () => {
  testInstruction("HALT", ({ ctx }) => {
    halt(ctx);

    expect(ctx.state.isHalted()).toBe(true);
  });

  testInstruction("STOP", ({ ctx }) => {
    stop(ctx);

    expect(ctx.state.isStopped()).toBe(true);
  });

  testInstruction("DI", ({ ctx }) => {
    ctx.state.setInterruptMasterEnable(true);

    disableInterrupts(ctx);

    expect(ctx.state.isInterruptMasterEnabled()).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(1);
  });

  testInstruction("EI", ({ ctx }) => {
    enableInterrupts(ctx);

    expect(ctx.state.isInterruptMasterEnabled()).toBe(false);
    expect(ctx.state.getElapsedCycles()).toBe(1);

    ctx.state.updateInterruptMasterEnabled();

    expect(ctx.state.isInterruptMasterEnabled()).toBe(true);
  });

  testInstruction("NOP", ({ ctx }) => {
    noOperation(ctx);

    expect(ctx.state.getElapsedCycles()).toBe(1);
  });
});
