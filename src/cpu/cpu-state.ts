import { RegisterFile } from "./register";

export interface IMemory {
  read(address: number): number;
  write(address: number, data: number): void;
  triggerWrite(address: number): void;
  triggerReadWrite(address: number): void;
}

export interface CpuStateOptions {
  onCycle: () => void;
}

export interface InstructionContext {
  registers: RegisterFile;
  memory: IMemory;
  state: CpuState;
}

export class CpuState {
  private ime = false;
  private halted = false;
  private stopped = false;
  private imeNext = false;
  private onCycle: () => void;

  public constructor({ onCycle }: CpuStateOptions) {
    this.onCycle = onCycle;
  }

  public beginNextCycle() {
    this.onCycle();
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
