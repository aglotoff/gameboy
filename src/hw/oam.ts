import { makeWord } from "../utils";

export type DMAReadFn = (address: number) => number;

export interface OAMOptions {
  readCallback: DMAReadFn;
}

export const OAM_TOTAL_OBJECTS = 40;

const OAM_OBJECT_SIZE = 4;
const OAM_TOTAL_SIZE = OAM_TOTAL_OBJECTS * OAM_OBJECT_SIZE;

export interface OAMEntry {
  yPosition: number;
  xPosition: number;
  tileIndex: number;
  attributes: number;
}

export enum OAMFlags {
  PaletteNumber = 1 << 4,
  XFlip = 1 << 5,
  YFlip = 1 << 6,
  BGAndWindowOverOBJ = 1 << 7,
}

export class OAM {
  private data = new Uint8Array(OAM_TOTAL_SIZE);

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

  public isDMAInProgress() {
    return this.dmaInProgress;
  }

  public read(offset: number) {
    return this.dmaInProgress ? 0xff : this.data[offset];
  }

  public getEntry(index: number): OAMEntry {
    return {
      yPosition: this.read(index * OAM_OBJECT_SIZE + 0),
      xPosition: this.read(index * OAM_OBJECT_SIZE + 1),
      tileIndex: this.read(index * OAM_OBJECT_SIZE + 2),
      attributes: this.read(index * OAM_OBJECT_SIZE + 3),
    };
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
