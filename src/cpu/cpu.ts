import { CpuState, IMemory, RegisterPair } from "./cpu-state";
import { getInstruction, getPrefixCBInstruction } from "./instructions";
import { InterruptController } from "../hw/interrupt-controller";
import { getLSB, getMSB, wrappingDecrementWord } from "../utils";
import { Register } from "./register";

export class Cpu {
  private state: CpuState;

  public constructor(
    memory: IMemory,
    private interruptController: InterruptController,
    onCycle: () => void
  ) {
    this.state = new CpuState({ memory, onCycle });

    // TODO: this extra M-cycle was added to pass boot_div-dmgABCmgb, do we
    // miss something?
    this.state.beginNextCycle();
  }

  public step() {
    try {
      if (this.state.isHalted()) {
        this.state.beginNextCycle();
      } else {
        this.executeNextInstruction();

        if (this.isHaltBug()) {
          // HALT mode is not entered, but the CPU fails to increase PC
          this.state.setHalted(false);
          return;
        }
      }

      this.processInterruptRequests();

      if (!this.state.isHalted()) {
        this.state.advancePC();
        this.state.updateInterruptMasterEnabled();
      }
    } catch (error) {
      this.state.stop();
      throw error;
    }
  }

  private executeNextInstruction() {
    const instruction = this.decodeInstruction(this.state.getOpcode());
    instruction[1](this.state);
    this.state.fetchNextOpcode();
  }

  private decodeInstruction(opcode: number) {
    if (opcode == 0xcb) {
      return this.decodePrefixCBInstruction(this.state.fetchImmediateByte());
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
      this.state.isHalted() &&
      !this.state.isInterruptMasterEnabled() &&
      this.interruptController.hasPendingInterrupt()
    );
  }

  private processInterruptRequests() {
    if (this.interruptController.hasPendingInterrupt()) {
      this.state.setHalted(false);

      if (this.state.isInterruptMasterEnabled()) {
        this.handleInterrupt();
      }
    }
  }

  private handleInterrupt() {
    this.state.setInterruptMasterEnable(false);

    this.state.beginNextCycle();

    let sp = this.state.readRegisterPair(RegisterPair.SP);
    sp = wrappingDecrementWord(sp);

    this.state.beginNextCycle();

    this.state.writeMemory(
      sp,
      getMSB(this.state.readRegisterPair(RegisterPair.PC))
    );

    this.state.beginNextCycle();

    sp = wrappingDecrementWord(sp);

    const irq = this.interruptController.getPendingInterrupt();

    this.state.writeMemory(
      sp,
      getLSB(this.state.readRegisterPair(RegisterPair.PC))
    );
    this.state.writeRegisterPair(RegisterPair.SP, sp);

    this.state.beginNextCycle();

    if (irq < 0) {
      this.state.writeRegisterPair(RegisterPair.PC, 0);
    } else {
      this.interruptController.acknowledgeInterrupt(irq);
      this.state.writeRegisterPair(
        RegisterPair.PC,
        getInterruptVectorAddress(irq)
      );
    }

    this.state.beginNextCycle();
    this.state.fetchNextOpcode();
  }

  public writeRegister(reg: Register, value: number) {
    this.state.writeRegister(reg, value);
  }

  public resetCycle() {
    this.state.resetCycle();
  }

  public getElapsedCycles() {
    return this.state.getElapsedCycles();
  }

  public isStopped() {
    return this.state.isStopped();
  }
}

function getInterruptVectorAddress(irq: number) {
  return 0x40 + irq * 8;
}
