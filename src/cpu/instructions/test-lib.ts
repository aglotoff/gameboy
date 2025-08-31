import { test } from "vitest";

import { IMemory, CpuState } from "../cpu-state";
import { RegisterFile } from "../register";

import { InstructionContext } from "./lib";

class TestMemory implements IMemory {
  private ram = new Uint8Array(0x10000);

  public read(address: number) {
    return this.ram[address];
  }

  public write(address: number, data: number) {
    this.ram[address] = data;
  }

  public triggerWrite() {}
  public triggerReadWrite() {}
}

export const testInstruction = test.extend({
  ctx: async ({}, use: (ctx: InstructionContext) => Promise<void>) => {
    await use({
      registers: new RegisterFile(),
      memory: new TestMemory(),
      state: new CpuState(),
    });
  },
});
