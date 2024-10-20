import {
  getMSB,
  testBit,
  wrapIncrementByte,
  wrapIncrementWord,
} from "../utils";

export class Timer {
  private divider = 0;
  private ticksToReload = 0;
  private counterRegister = 0;
  private moduloRegister = 0;
  private controlRegister = 0;
  private tickBitHigh = false;
  private isReloading = false;
  private reloadAborted = false;

  public constructor(private onInterruptRequest: () => void) {}

  public getDividerRegister() {
    return getMSB(this.divider);
  }

  public setDividerRegister(_data: number) {
    this.divider = 0;
  }

  public getCounterRegister() {
    return this.counterRegister;
  }

  public setCounterRegister(data: number) {
    if (!this.isReloading) {
      this.counterRegister = data;

      if (this.ticksToReload > 0) {
        this.reloadAborted = true;
      }
    }
  }

  public getModuloRegister() {
    return this.moduloRegister;
  }

  public setModuloRegister(data: number) {
    this.moduloRegister = data;

    if (this.isReloading) {
      this.counterRegister = data;
    }
  }

  public getControlRegister() {
    return this.controlRegister;
  }

  public setControlRegister(data: number) {
    this.controlRegister = data & 0x7;
  }

  public tick() {
    this.divider = wrapIncrementWord(this.divider);

    this.isReloading = false;

    if (this.ticksToReload > 0) {
      this.ticksToReload -= 1;

      if (this.ticksToReload === 0 && !this.reloadAborted) {
        this.onInterruptRequest();
        this.counterRegister = this.moduloRegister;
        this.isReloading = true;
      }
    }

    const isFallingEdge = this.tickBitHigh && !this.testTickBit();

    if (isFallingEdge) {
      this.incrementCounter();
    }

    this.tickBitHigh = this.testTickBit();
  }

  private incrementCounter() {
    this.counterRegister = wrapIncrementByte(this.counterRegister);

    if (this.counterRegister === 0) {
      this.reloadAborted = false;
      this.counterRegister = 0;
      this.ticksToReload = 4;
    }
  }

  private isCounterEnabled() {
    return testBit(this.controlRegister, 2);
  }

  private testTickBit() {
    return testBit(this.divider, this.getTickBit()) && this.isCounterEnabled();
  }

  private getTickBit() {
    switch (this.controlRegister & 0x3) {
      case 0:
        return 9;
      case 1:
        return 3;
      case 2:
        return 5;
      case 3:
        return 7;
      default:
        // make TS happy
        return 0;
    }
  }
}
