import { describe, expect } from "vitest";

import { disableInterrupts, enableInterrupts, halt, stop } from "./misc";
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
    state.setIME(true);

    disableInterrupts(state);

    expect(state.getIME()).toBe(false);
  });

  testInstruction("EI", ({ state }) => {
    enableInterrupts(state);

    expect(state.getIME()).toBe(true);
  });
});
