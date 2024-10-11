import { wrapIncrementByte } from "../utils";

export class Timer {
  private ticksToCounterIncrement = 0;
  private ticksToDividerIncrement = 0;

  private dividerRegister = 0;
  private counterRegister = 0;
  private moduloRegister = 0;
  private controlRegister = 0;

  public constructor(private onInterruptRequest: () => void) {}

  public getDividerRegister() {
    return this.dividerRegister;
  }

  public setDividerRegister(_data: number) {
    this.dividerRegister = 0x00;
  }

  public getCounterRegister() {
    return this.counterRegister;
  }

  public setCounterRegister(data: number) {
    this.counterRegister = data;
  }

  public getModuloRegister() {
    return this.moduloRegister;
  }

  public setModuloRegister(data: number) {
    this.moduloRegister = data;
  }

  public getControlRegister() {
    return this.controlRegister;
  }

  public setControlRegister(data: number) {
    this.controlRegister = data & 0x7;
    this.ticksToCounterIncrement = this.getCounterFrequency();
  }

  public tick() {
    this.dividerTick();

    if (this.isCounterEnabled()) {
      this.counterTick();
    }
  }

  private dividerTick() {
    if (this.ticksToDividerIncrement === 0) {
      this.dividerRegister = wrapIncrementByte(this.dividerRegister);
      this.ticksToDividerIncrement = 64 * 4;
    }
    this.ticksToDividerIncrement -= 1;
  }

  private isCounterEnabled() {
    return (this.controlRegister & 0x4) !== 0;
  }

  private counterTick() {
    if (this.ticksToCounterIncrement === 0) {
      if (this.counterRegister == 0xff) {
        this.counterRegister = this.moduloRegister;
        this.onInterruptRequest();
      } else {
        this.counterRegister += 1;
      }

      this.ticksToCounterIncrement = this.getCounterFrequency();
    }

    this.ticksToCounterIncrement -= 1;
  }

  private getCounterFrequency() {
    switch (this.controlRegister & 0x3) {
      case 0:
        return 256 * 4;
      case 1:
        return 4 * 4;
      case 2:
        return 16 * 4;
      case 3:
        return 64 * 4;
      default:
        return 0;
    }
  }
}
