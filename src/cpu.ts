import { CpuState, pushWord } from "./cpu-state";
import { getNextInstruction } from "./instructions/optable";
import { interruptController } from "./interrupt-controller";
import { IMemory, timer } from "./memory";
import { RegisterPair } from "./regs";

let i = 0;

export class Cpu {
  private state: CpuState;

  public constructor(memory: IMemory) {
    this.state = new CpuState(memory);
  }

  private step() {
    if (interruptController.hasPendingInterrupt()) {
      this.state.setHalted(false);

      if (this.state.getIME()) {
        this.state.setIME(false);

        const irq = interruptController.getPendingInterrupt();
        interruptController.acknowledgeInterrupt(irq);

        const handlerAddress = 0x40 + irq * 8;

        pushWord(this.state, this.state.readRegisterPair(RegisterPair.PC));
        this.state.writeRegisterPair(RegisterPair.PC, handlerAddress);

        return 5;
      }
    }

    if (this.state.isHalted()) {
      return 1;
    }

    const instruction = getNextInstruction(this.state);
    return instruction[1](this.state) / 4;
  }

  public setPC(address: number) {
    this.state.writeRegisterPair(RegisterPair.PC, address);
  }

  public async run() {
    let mCycles = 0;

    this.setPC(0x100);

    while (true) {
      let stepMCycles = this.step();

      for (let i = 0; i < stepMCycles; i++) {
        timer.tick();
      }

      mCycles += stepMCycles;

      if (mCycles > 4194) {
        await new Promise((resolve) => {
          setTimeout(resolve, 4);
        });
        mCycles = 0;
      }
    }
  }
}
