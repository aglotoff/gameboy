import { Flag, Register, RegisterFile, RegisterPair } from "./register";

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

  readMemory(address: number): number;
  writeMemory(address: number, data: number): void;
  triggerMemoryWrite(address: number): void;
  triggerMemoryReadWrite(address: number): void;

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

  private imeNext = false;
  private memory: IMemory;
  private onCycle: () => void;

  public constructor({ memory, onCycle }: CpuStateOptions) {
    this.memory = memory;
    this.onCycle = onCycle;
  }

  public beginNextCycle() {
    this.onCycle();
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

  public writeMemory(address: number, data: number) {
    this.memory.write(address, data);
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
}
