import { CpuState, IBus } from "./cpu-state";
import { getInstruction, getPrefixCBInstruction } from "./instructions";
import { InterruptController } from "../hw/interrupt-controller";
import { RegisterPair } from "./register";
import { getLSB, getMSB, wrapDecrementWord } from "../utils";

export class Cpu extends CpuState {
  public constructor(
    memory: IBus,
    private interruptController: InterruptController,
    onCycle: () => void
  ) {
    super(memory, onCycle);
  }

  public step() {
    try {
      if (this.isHalted()) {
        this.cycle();
      } else {
        const instruction = this.fetchNextInstruction();
        instruction[1].call(this);
      }

      if (this.interruptController.hasPendingInterrupt()) {
        this.setHalted(false);

        if (this.getIME()) {
          this.setIME(false);
          this.cancelIME();

          let sp = this.readRegisterPair(RegisterPair.SP);

          sp = wrapDecrementWord(sp);
          this.cycle();

          this.writeBus(sp, getMSB(this.readRegisterPair(RegisterPair.PC)));
          sp = wrapDecrementWord(sp);
          this.cycle();

          const irq = this.interruptController.getPendingInterrupt();

          this.writeBus(sp, getLSB(this.readRegisterPair(RegisterPair.PC)));
          this.writeRegisterPair(RegisterPair.SP, sp);
          this.cycle();

          if (irq < 0) {
            this.writeRegisterPair(RegisterPair.PC, 0);
          } else {
            this.interruptController.acknowledgeInterrupt(irq);
            this.writeRegisterPair(RegisterPair.PC, 0x40 + irq * 8);
          }

          //this.pushWord(this.readRegisterPair(RegisterPair.PC));

          this.cycle();

          this.fetchNextOpcode();
        }
      }

      if (!this.isHalted()) {
        this.advancePC();
      }
    } catch (error) {
      this.stop();
      throw error;
    }
  }

  private fetchNextInstruction() {
    if (this.opcode == 0xcb) {
      return this.fetchNextPrefixCbInstruction();
    }

    const instruction = getInstruction(this.opcode);

    if (typeof instruction === "undefined") {
      throw new Error(`Invalid opcode ${this.opcode.toString(16)}`);
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
