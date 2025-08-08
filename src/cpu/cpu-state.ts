import { Flag, Register, RegisterFile } from "./register";
import {
  getLSB,
  getMSB,
  makeWord,
  wrappingDecrementWord,
  wrappingIncrementWord,
} from "../utils";

export interface IMemory {
  read(address: number): number;
  write(address: number, data: number): void;
  triggerWrite(address: number): void;
  triggerReadWrite(address: number): void;
}

export const enum RegisterPair {
  AF = 0,
  BC = 1,
  DE = 2,
  HL = 3,
  SP = 4,
  PC = 5,
}

const highRegisterOfPair: Record<RegisterPair, Register> = {
  [RegisterPair.AF]: Register.A,
  [RegisterPair.BC]: Register.B,
  [RegisterPair.DE]: Register.D,
  [RegisterPair.HL]: Register.H,
  [RegisterPair.SP]: Register.SP_H,
  [RegisterPair.PC]: Register.PC_H,
};

const lowRegisterOfPair: Record<RegisterPair, Register> = {
  [RegisterPair.AF]: Register.F,
  [RegisterPair.BC]: Register.C,
  [RegisterPair.DE]: Register.E,
  [RegisterPair.HL]: Register.L,
  [RegisterPair.SP]: Register.SP_L,
  [RegisterPair.PC]: Register.PC_L,
};

export interface CpuStateOptions {
  memory: IMemory;
  onCycle: () => void;
}

export interface InstructionContext {
  readRegister(register: Register): number;
  writeRegister(register: Register, value: number): void;
  readRegisterPair(pair: RegisterPair): number;
  readLowRegisterOfPair(pair: RegisterPair): number;
  readHighRegisterOfPair(pair: RegisterPair): number;
  writeRegisterPair(pair: RegisterPair, value: number): void;

  getFlag(flag: Flag): boolean;
  setFlag(flag: Flag, value: boolean): void;
  checkCondition(condition: Condition): boolean;

  readMemory(address: number): number;
  writeMemory(address: number, data: number): void;
  triggerMemoryWrite(address: number): void;
  triggerMemoryReadWrite(address: number): void;
  readMemoryCycle(address: number): number;
  writeMemoryCycle(address: number, data: number): void;

  pushWord(value: number): void;
  popWord(): number;

  halt(): void;
  stop(): void;

  setInterruptMasterEnable(enable: boolean): void;
  scheduleInterruptMasterEnable(): void;

  fetchImmediateByte(): number;
  fetchImmediateWord(): number;

  beginNextCycle(): void;
}

export const enum Condition {
  Z,
  C,
  NZ,
  NC,
}

export class CpuState implements InstructionContext {
  private regs = new RegisterFile();
  private ime = false;
  private halted = false;
  private stopped = false;
  private elapsedCycles = 0;
  private opcode = 0;
  private imeNext = false;
  private memory: IMemory;
  private onCycle: () => void;

  public constructor({ memory, onCycle }: CpuStateOptions) {
    this.memory = memory;
    this.onCycle = onCycle;
  }

  public beginNextCycle() {
    this.elapsedCycles += 1;
    this.onCycle();
  }

  public resetCycle() {
    this.elapsedCycles = 0;
  }

  public getElapsedCycles() {
    return this.elapsedCycles;
  }

  public readRegister(register: Register) {
    return this.regs.readRegister(register);
  }

  public writeRegister(register: Register, value: number) {
    this.regs.writeRegister(register, value);
  }

  public readRegisterPair(pair: RegisterPair) {
    return makeWord(
      this.regs.readRegister(highRegisterOfPair[pair]),
      this.regs.readRegister(lowRegisterOfPair[pair])
    );
  }

  public readLowRegisterOfPair(pair: RegisterPair) {
    return this.regs.readRegister(lowRegisterOfPair[pair]);
  }

  public readHighRegisterOfPair(pair: RegisterPair) {
    return this.regs.readRegister(highRegisterOfPair[pair]);
  }

