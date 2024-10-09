import { IMemory } from "./memory";
import { Flag, Register, RegisterFile, RegisterPair } from "./regs";
import {
  getLSB,
  getMSB,
  makeWord,
  wrapDecrementWord,
  wrapIncrementWord,
} from "./utils";

export enum Condition {
  Z,
  C,
  NZ,
  NC,
}

export class CpuState {
  private regs = new RegisterFile();
  private ime = false;
  private halted = false;
  private stopped = false;

  public constructor(protected memory: IMemory) {}

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

  protected checkCondition(condition: Condition) {
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

  protected fetchImmediateByte() {
    let pc = this.readRegisterPair(RegisterPair.PC);
    const data = this.readBus(pc);
    this.writeRegisterPair(RegisterPair.PC, wrapIncrementWord(pc));
    return data;
  }

  protected fetchImmediateWord() {
    let lowByte = this.fetchImmediateByte();
    let highByte = this.fetchImmediateByte();
    return makeWord(highByte, lowByte);
  }

  protected pushWord(data: number) {
    let sp = this.readRegisterPair(RegisterPair.SP);

    sp = wrapDecrementWord(sp);
    this.writeBus(sp, getMSB(data));
    sp = wrapDecrementWord(sp);
    this.writeBus(sp, getLSB(data));

    this.writeRegisterPair(RegisterPair.SP, sp);
  }

  protected popWord() {
    let sp = this.readRegisterPair(RegisterPair.SP);

    const lsb = this.readBus(sp);
    sp = wrapIncrementWord(sp);
    const msb = this.readBus(sp);
    sp = wrapIncrementWord(sp);

    this.writeRegisterPair(RegisterPair.SP, sp);

    return makeWord(msb, lsb);
  }
}
