export interface IMemory {
  read(address: number): number;
  write(address: number, data: number): void;
  triggerWrite(address: number): void;
  triggerReadWrite(address: number): void;
}

export class CpuState {
  private ime = false;
  private halted = false;
  private stopped = false;
  private elapsedCycles = 0;
  private imeNext = false;

  public constructor(private onCycle = () => {}) {}

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

  public updateInterruptMasterEnabled() {
    if (this.isInterruptMasterEnableScheduled()) {
      this.setInterruptMasterEnable(true);
    }
  }
}
