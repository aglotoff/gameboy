import { test, vi } from "vitest";

import { CpuState, IMemory, InstructionContext } from "./cpu-state";
import { RegisterFile } from "./register";

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
  ctx: InstructionContext;
}

export const testInstructions = test.extend<Fixtures>({
  onCycle: async ({}, use: (onCycle: () => void) => Promise<void>) => {
    await use(vi.fn());
  },
  ctx: async ({ onCycle }, use: (ctx: InstructionContext) => Promise<void>) => {
    await use({
      registers: new RegisterFile(),
      memory: new TestMemory(),
      state: new CpuState({ onCycle }),
    });
  },
});
