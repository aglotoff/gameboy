import { describe, expect } from "vitest";

import { testCpuState } from "../test-lib";

import {
  disableInterrupts,
  enableInterrupts,
  halt,
  noOperation,
  stop,
} from "./misc";

describe("Miscellaneous instructions", () => {
  testCpuState("HALT", ({ ctx }) => {
    halt(ctx);

    expect(ctx.isHalted()).toBe(true);
  });

  testCpuState("STOP", ({ ctx }) => {
    stop(ctx);

    expect(ctx.isStopped()).toBe(true);
  });

  testCpuState("DI", ({ ctx, onCycle }) => {
    ctx.setInterruptMasterEnable(true);

    disableInterrupts(ctx);

    expect(ctx.isInterruptMasterEnabled()).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testCpuState("EI", ({ ctx, onCycle }) => {
    enableInterrupts(ctx);

    expect(ctx.isInterruptMasterEnableScheduled()).toBe(true);
    expect(ctx.isInterruptMasterEnabled()).toBe(false);
    expect(onCycle).toBeCalledTimes(1);
  });

  testCpuState("NOP", ({ ctx, onCycle }) => {
    noOperation(ctx);

    expect(onCycle).toBeCalledTimes(1);
  });
});
