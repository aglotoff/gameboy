import { describe, expect } from "vitest";

import { disableInterrupts, enableInterrupts, halt, stop } from "./misc";
import { test } from "./test-lib";

describe("Miscellaneous instructions", () => {
  test("HALT", ({ cpu, memory }) => {
    halt({ cpu, memory });

    expect(cpu.halted).toBe(true);
  });

  test("STOP", ({ cpu, memory }) => {
    stop({ cpu, memory });

    expect(cpu.stopped).toBe(true);
  });

  test("DI", ({ cpu, memory }) => {
    cpu.ime = true;

    disableInterrupts({ cpu, memory });

    expect(cpu.ime).toBe(false);
  });

  test("EI", ({ cpu, memory }) => {
    cpu.ime = false;

    enableInterrupts({ cpu, memory });

    expect(cpu.ime).toBe(true);
  });
});
