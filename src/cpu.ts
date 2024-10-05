import { getNextInstruction } from "./instructions/optable";
import { Memory } from "./memory";
import { RegisterFile, RegisterPair } from "./regs";

export class Cpu {
  private state = {
    regs: new RegisterFile(),
    ime: false,
    halted: false,
    stopped: false,
  };

  public constructor(private memory: Memory) {}

  public async run() {
    const ctx = {
      cpu: this.state,
      memory: this.memory,
    };

    let mCycles = 0;

    this.state.regs.writePair(RegisterPair.PC, 0x100);

    while (true) {
      const instruction = getNextInstruction(ctx);
      mCycles += instruction[1](ctx) / 4;

      if (mCycles >= 10485) {
        await new Promise((resolve) => {
          setTimeout(resolve, 10);
        });
        mCycles = 0;
      }
    }
  }
}
