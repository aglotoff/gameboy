import { CpuState, IMemory } from "./cpu-state";
import { getInstruction, getPrefixCBInstruction } from "./instructions";
import { InterruptController } from "../hw/interrupt-controller";
import { RegisterPair } from "./register";
import { getLSB, getMSB, wrappingDecrementWord } from "../utils";

export class Cpu extends CpuState {
  public constructor(
    memory: IMemory,
    private interruptController: InterruptController,
    onCycle: () => void
  ) {
    super({ memory, onCycle });
  }

  public step() {
    try {
      if (this.isHalted()) {
        this.beginNextCycle();
      } else {
        this.executeNextInstruction();

        if (this.isHaltBug()) {
          // HALT mode is not entered, but the CPU fails to increase PC
          this.setHalted(false);
          return;
        }
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

  private isHaltBug() {
    return (
      this.isHalted() &&
      !this.isInterruptMasterEnabled() &&
      this.interruptController.hasPendingInterrupt()
    );
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

    let sp = this.readRegisterPair(RegisterPair.SP);
    sp = wrappingDecrementWord(sp);

    this.beginNextCycle();

    this.writeMemory(sp, getMSB(this.readRegisterPair(RegisterPair.PC)));
    sp = wrappingDecrementWord(sp);

    this.beginNextCycle();

    const irq = this.interruptController.getPendingInterrupt();

    this.writeMemory(sp, getLSB(this.readRegisterPair(RegisterPair.PC)));
    this.writeRegisterPair(RegisterPair.SP, sp);

    this.beginNextCycle();

    if (irq < 0) {
      this.writeRegisterPair(RegisterPair.PC, 0);
    } else {
      this.interruptController.acknowledgeInterrupt(irq);
      this.writeRegisterPair(RegisterPair.PC, getInterruptVectorAddress(irq));
    }

    this.beginNextCycle();
    this.fetchNextOpcode();
  }
}

function getInterruptVectorAddress(irq: number) {
  return 0x40 + irq * 8;
}
