import { test as baseTest } from "vitest";

import { RegisterFile } from "../regs";
import { Memory } from "../memory";

import { CpuState } from "./lib";

export const test = baseTest.extend({
  cpu: async ({}, use: (cpu: CpuState) => Promise<void>) => {
    await use({
      regs: new RegisterFile(),
      ime: false,
      halted: false,
      stopped: false,
    });
  },
  memory: async ({}, use: (memory: Memory) => Promise<void>) => {
    await use(new Memory());
  },
});
