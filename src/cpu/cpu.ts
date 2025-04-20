import { CpuState, IBus } from "./cpu-state";
import { getInstruction, getPrefixCBInstruction } from "./instructions";
import { InterruptController } from "../hw/interrupt-controller";
import { RegisterPair } from "./register";
import { getLSB, getMSB, wrappingDecrementWord } from "../utils";

export class Cpu extends CpuState {
  public constructor(
    bus: IBus,
    private interruptController: InterruptController,
    onCycle: () => void
  ) {
    super({ bus, onCycle });
  }

  public step() {
    try {
      if (this.isHalted()) {
        this.beginNextCycle();
      } else {
        this.executeNextInstruction();
      }

      this.processInterruptRequests();

      if (!this.isHalted()) {
        this.advancePC();
      }
    } catch (error) {
      this.stop();
      throw error;
    }
  }

  private executeNextInstruction() {
    const instruction = this.decodeInstruction(this.getOpcode());
    instruction[1](this);
  }

  private decodeInstruction(opcode: number) {
    if (opcode == 0xcb) {
      return this.decodePrefixCBInstruction(this.fetchImmediateByte());
    }

    const instruction = getInstruction(opcode);

    if (typeof instruction === "undefined") {
      throw new Error(`Invalid opcode ${opcode.toString(16)}`);
    }

    return instruction;
  }

  private decodePrefixCBInstruction(opcode: number) {
    const instruction = getPrefixCBInstruction(opcode);

    if (typeof instruction === "undefined") {
      throw new Error(`Invalid opcode CB ${opcode.toString(16)}`);
    }

    return instruction;
  }

  private processInterruptRequests() {
    if (this.interruptController.hasPendingInterrupt()) {
      this.setHalted(false);

      if (this.isInterruptMasterEnabled()) {
        this.handleInterrupt();
      }
    }
  }

  private handleInterrupt() {
    this.setInterruptMasterEnable(false);

    this.beginNextCycle();

    let sp = this.getRegisterPair(RegisterPair.SP);
    sp = wrappingDecrementWord(sp);

    this.beginNextCycle();

    this.writeBus(sp, getMSB(this.getRegisterPair(RegisterPair.PC)));
    sp = wrappingDecrementWord(sp);

    this.beginNextCycle();

    const irq = this.interruptController.getPendingInterrupt();

    this.writeBus(sp, getLSB(this.getRegisterPair(RegisterPair.PC)));
    this.setRegisterPair(RegisterPair.SP, sp);

    this.beginNextCycle();

    if (irq < 0) {
      this.setRegisterPair(RegisterPair.PC, 0);
    } else {
      this.interruptController.acknowledgeInterrupt(irq);
      this.setRegisterPair(RegisterPair.PC, getInterruptVectorAddress(irq));
    }

    this.beginNextCycle();
    this.fetchNextOpcode();
  }
}

function getInterruptVectorAddress(irq: number) {
  return 0x40 + irq * 8;
}
