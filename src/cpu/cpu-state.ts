import { Flag, Register, RegisterFile, RegisterPair } from "./register";
import { wrappingDecrementWord, wrappingIncrementWord } from "../utils";

export interface IMemory {
  read(address: number): number;
  write(address: number, data: number): void;
  triggerWrite(address: number): void;
  triggerReadWrite(address: number): void;
}

export interface CpuStateOptions {
  memory: IMemory;
  onCycle: () => void;
}

export interface InstructionContext {
  readRegister(register: Register): number;
  writeRegister(register: Register, value: number): void;
  readRegisterPair(pair: RegisterPair): number;
  writeRegisterPair(pair: RegisterPair, value: number): void;
  getFlag(flag: Flag): boolean;
  setFlag(flag: Flag, value: boolean): void;

  readMemoryCycle(address: number): number;
  writeMemoryCycle(address: number, data: number): void;
  decrementAndTriggerWrite(address: number): number;
  incrementAndTriggerWrite(address: number): number;
  decrementAndTriggerReadWrite(address: number): number;
  incrementAndTriggerReadWrite(address: number): number;

  halt(): void;
  stop(): void;

  setInterruptMasterEnable(enable: boolean): void;
  scheduleInterruptMasterEnable(): void;

  beginNextCycle(): void;
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
    return this.regs.readRegisterPair(pair);
  }

  public writeRegisterPair(pair: RegisterPair, value: number) {
    this.regs.writeRegisterPair(pair, value);
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

  public incrementAndTriggerReadWrite(address: number): number {
    this.memory.triggerReadWrite(address);
    return wrappingIncrementWord(address);
  }

  public decrementAndTriggerReadWrite(address: number): number {
    this.memory.triggerReadWrite(address);
    return wrappingDecrementWord(address);
  }

  public incrementAndTriggerWrite(address: number): number {
    this.memory.triggerWrite(address);
    return wrappingIncrementWord(address);
  }

  public decrementAndTriggerWrite(address: number): number {
    this.memory.triggerWrite(address);
    return wrappingDecrementWord(address);
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

  public fetchNextOpcode() {
    let address = this.readRegisterPair(RegisterPair.PC);
    this.opcode = this.readMemory(address);
  }

  public updateInterruptMasterEnabled() {
    if (this.isInterruptMasterEnableScheduled()) {
      this.setInterruptMasterEnable(true);
    }
  }
}
