import { CpuState, IBus } from "./cpu-state";
import { getInstruction, getPrefixCBInstruction } from "./instructions";
import { InterruptController } from "../hw/interrupt-controller";
import { RegisterPair } from "./register";

export class Cpu extends CpuState {
  public constructor(
    memory: IBus,
    private interruptController: InterruptController
  ) {
    super(memory);
  }

  public step() {
    if (this.interruptController.hasPendingInterrupt()) {
      this.setHalted(false);

      if (this.getIME()) {
        this.setIME(false);

        const irq = this.interruptController.getPendingInterrupt();
        this.interruptController.acknowledgeInterrupt(irq);

        const handlerAddress = 0x40 + irq * 8;

        this.pushWord(this.readRegisterPair(RegisterPair.PC));
        this.writeRegisterPair(RegisterPair.PC, handlerAddress);

        return 20;
      }
    }

    if (this.isHalted()) {
      return 4;
    }

    const instruction = this.fetchNextInstruction();
    return instruction[1].call(this);
  }

  private fetchNextInstruction() {
    const opcode = this.fetchImmediateByte();

    if (opcode == 0xcb) {
      return this.fetchNextPrefixCbInstruction();
    }

    const instruction = getInstruction(opcode);

    if (typeof instruction === "undefined") {
      throw new Error(`Invalid opcode ${opcode.toString(16)}`);
    }

    return instruction;
  }

  private fetchNextPrefixCbInstruction() {
    const opcode = this.fetchImmediateByte();
    const instruction = getPrefixCBInstruction(opcode);

    if (typeof instruction === "undefined") {
      throw new Error(`Invalid opcode CB ${opcode.toString(16)}`);
    }

    return instruction;
  }
}
