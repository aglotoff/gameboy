import {
  Flag,
  getHighRegister,
  getLowRegister,
  Register,
  RegisterFile,
  RegisterPair,
} from "./register";
import { getLSB, getMSB, makeWord, wrappingIncrementWord } from "../utils";

export interface IMemory {
  read(address: number): number;
  write(address: number, data: number): void;
  triggerWrite(address: number): void;
  triggerIncrementRead(address: number): void;
}

export interface CpuStateOptions {
  memory: IMemory;
  onCycle: () => void;
}

export class CpuState {
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
      this.regs.readRegister(getHighRegister(pair)),
      this.regs.readRegister(getLowRegister(pair))
    );
  }

  public writeRegisterPair(pair: RegisterPair, value: number) {
    this.regs.writeRegister(getHighRegister(pair), getMSB(value));
    this.regs.writeRegister(getLowRegister(pair), getLSB(value));
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

  public triggerMemoryIncrementRead(address: number) {
    this.memory.triggerIncrementRead(address);
  }

  public setHalted(halted: boolean) {
    this.halted = halted;
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
    const data = this.readMemory(address);

    this.beginNextCycle();

    this.writeRegisterPair(RegisterPair.PC, wrappingIncrementWord(address));

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

  public advancePC() {
    const address = this.readRegisterPair(RegisterPair.PC);
    this.writeRegisterPair(RegisterPair.PC, wrappingIncrementWord(address));

    if (this.imeNext) {
      this.setInterruptMasterEnable(true);
    }
  }
}
