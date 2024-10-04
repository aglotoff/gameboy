import { describe, expect, test as baseTest } from "vitest";

import { InterruptFlags, RegisterFile } from "../cpu";
import { Memory } from "../memory";

import { InstructionCtx } from "./lib";
import { disableInterrupts, enableInterrupts } from "./misc";

const test = baseTest.extend({
  ctx: async ({}, use: (ctx: InstructionCtx) => Promise<void>) => {
    await use({
      regs: new RegisterFile(),
      memory: new Memory(),
      interruptFlags: new InterruptFlags(),
    });
  },
});

describe("Miscellaneous instructions", () => {
  test("DI", ({ ctx }) => {
    ctx.interruptFlags.masterEnable();

    disableInterrupts(ctx);

    expect(ctx.interruptFlags.isMasterEnabled()).toBe(false);
  });
});

describe("Miscellaneous instructions", () => {
  test("EI", ({ ctx }) => {
    ctx.interruptFlags.masterDisable();

    enableInterrupts(ctx);

    expect(ctx.interruptFlags.isMasterEnabled()).toBe(true);
  });
});
