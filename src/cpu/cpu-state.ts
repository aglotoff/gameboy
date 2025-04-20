import { Flag, Register, RegisterFile, RegisterPair } from "./register";
import { wrappingIncrementWord } from "../utils";

export interface IBus {
  read(address: number): number;
  write(address: number, data: number): void;
}

export interface CpuStateOptions {
  bus: IBus;
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
  private bus: IBus;
  private onCycle: () => void;

  public reset() {
    this.regs = new RegisterFile();
    this.ime = false;
    this.halted = false;
    this.stopped = false;
    this.elapsedCycles = 0;
    this.opcode = 0;
    this.imeNext = false;
  }

  public constructor({ bus, onCycle }: CpuStateOptions) {
    this.bus = bus;
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

  public getRegister(register: Register) {
    return this.regs.getRegister(register);
  }

  public setRegister(register: Register, value: number) {
    this.regs.setRegister(register, value);
  }

  public getRegisterPair(pair: RegisterPair) {
    return this.regs.getRegisterPair(pair);
  }

  public setRegisterPair(pair: RegisterPair, value: number) {
    this.regs.setRegisterPair(pair, value);
  }

  public getFlag(flag: Flag) {
    return this.regs.getFlag(flag);
  }

  public setFlag(flag: Flag, value: boolean) {
    this.regs.setFlag(flag, value);
  }

  public readBus(address: number) {
    return this.bus.read(address);
  }

  public writeBus(address: number, data: number) {
    this.bus.write(address, data);
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
    let pc = this.getRegisterPair(RegisterPair.PC);
    const data = this.readBus(pc);
    this.beginNextCycle();

    this.setRegisterPair(RegisterPair.PC, wrappingIncrementWord(pc));
    return data;
  }

  public fetchNextOpcode() {
    let pc = this.getRegisterPair(RegisterPair.PC);
    this.opcode = this.readBus(pc);
  }

  public advancePC() {
    let pc = this.getRegisterPair(RegisterPair.PC);
    this.setRegisterPair(RegisterPair.PC, wrappingIncrementWord(pc));

    if (this.imeNext) {
      this.setInterruptMasterEnable(true);
    }
  }
}
