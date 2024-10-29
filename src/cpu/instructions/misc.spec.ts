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
    halt.call(state);

    expect(state.isHalted()).toBe(true);
  });

  testInstruction("STOP", ({ state }) => {
    stop.call(state);

    expect(state.isStopped()).toBe(true);
  });

  testInstruction("DI", ({ state }) => {
    state.setIME(true);

    disableInterrupts.call(state);

    expect(state.getIME()).toBe(false);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testInstruction("EI", ({ state }) => {
    enableInterrupts.call(state);

    expect(state.stepsToIME).toBe(1);
    expect(state.getElapsedCycles()).toBe(1);
  });

  testInstruction("NOP", ({ state }) => {
    noOperation.call(state);

    expect(state.getElapsedCycles()).toBe(1);
  });
});
