import { makeWord } from "../utils";

export type DMAReadFn = (address: number) => number;

export interface DMAOptions {
  readCallback: DMAReadFn;
}

const OAM_SIZE = 160;

export class OAM {
  private data = new Uint8Array(OAM_SIZE);

  private dmaInProgress = false;
  private ticksToDMA = 0;
  private dmaSource = 0;

  private readCallback: DMAReadFn;

  public constructor({ readCallback }: DMAOptions) {
    this.readCallback = readCallback;
  }

  public read(offset: number) {
    if (this.dmaInProgress) {
      return 0xff;
    }
    return this.data[offset];
  }

  public write(offset: number, data: number) {
    if (!this.dmaInProgress) {
      this.data[offset] = data;
    }
  }

  public startDMA(source: number) {
    this.dmaInProgress = true;
    this.dmaSource = source;
    this.ticksToDMA = 160 * 4;
  }

  public tick() {
    if (!this.dmaInProgress) {
      return;
    }

    if (this.ticksToDMA > 0) {
      this.ticksToDMA -= 1;
      return;
    }

    this.dmaInProgress = false;

    for (let i = 0; i < 160; i++) {
      const sourceAddress = makeWord(this.dmaSource, i);
      this.data[i] = this.readCallback(sourceAddress);
    }
  }

  public getDMASource() {
    return this.dmaSource;
  }
}
