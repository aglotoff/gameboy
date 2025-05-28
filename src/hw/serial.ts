// See: https://gbdev.io/pandocs/Serial_Data_Transfer_(Link_Cable).html

import { SystemCounter } from "./system-counter";

const SC_TRANSFER_START = 0x80;

type SerialCallback = (outByte: number) => number;

export class Serial {
  private sb: number = 0x00;
  private sc: number = 0x7e; // Unused bits are always set

  private transferBits: number = 0;
  private outByte: number = 0;
  private inByte: number = 0;
  private isTransferring: boolean = false;
  private inputClockMask = 1 << 8;
  private prevInputClockSignal = false;

  public constructor(
    private systemCounter: SystemCounter,
    private onTransfer?: SerialCallback
  ) {}

  public getTransferData() {
    return this.sb;
  }

  public getTransferControl() {
    return this.sc | 0x7e;
  }

  public setTransferData(value: number) {
    return (this.sb = value);
  }

  public setTransferControl(value: number) {
    this.sc = (value & 0x81) | 0x7e;
    if (value & SC_TRANSFER_START) {
      this.startTransfer();
    }
  }

  public tick() {
    const nextInputClockSignal =
      (this.systemCounter.getValue() & this.inputClockMask) !== 0;

    const isFallingEdge = this.prevInputClockSignal && !nextInputClockSignal;
    if (isFallingEdge) {
      this.doIt();
    }

    this.prevInputClockSignal = nextInputClockSignal;
  }

  private doIt() {
    if (!this.isTransferring) return;

    if (this.transferBits === 0) {
      this.inByte = 0xff;
    }

    const inBit = (this.inByte & 0x80) >> 7;
    this.inByte = (this.inByte << 1) & 0xff;

    this.sb = ((this.sb << 1) | inBit) & 0xff;

    this.transferBits++;
    if (this.transferBits >= 8) {
      this.isTransferring = false;
      this.sc &= ~SC_TRANSFER_START;
      this.transferBits = 0;

      this.onTransfer?.(this.outByte);
    }
  }

  private startTransfer(): void {
    if (this.isTransferring) return;
    this.isTransferring = true;
    this.transferBits = 0;
    this.outByte = this.sb;
  }
}
