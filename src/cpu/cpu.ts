import { CpuState, IMemory, InstructionContext } from "./cpu-state";
import { getInstruction } from "./instructions";
import { InterruptController } from "../hw/interrupt-controller";
import {
  getLSB,
  getMSB,
  wrappingDecrementWord,
  wrappingIncrementWord,
} from "../utils";
import { Register, RegisterFile, RegisterPair } from "./register";

export interface CpuOptions {
  memory: IMemory;
  interruptController: InterruptController;
  onCycle: () => void;
}

export class Cpu {
  private registers: RegisterFile;
  private state: CpuState;
  private memory: IMemory;
  private interruptController: InterruptController;

  private instructionContext: InstructionContext;

  private opcode = 0;

  public constructor({ memory, interruptController, onCycle }: CpuOptions) {
    this.registers = new RegisterFile();
    this.state = new CpuState({ onCycle });
    this.memory = memory;
    this.interruptController = interruptController;

    this.instructionContext = {
      registers: this.registers,
      state: this.state,
      memory,
    };

    this.registers.write(Register.A, 0x01);
    this.registers.write(Register.B, 0xff);
    this.registers.write(Register.C, 0x13);
    this.registers.write(Register.D, 0x00);

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
        this.advancePC();
        this.updateInterruptMasterEnabled();
      }
    } catch (error) {
      this.state.stop();
      throw error;
    }
  }

  private advancePC() {
    const address = this.registers.readPair(RegisterPair.PC);
    this.registers.writePair(RegisterPair.PC, wrappingIncrementWord(address));
  }

  private updateInterruptMasterEnabled() {
    if (this.state.isInterruptMasterEnableScheduled()) {
      this.state.setInterruptMasterEnable(true);
    }
  }

  private executeNextInstruction() {
    const instruction = getInstruction(this.opcode);
    instruction(this.instructionContext);
    this.fetchNextOpcode();
  }

  private fetchNextOpcode() {
    let address = this.registers.readPair(RegisterPair.PC);
    this.opcode = this.memory.read(address);
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

    let sp = this.registers.readPair(RegisterPair.SP);
    sp = wrappingDecrementWord(sp);

    this.state.beginNextCycle();

    this.memory.write(sp, getMSB(this.registers.readPair(RegisterPair.PC)));

    this.state.beginNextCycle();

    sp = wrappingDecrementWord(sp);

    const irq = this.interruptController.getPendingInterrupt();

    this.memory.write(sp, getLSB(this.registers.readPair(RegisterPair.PC)));
    this.registers.writePair(RegisterPair.SP, sp);

    this.state.beginNextCycle();

    if (irq < 0) {
      this.registers.writePair(RegisterPair.PC, 0);
    } else {
      this.interruptController.acknowledgeInterrupt(irq);
      this.registers.writePair(RegisterPair.PC, getInterruptVectorAddress(irq));
    }

    this.state.beginNextCycle();
    this.fetchNextOpcode();
  }

  public isStopped() {
    return this.state.isStopped();
  }
}

function getInterruptVectorAddress(irq: number) {
  return 0x40 + irq * 8;
}
