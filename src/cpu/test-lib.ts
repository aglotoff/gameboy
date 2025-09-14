import { test, vi } from "vitest";

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

export interface Fixtures {
  onCycle: () => void;
  ctx: CpuState;
}

export const testCpuState = test.extend<Fixtures>({
  onCycle: async ({}, use: (onCycle: () => void) => Promise<void>) => {
    await use(vi.fn());
  },
  ctx: async ({ onCycle }, use: (ctx: CpuState) => Promise<void>) => {
    await use(new CpuState({ memory: new TestMemory(), onCycle }));
  },
});
