import { CpuState, IBus } from "./cpu-state";
import { getInstruction, getPrefixCBInstruction } from "./instructions";
import { InterruptController } from "../hw/interrupt-controller";
import { RegisterPair } from "./register";
import { getLSB, getMSB, wrapDecrementWord } from "../utils";

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
        this.cycle();
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
    instruction[1].call(this);
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
      this.writeRegisterPair(RegisterPair.PC, getInterruptVectorAddress(irq));
    }

    this.cycle();

    this.fetchNextOpcode();
  }
}

function getInterruptVectorAddress(irq: number) {
  return 0x40 + irq * 8;
}
