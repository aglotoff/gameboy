import { IMemory } from "./memory";
import { Flag, Register, RegisterFile, RegisterPair } from "./regs";
import {
  getLSB,
  getMSB,
  makeWord,
  wrapDecrementWord,
  wrapIncrementWord,
} from "./utils";

export type Condition = "Z" | "C" | "NZ" | "NC";

export class CpuState {
  private regs = new RegisterFile();
  private ime = false;
  private halted = false;
  private stopped = false;

  public constructor(private memory: IMemory) {}

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

  public checkCondition(condition: Condition) {
    switch (condition) {
      case "Z":
        return this.isFlagSet(Flag.Z);
      case "C":
        return this.isFlagSet(Flag.CY);
      case "NZ":
        return !this.isFlagSet(Flag.Z);
      case "NC":
        return !this.isFlagSet(Flag.CY);
    }
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
}

export function fetchImmediateByte(state: CpuState) {
  let pc = state.readRegisterPair(RegisterPair.PC);
  const data = state.readBus(pc);
  state.writeRegisterPair(RegisterPair.PC, wrapIncrementWord(pc));
  return data;
}

export function fetchImmediateWord(state: CpuState) {
  let lowByte = fetchImmediateByte(state);
  let highByte = fetchImmediateByte(state);
  return makeWord(highByte, lowByte);
}

export function pushWord(state: CpuState, data: number) {
  let sp = state.readRegisterPair(RegisterPair.SP);

  sp = wrapDecrementWord(sp);
  state.writeBus(sp, getMSB(data));
  sp = wrapDecrementWord(sp);
  state.writeBus(sp, getLSB(data));

  state.writeRegisterPair(RegisterPair.SP, sp);
}

export function popWord(state: CpuState) {
  let sp = state.readRegisterPair(RegisterPair.SP);

  const lsb = state.readBus(sp);
  sp = wrapIncrementWord(sp);
  const msb = state.readBus(sp);
  sp = wrapIncrementWord(sp);

  state.writeRegisterPair(RegisterPair.SP, sp);

  return makeWord(msb, lsb);
}
