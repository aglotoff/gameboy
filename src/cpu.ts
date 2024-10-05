import { restartFunction } from "./instructions/flow";
import { getNextInstruction } from "./instructions/optable";
import { Memory, timer, interrupts } from "./memory";
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
      let cycles = 0;

      const interruptMask =
        interrupts.interruptFlag & interrupts.interruptEnable;

      if (interruptMask !== 0) {
        this.state.halted = false;
      }

      if (this.state.ime && interruptMask !== 0) {
        for (let irq = 0; irq < 5; irq++) {
          if (interruptMask & (1 << irq)) {
            this.state.ime = false;
            interrupts.interruptFlag &= ~(1 << irq);

            const handlerAddress = 0x40 + irq * 8;
            console.log("Call handler ", handlerAddress.toString(16));
            cycles = restartFunction(ctx, handlerAddress) / 4;

            break;
          }
        }
      } else if (this.state.halted) {
        cycles = 1;
      } else {
        const instruction = getNextInstruction(ctx);
        cycles = instruction[1](ctx) / 4;
      }

      for (let i = 0; i < cycles; i++) {
        timer.tick();
      }

      mCycles += cycles;

      if (mCycles > 4194) {
        await new Promise((resolve) => {
          setTimeout(resolve, 4);
        });
        mCycles = 0;
      }
    }
  }
}
