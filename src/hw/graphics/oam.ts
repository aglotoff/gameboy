import { getLSB, getMSB, makeWord, testBit } from "../../utils";

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
  flipX: boolean;
  flipY: boolean;
  bgPriority: boolean;
  palette: boolean;
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

  private row = 0;
  private readLocked = false;
  private writeLocked = false;

  private readCallback: DMAReadFn;

  public constructor({ readCallback }: OAMOptions) {
    this.readCallback = readCallback;
  }

  public reset() {
    this.data = new Uint8Array(OAM_TOTAL_SIZE);
    this.dmaInProgress = false;
    this.dmaDelay = 0;
    this.dmaTick = 0;
    this.currentDMASource = 0;
    this.currentDMAIndex = 0;
    this.nextDMASource = 0;
    this.readLocked = false;
    this.writeLocked = false;
  }

  public setActiveRow(activeRow: number) {
    this.row = activeRow;
  }

  public lockRead() {
    this.readLocked = true;
  }

  public unlockRead() {
    this.readLocked = false;
  }

  public lockWrite() {
    this.writeLocked = true;
  }

  public unlockWrite() {
    this.writeLocked = false;
  }

  public isDMAInProgress() {
    return this.dmaInProgress;
  }

  public read(offset: number) {
    this.triggerRead();

    // Not Usable
    if (offset > 0x9f || this.dmaInProgress || this.readLocked) {
      return 0xff;
    }

    return this.data[offset];
  }

  public getEntry(index: number): OAMEntry {
    const yPosition = this.data[index * OAM_OBJECT_SIZE + 0];
    const xPosition = this.data[index * OAM_OBJECT_SIZE + 1];
    const tileIndex = this.data[index * OAM_OBJECT_SIZE + 2];
    const attributes = this.data[index * OAM_OBJECT_SIZE + 3];

    return {
      yPosition: yPosition - 16,
      xPosition: xPosition - 8,
      tileIndex,
      palette: testBit(attributes, 4),
      flipX: testBit(attributes, 5),
      flipY: testBit(attributes, 6),
      bgPriority: testBit(attributes, 7),
    };
  }

  public write(offset: number, data: number) {
    this.triggerWrite();

    if (offset > 0x9f || this.dmaInProgress || this.writeLocked) {
      return;
    }

    this.data[offset] = data;
  }

  public triggerWrite() {
    if (this.row !== 0) {
      const a = makeWord(this.data[this.row * 8], this.data[this.row * 8 + 1]);
      const b = makeWord(
        this.data[(this.row - 1) * 8 + 0],
        this.data[(this.row - 1) * 8 + 1]
      );
      const c = makeWord(
        this.data[(this.row - 1) * 8 + 4],
        this.data[(this.row - 1) * 8 + 5]
      );

      const value = ((a ^ c) & (b ^ c)) ^ c;

      this.data[this.row * 8 + 0] = getMSB(value);
      this.data[this.row * 8 + 1] = getLSB(value);
      this.data[this.row * 8 + 2] = this.data[(this.row - 1) * 8 + 2];
      this.data[this.row * 8 + 3] = this.data[(this.row - 1) * 8 + 3];
      this.data[this.row * 8 + 4] = this.data[(this.row - 1) * 8 + 4];
      this.data[this.row * 8 + 5] = this.data[(this.row - 1) * 8 + 5];
      this.data[this.row * 8 + 6] = this.data[(this.row - 1) * 8 + 6];
      this.data[this.row * 8 + 7] = this.data[(this.row - 1) * 8 + 7];
    }
  }

  public triggerIncrementRead() {
    if (this.row >= 4 && this.row < 19) {
      const a = makeWord(
        this.data[(this.row - 2) * 8 + 0],
        this.data[(this.row - 2) * 8 + 1]
      );
      const b = makeWord(
        this.data[(this.row - 1) * 8 + 0],
        this.data[(this.row - 1) * 8 + 1]
      );
      const c = makeWord(
        this.data[this.row * 8 + 0],
        this.data[this.row * 8 + 1]
      );
      const d = makeWord(
        this.data[(this.row - 1) * 8 + 4],
        this.data[(this.row - 1) * 8 + 5]
      );

      const value = (b & (a | c | d)) | (a & c & d);

      this.data[(this.row - 1) * 8 + 0] = getMSB(value);
      this.data[(this.row - 1) * 8 + 1] = getLSB(value);

      for (let i = 0; i < 8; i++) {
        this.data[this.row * 8 + i] = this.data[(this.row - 1) * 8 + i];
        this.data[(this.row - 2) * 8 + i] = this.data[(this.row - 1) * 8 + i];
      }
    }
  }

  public triggerRead() {
    if (this.row !== 0) {
      const a = makeWord(this.data[this.row * 8], this.data[this.row * 8 + 1]);
      const b = makeWord(
        this.data[(this.row - 1) * 8],
        this.data[(this.row - 1) * 8 + 1]
      );
      const c = makeWord(
        this.data[(this.row - 1) * 8 + 4],
        this.data[(this.row - 1) * 8 + 5]
      );

      const value = b | (a & c);

      // this.data[(this.row - 1) * 8 + 0] = getMSB(value);
      // this.data[(this.row - 1) * 8 + 1] = getLSB(value);

      this.data[this.row * 8 + 0] = getMSB(value);
      this.data[this.row * 8 + 1] = getLSB(value);
      this.data[this.row * 8 + 2] = this.data[(this.row - 1) * 8 + 2];
      this.data[this.row * 8 + 3] = this.data[(this.row - 1) * 8 + 3];
      this.data[this.row * 8 + 4] = this.data[(this.row - 1) * 8 + 4];
      this.data[this.row * 8 + 5] = this.data[(this.row - 1) * 8 + 5];
      this.data[this.row * 8 + 6] = this.data[(this.row - 1) * 8 + 6];
      this.data[this.row * 8 + 7] = this.data[(this.row - 1) * 8 + 7];
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
