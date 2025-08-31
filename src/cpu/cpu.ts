import { CpuState, IMemory } from "./cpu-state";
import { getInstruction, InstructionContext } from "./instructions";
import { InterruptController } from "../hw/interrupt-controller";
import {
  getLSB,
  getMSB,
  wrappingDecrementWord,
  wrappingIncrementWord,
} from "../utils";
import { Register, RegisterFile, RegisterPair } from "./register";

export class Cpu {
  private ctx: InstructionContext;
  private opcode = 0;

  public constructor(
    memory: IMemory,
    private interruptController: InterruptController,
    onCycle: () => void
  ) {
    this.ctx = {
      registers: new RegisterFile(),
      memory,
      state: new CpuState(onCycle),
    };

    this.ctx.registers.write(Register.A, 0x01);
    this.ctx.registers.write(Register.B, 0xff);
    this.ctx.registers.write(Register.C, 0x13);
    this.ctx.registers.write(Register.D, 0x00);

    // TODO: this extra M-cycle was added to pass boot_div-dmgABCmgb, do we
    // miss something?
    this.ctx.state.beginNextCycle();
  }

  public step() {
    try {
      if (this.ctx.state.isHalted()) {
        this.ctx.state.beginNextCycle();
      } else {
        this.executeNextInstruction();

        if (this.isHaltBug()) {
          // HALT mode is not entered, but the CPU fails to increase PC
          this.ctx.state.setHalted(false);
          return;
        }
      }

      this.processInterruptRequests();

      if (!this.ctx.state.isHalted()) {
        this.advancePC();
        this.ctx.state.updateInterruptMasterEnabled();
      }
    } catch (error) {
      this.ctx.state.stop();
      throw error;
    }
  }

  private advancePC() {
    const address = this.ctx.registers.readPair(RegisterPair.PC);
    this.ctx.registers.writePair(
      RegisterPair.PC,
      wrappingIncrementWord(address)
    );
  }

  private executeNextInstruction() {
    const instruction = this.decodeInstruction(this.opcode);
    instruction(this.ctx);
    this.fetchNextOpcode();
  }

  private fetchNextOpcode() {
    let address = this.ctx.registers.readPair(RegisterPair.PC);
    this.opcode = this.ctx.memory.read(address);
  }

  private decodeInstruction(opcode: number) {
    return getInstruction(opcode);
  }

  private isHaltBug() {
    return (
      this.ctx.state.isHalted() &&
      !this.ctx.state.isInterruptMasterEnabled() &&
      this.interruptController.hasPendingInterrupt()
    );
  }

  private processInterruptRequests() {
    if (this.interruptController.hasPendingInterrupt()) {
      this.ctx.state.setHalted(false);

      if (this.ctx.state.isInterruptMasterEnabled()) {
        this.handleInterrupt();
      }
    }
  }

  private handleInterrupt() {
    this.ctx.state.setInterruptMasterEnable(false);

    this.ctx.state.beginNextCycle();

    let sp = this.ctx.registers.readPair(RegisterPair.SP);
    sp = wrappingDecrementWord(sp);

    this.ctx.state.beginNextCycle();

    this.ctx.memory.write(
      sp,
      getMSB(this.ctx.registers.readPair(RegisterPair.PC))
    );

    this.ctx.state.beginNextCycle();

    sp = wrappingDecrementWord(sp);

    const irq = this.interruptController.getPendingInterrupt();

    this.ctx.memory.write(
      sp,
      getLSB(this.ctx.registers.readPair(RegisterPair.PC))
    );
    this.ctx.registers.writePair(RegisterPair.SP, sp);

    this.ctx.state.beginNextCycle();

    if (irq < 0) {
      this.ctx.registers.writePair(RegisterPair.PC, 0);
    } else {
      this.interruptController.acknowledgeInterrupt(irq);
      this.ctx.registers.writePair(
        RegisterPair.PC,
        getInterruptVectorAddress(irq)
      );
    }

    this.ctx.state.beginNextCycle();

    this.fetchNextOpcode();
  }

  public resetCycle() {
    this.ctx.state.resetCycle();
  }

  public getElapsedCycles() {
    return this.ctx.state.getElapsedCycles();
  }

  public isStopped() {
    return this.ctx.state.isStopped();
  }
}

function getInterruptVectorAddress(irq: number) {
  return 0x40 + irq * 8;
}
