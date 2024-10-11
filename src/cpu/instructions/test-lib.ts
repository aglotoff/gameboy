import { test } from "vitest";

import { CpuState, IBus } from "../cpu-state";

class TestMemory implements IBus {
  private ram = new Uint8Array(0x10000);

  public read(address: number) {
    return this.ram[address];
  }

  public write(address: number, data: number) {
    this.ram[address] = data;
  }
}

export const testInstruction = test.extend({
  state: async ({}, use: (state: CpuState) => Promise<void>) => {
    await use(new CpuState(new TestMemory()));
  },
});