  public writeRegisterPair(pair: RegisterPair, value: number) {
    this.regs.writeRegister(highRegisterOfPair[pair], getMSB(value));
    this.regs.writeRegister(lowRegisterOfPair[pair], getLSB(value));
  }

  public getFlag(flag: Flag) {
    return this.regs.getFlag(flag);
  }

  public setFlag(flag: Flag, value: boolean) {
    this.regs.setFlag(flag, value);
  }

  public readMemory(address: number) {
    return this.memory.read(address);
  }

  public readMemoryCycle(address: number): number {
    const value = this.memory.read(address);
    this.beginNextCycle();
    return value;
  }

  public writeMemory(address: number, data: number) {
    this.memory.write(address, data);
  }

  public writeMemoryCycle(address: number, data: number) {
    this.memory.write(address, data);
    this.beginNextCycle();
  }

  public triggerMemoryWrite(address: number) {
    this.memory.triggerWrite(address);
  }

  public triggerMemoryReadWrite(address: number) {
    this.memory.triggerReadWrite(address);
  }

  public setHalted(halted: boolean) {
    this.halted = halted;
  }

  public halt() {
    this.setHalted(true);
  }

  public isHalted() {
    return this.halted;
  }

  public stop() {
    this.stopped = true;
  }

  public isStopped() {
    return this.stopped;
  }

  public getOpcode() {
    return this.opcode;
  }

  public setInterruptMasterEnable(ime: boolean) {
    this.ime = ime;
    this.imeNext = false;
  }

  public isInterruptMasterEnabled() {
    return this.ime;
  }

  public scheduleInterruptMasterEnable() {
    this.imeNext = true;
  }

  public isInterruptMasterEnableScheduled() {
    return this.imeNext;
  }

  public fetchImmediateByte() {
    let address = this.readRegisterPair(RegisterPair.PC);
    const data = this.readMemoryCycle(address);

    this.advancePC();

    return data;
  }

  public fetchImmediateWord() {
    const lsb = this.fetchImmediateByte();
    const msb = this.fetchImmediateByte();
    return makeWord(msb, lsb);
  }

  public fetchNextOpcode() {
    let address = this.readRegisterPair(RegisterPair.PC);
    this.opcode = this.readMemory(address);
  }

  public checkCondition(condition: Condition) {
    switch (condition) {
      case Condition.Z:
        return this.getFlag(Flag.Z);
      case Condition.C:
        return this.getFlag(Flag.CY);
      case Condition.NZ:
        return !this.getFlag(Flag.Z);
      case Condition.NC:
        return !this.getFlag(Flag.CY);
    }
  }

  public pushWord(data: number) {
    let address = this.readRegisterPair(RegisterPair.SP);

    this.triggerMemoryWrite(address);
    this.writeRegisterPair(RegisterPair.SP, wrappingDecrementWord(address));

    this.beginNextCycle();

    address = this.readRegisterPair(RegisterPair.SP);

    this.triggerMemoryWrite(address);
    this.writeRegisterPair(RegisterPair.SP, wrappingDecrementWord(address));

    this.writeMemoryCycle(address, getMSB(data));

    address = this.readRegisterPair(RegisterPair.SP);
    this.writeMemory(address, getLSB(data));
  }

  public popWord() {
    let address = this.readRegisterPair(RegisterPair.SP);

    this.writeRegisterPair(RegisterPair.SP, wrappingIncrementWord(address));
    this.triggerMemoryReadWrite(address);

    const lsb = this.readMemoryCycle(address);

    address = this.readRegisterPair(RegisterPair.SP);

    this.writeRegisterPair(RegisterPair.SP, wrappingIncrementWord(address));

    const msb = this.readMemoryCycle(address);

    return makeWord(msb, lsb);
  }

  public updateInterruptMasterEnabled() {
    if (this.isInterruptMasterEnableScheduled()) {
      this.setInterruptMasterEnable(true);
    }
  }

  public advancePC() {
    const address = this.readRegisterPair(RegisterPair.PC);
    this.writeRegisterPair(RegisterPair.PC, wrappingIncrementWord(address));
  }
}
