import { Flag, Register, RegisterFile, RegisterPair } from "./register";
import {
  getLSB,
  getMSB,
  makeWord,
  wrapDecrementWord,
  wrapIncrementWord,
} from "../utils";

export enum Condition {
  Z,
  C,
  NZ,
  NC,
}

export interface IBus {
  read(address: number): number;
  write(address: number, data: number): void;
}

export class CpuState {
  private regs = new RegisterFile();
  private ime = false;
  private halted = false;
  private stopped = false;
  private elapsedCycles = 0;

  public constructor(protected memory: IBus, private onCycle: () => void) {}

  public cycle() {
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
    return this.regs.read(register);
  }

  public writeRegister(register: Register, value: number) {
    this.regs.write(register, value);
  }

  public readRegisterPair(pair: RegisterPair) {
    return this.regs.readPair(pair);
  }

  public writeRegisterPair(pair: RegisterPair, value: number) {
    this.regs.writePair(pair, value);
  }

  public isFlagSet(flag: Flag) {
    return this.regs.isFlagSet(flag);
  }

  public setFlag(flag: Flag, value: boolean) {
    this.regs.setFlag(flag, value);
  }

  public readBus(address: number) {
    return this.memory.read(address);
  }

  public writeBus(address: number, data: number) {
    this.memory.write(address, data);
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

  public setIME(ime: boolean) {
    this.ime = ime;
  }

  public getIME() {
    return this.ime;
  }

  public checkCondition(condition: Condition) {
    switch (condition) {
      case Condition.Z:
        return this.isFlagSet(Flag.Z);
      case Condition.C:
        return this.isFlagSet(Flag.CY);
      case Condition.NZ:
        return !this.isFlagSet(Flag.Z);
      case Condition.NC:
        return !this.isFlagSet(Flag.CY);
    }
  }

  public fetchImmediateByte() {
    let pc = this.readRegisterPair(RegisterPair.PC);
    const data = this.readBus(pc);
    this.writeRegisterPair(RegisterPair.PC, wrapIncrementWord(pc));
    return data;
  }

  public fetchImmediateWord() {
    let lowByte = this.fetchImmediateByte();
    let highByte = this.fetchImmediateByte();
    return makeWord(highByte, lowByte);
  }

  public pushWord(data: number) {
    let sp = this.readRegisterPair(RegisterPair.SP);

    sp = wrapDecrementWord(sp);
    this.writeBus(sp, getMSB(data));
    sp = wrapDecrementWord(sp);
    this.writeBus(sp, getLSB(data));

    this.writeRegisterPair(RegisterPair.SP, sp);
  }

  public popWord() {
    let sp = this.readRegisterPair(RegisterPair.SP);

    const lsb = this.readBus(sp);
    sp = wrapIncrementWord(sp);
    const msb = this.readBus(sp);
    sp = wrapIncrementWord(sp);

    this.writeRegisterPair(RegisterPair.SP, sp);

    return makeWord(msb, lsb);
  }
}
