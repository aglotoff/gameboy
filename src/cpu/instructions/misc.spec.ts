import { describe, expect } from "vitest";

import { disableInterrupts, enableInterrupts, halt, stop } from "./misc";
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
  });

  testInstruction("EI", ({ state }) => {
    enableInterrupts.call(state);

    expect(state.getIME()).toBe(true);
  });
});
