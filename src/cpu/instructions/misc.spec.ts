import { describe, expect } from "vitest";

import {
  disableInterrupts,
  enableInterrupts,
  halt,
  noOperation,
  stop,
} from "./misc";
import { testInstruction } from "./test-lib";

describe("Miscellaneous instructions", () => {
  testInstruction("HALT", ({ state }) => {
    halt(state);

    expect(state.isHalted()).toBe(true);
  });

  testInstruction("STOP", ({ state }) => {
    stop(state);

    expect(state.isStopped()).toBe(true);
  });

  testInstruction("DI", ({ state }) => {
    state.setInterruptMasterEnable(true);

    disableInterrupts(state);

    expect(state.isInterruptMasterEnabled()).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testInstruction("EI", ({ state }) => {
    enableInterrupts(state);

    expect(state.isInterruptMasterEnableScheduled()).toBe(true);
    expect(state.isInterruptMasterEnabled()).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);

    state.advancePC();

    expect(state.isInterruptMasterEnableScheduled()).toBe(false);
    expect(state.isInterruptMasterEnabled()).toBe(true);
  });

  testInstruction("NOP", ({ state }) => {
    noOperation(state);

    expect(state.getElapsedCycles()).toBe(1);
  });
});
