import { makeWord } from "../utils";

export type DMAReadFn = (address: number) => number;

export interface OAMOptions {
  readCallback: DMAReadFn;
}

const OAM_SIZE = 160;

export class OAM {
  private data = new Uint8Array(OAM_SIZE);

  private dmaInProgress = false;
  private dmaDelay = 0;
  private dmaTick = 0;
  private currentDMASource = 0;
  private currentDMAIndex = 0;
  private nextDMASource = 0;

  private readCallback: DMAReadFn;

  public constructor({ readCallback }: OAMOptions) {
    this.readCallback = readCallback;
  }

  public read(offset: number) {
    return this.dmaInProgress ? 0xff : this.data[offset];
  }

  public write(offset: number, data: number) {
    if (!this.dmaInProgress) {
      this.data[offset] = data;
    }
  }

  public startDMA(source: number) {
    this.dmaDelay = 4;
    this.nextDMASource = source;
  }

  public tick() {
    if (this.dmaTick > 0) {
      this.dmaInProgress = true;

      if (this.dmaTick % 4 === 0) {
        const address = makeWord(this.currentDMASource, this.currentDMAIndex);
        const byte = this.readCallback(address);
        this.data[this.currentDMAIndex] = byte;
        this.currentDMAIndex += 1;
      }

      this.dmaTick -= 1;
    } else {
      this.dmaInProgress = false;
    }

    if (this.dmaDelay > 0) {
      this.dmaDelay -= 1;

      if (this.dmaDelay === 0) {
        this.currentDMASource = this.nextDMASource;
        this.currentDMAIndex = 0;
        this.dmaTick = 640;
      }
    }
  }

  public getDMASource() {
    return this.currentDMASource;
  }
}
