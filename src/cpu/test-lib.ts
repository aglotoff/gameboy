import { test } from "vitest";

import { CpuState, IMemory } from "./cpu-state";

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

export const testCpuState = test.extend({
  state: async ({}, use: (state: CpuState) => Promise<void>) => {
    await use(new CpuState({ memory: new TestMemory(), onCycle: () => {} }));
  },
});
