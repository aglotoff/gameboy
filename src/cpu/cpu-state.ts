import { Flag, Register, RegisterFile, RegisterPair } from "./register";
import { wrapIncrementWord } from "../utils";

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

  public constructor({ bus, onCycle }: CpuStateOptions) {
    this.bus = bus;
    this.onCycle = onCycle;
  }

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
    let pc = this.readRegisterPair(RegisterPair.PC);
    const data = this.readBus(pc);
    this.cycle();

    this.writeRegisterPair(RegisterPair.PC, wrapIncrementWord(pc));
    return data;
  }

  public fetchNextOpcode() {
    let pc = this.readRegisterPair(RegisterPair.PC);
    this.opcode = this.readBus(pc);
    this.cycle();
  }

  public advancePC() {
    let pc = this.readRegisterPair(RegisterPair.PC);
    this.writeRegisterPair(RegisterPair.PC, wrapIncrementWord(pc));

    if (this.imeNext) {
      this.setInterruptMasterEnable(true);
    }
  }
}
