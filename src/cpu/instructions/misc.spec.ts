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
  testCpuState("HALT", ({ state }) => {
    halt(state);

    expect(state.isHalted()).toBe(true);
  });

  testCpuState("STOP", ({ state }) => {
    stop(state);

    expect(state.isStopped()).toBe(true);
  });

  testCpuState("DI", ({ state }) => {
    state.setInterruptMasterEnable(true);

    disableInterrupts(state);

    expect(state.isInterruptMasterEnabled()).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testCpuState("EI", ({ state }) => {
    enableInterrupts(state);

    expect(state.isInterruptMasterEnableScheduled()).toBe(true);
    expect(state.isInterruptMasterEnabled()).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);

    state.advancePC();

    expect(state.isInterruptMasterEnableScheduled()).toBe(false);
    expect(state.isInterruptMasterEnabled()).toBe(true);
  });

  testCpuState("NOP", ({ state }) => {
    noOperation(state);

    expect(state.getElapsedCycles()).toBe(1);
  });
});
