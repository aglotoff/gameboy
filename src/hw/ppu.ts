import { resetBit, setBit, testBit } from "../utils";
import { LCD } from "./lcd";
import { OAM, OAM_TOTAL_OBJECTS, OAMEntry } from "./oam";

const LCD_WIDTH = 160;
const LCD_HEIGHT = 144;

const DOTS_PER_SCANLINE = 456;
const SCANLINES_PER_FRAME = 154;

const VRAM_BASE = 0x8000;
const VRAM_SIZE = 0x2000;

const TICKS_PER_OAM_ENTRY = 2;
const OAM_SCAN_TICKS = TICKS_PER_OAM_ENTRY * OAM_TOTAL_OBJECTS;

const palette = [0xe0f8d0ff, 0x88c070ff, 0x346856ff, 0x081820ff];

interface Pixel {
  color: number;
  palette: number;
  bgPriority?: boolean;
}

enum PPUMode {
  HBlank = 0,
  VBlank = 1,
  OAMScan = 2,
  Drawing = 3,
}

enum StatSource {
  Mode0 = 3,
  Mode1 = 4,
  Mode2 = 5,
  LYC = 6,
}

const STAT_SOURCE_MASK = 0b1111000;

const STAT_MODE_MASK = 0x3;

export class PPU {
  private vram = new Uint8Array(VRAM_SIZE);

  // Registers
  private controlRegister = 0;
  private statusRegister = 0;
  private scanline = 0;
  private lyCompareRegister = 0;
  private viewportY = 0;
  private viewportX = 0;
  private windowY = 0;
  private windowX = 0;
  private bgPalette = 0;
  private objPalette0 = 0;
  private objPalette1 = 0;

  // Interrupts
  private statInterruptLine = false;
  private mode = 0;
  private delayMode = 0;

  // Per-frame state
  private windowLineCounter = 0;
  private windowTriggered = false;

  // Per-scanline
  public dot = 0;
  private objBuffer = [] as OAMEntry[];
  private bgQueue: Pixel[] = [];
  private objQueue: Array<Pixel | null> = [];
  private bgXPosition = 0;
  private inWindow = false;
  private xPosition = 0;
  private bgXSkip = 0;

  private bgFetcher = {
    step: 0,
    tileNo: 0,
    dataLow: 0,
    dataHigh: 0,
    busy: false,
    ready: false,
  };

  private objFetcher = {
    step: 0,
    tileNo: 0,
    dataLow: 0,
    dataHigh: 0,
    busy: null as OAMEntry | null,
    ready: null as OAMEntry | null,
  };

  private getStatInterruptLine() {
    if (
      testBit(this.statusRegister, StatSource.LYC) &&
      testBit(this.statusRegister, 2)
      //this.scanline === this.lyCompareRegister
    ) {
      return true;
    }

    if (
      testBit(this.statusRegister, StatSource.Mode0) &&
      this.getStatusMode() === PPUMode.HBlank //&&
      //this.dot >= 256
    ) {
      return true;
    }

    if (
      testBit(this.statusRegister, StatSource.Mode1) &&
      this.getStatusMode() === PPUMode.VBlank
    ) {
      return true;
    }

    if (
      testBit(this.statusRegister, StatSource.Mode2) &&
      (this.getStatusMode() === PPUMode.OAMScan ||
        (this.dot === 0 && this.scanline === LCD_HEIGHT))
    ) {
      return true;
    }

    return false;
  }

  private checkStatRisingEdge() {
    const newLine = this.getStatInterruptLine();
    if (!this.statInterruptLine && newLine) {
      // console.log("STAT", this.dot);
      this.onStat();
    }
    this.statInterruptLine = newLine;
  }

  public constructor(
    private lcd: LCD,
    private oam: OAM,
    private onVBlank: () => void,
    private onStat: () => void
  ) {}

  public readVRAM(offset: number) {
    return this.mode !== PPUMode.Drawing ? this.vram[offset] : 0xff;
  }

  public writeVRAM(offset: number, value: number) {
    if (this.mode !== PPUMode.Drawing) {
      this.vram[offset] = value;
    }
  }

  // ff40
  public getControlRegister() {
    return this.controlRegister;
  }

  public setControlRegister(value: number) {
    this.controlRegister = value;
  }

  private isEnabled() {
    return testBit(this.controlRegister, 7);
  }

  private getWindowTileMapArea() {
    return (testBit(this.controlRegister, 6) ? 0x9c00 : 0x9800) - VRAM_BASE;
  }

  private isWindowEnabled() {
    return testBit(this.controlRegister, 5);
  }

  private getBGAndWindowTileDataArea() {
    return (testBit(this.controlRegister, 4) ? 0x8000 : 0x8800) - VRAM_BASE;
  }

  private getBGTileMapArea() {
    return (testBit(this.controlRegister, 3) ? 0x9c00 : 0x9800) - VRAM_BASE;
  }

  private getObjHeight() {
    return testBit(this.controlRegister, 2) ? 16 : 8;
  }

  private isObjEnabled() {
    return testBit(this.controlRegister, 1);
  }

  private isBGAndWindowEnabled() {
    return testBit(this.controlRegister, 0);
  }

  // ff41
  public getStatusRegister() {
    return this.statusRegister;
  }

  // TODO: IRQs
  public setStatusRegister(data: number) {
    this.statusRegister &= ~STAT_SOURCE_MASK;
    this.statusRegister |= data & STAT_SOURCE_MASK;
  }

  private getStatusMode() {
    return this.statusRegister & STAT_MODE_MASK;
  }

  private setMode(mode: PPUMode) {
    this.mode = mode;
    this.delayMode = 4;
  }

  // ff44
  public getYCoordinateRegister() {
    //console.log("reading LY", this.scanline.toString(16));
    return this.scanline;
  }

  // ff45
  public getLYCompareRegister() {
    return this.lyCompareRegister;
  }

  public setLYCompareRegister(data: number) {
    this.lyCompareRegister = data;
  }

  // ff42
  public getViewportYPositionRegister() {
    return this.viewportY;
  }

  public setViewportYPositionRegister(data: number) {
    this.viewportY = data;
  }

  // ff43
  public getViewportXPositionRegister() {
    return this.viewportX;
  }

  public setViewportXPositionRegister(data: number) {
    this.viewportX = data;
  }

  // ff4a
  public getWindowYPositionRegister() {
    return this.windowY;
  }

  public setWindowYPositionRegister(data: number) {
    this.windowY = data;
  }

  // ff4b
  public getWindowXPositionRegister() {
    return this.windowX;
  }

  public setWindowXPositionRegister(data: number) {
    this.windowX = data;
  }

  // ff47
  public getBGPaletteDataRegister() {
    return this.bgPalette;
  }

  public setBGPaletteDataRegister(data: number) {
    this.bgPalette = data;
  }

  // ff48
  public getObjPalette0DataRegister() {
    return this.objPalette0;
  }

  public setObjPalette0DataRegister(data: number) {
    this.objPalette0 = data;
  }

  // ff49
  public getObjPalette1DataRegister() {
    return this.objPalette1;
  }

  public setObjPalette1DataRegister(data: number) {
    this.objPalette1 = data;
  }

  public tick() {
    if (!this.isEnabled()) {
      return;
    }

    if (this.delayMode > 0) {
      this.delayMode -= 1;

      if (this.delayMode === 0) {
        if (this.scanline === this.lyCompareRegister) {
          this.statusRegister = setBit(this.statusRegister, 2);
        } else {
          this.statusRegister = resetBit(this.statusRegister, 2);
        }

        this.statusRegister &= ~STAT_MODE_MASK;
        this.statusRegister |= this.mode;
      }
    }

    switch (this.mode) {
      case PPUMode.OAMScan:
        this.oamScanTick();
        break;
      case PPUMode.Drawing:
        this.drawingTick();
        break;
      case PPUMode.HBlank:
        this.hBlankTick();
        break;
      case PPUMode.VBlank:
        this.vBlankTick();
        break;
    }

    this.advanceDot();

    this.checkStatRisingEdge();
  }

  private oamScanTick() {
    if (this.dot % TICKS_PER_OAM_ENTRY === 0) {
      this.checkOAMEntry(this.dot / TICKS_PER_OAM_ENTRY);
    } else if (this.dot === OAM_SCAN_TICKS - 1) {
      this.setMode(PPUMode.Drawing);
    }
  }

  private checkOAMEntry(entryIndex: number) {
    if (this.objBuffer.length === 10) {
      return;
    }

    const entry = this.oam.getEntry(entryIndex);

    const right = entry.xPosition - 1;
    const top = entry.yPosition - 16;
    const bottom = top + this.getObjHeight() - 1;

    if (right < 0 || this.scanline < top || this.scanline > bottom) {
      return;
    }

    this.objBuffer.push(entry);
  }

  private last = -4;

  private drawingTick() {
    if (this.dot === OAM_SCAN_TICKS) {
      this.bgQueue = [];
      this.objQueue = [];
      this.bgXPosition = 0;
      this.inWindow = false;
      this.xPosition = 0;
      this.bgXSkip = this.viewportX % 8;
      this.bgFetcher.step = 0;
      this.bgFetcher.busy = false;
      this.bgFetcher.ready = false;
      this.objFetcher.busy = null;
      this.objFetcher.ready = null;
      this.objFetcher.step = 0;

      this.windowTriggered = false;

      if (
        this.isWindowEnabled() &&
        this.isBGAndWindowEnabled() &&
        this.windowX <= 166 &&
        this.windowY < LCD_HEIGHT &&
        this.scanline >= this.windowY
      ) {
        this.windowTriggered = true;
      }
    } else if (this.dot >= OAM_SCAN_TICKS + 6) {
      this.bgFetcherTick();
      this.objFetcherTick();

      if (this.objFetcher.busy) {
        return;
      }

      if (this.isObjEnabled()) {
        this.objFetcher.busy = this.getCurrentObject(this.xPosition);
        if (this.objFetcher.busy != null) {
          return;
        }
      }

      const bgPixel = this.bgQueue.shift();
      if (bgPixel == null) {
        return;
      }

      if (this.bgXSkip > 0) {
        this.bgXSkip -= 1;
        return;
      }

      if (
        this.windowTriggered &&
        this.xPosition >= this.windowX - 7 &&
        !this.inWindow
      ) {
        this.inWindow = true;
        this.bgXPosition = 0;
        this.bgQueue.splice(0);
        this.bgFetcher.step = 0;
        this.bgFetcher.busy = false;
        this.bgFetcher.ready = false;
        return;
      }

      const objPixel = this.objQueue.shift();

      let mergedPixel = 0x00000000;

      if (objPixel && objPixel.color != 0) {
        if (objPixel.bgPriority && bgPixel.color !== 0) {
          mergedPixel = this.getPaletteColor(this.bgPalette, bgPixel.color);
        } else {
          mergedPixel = this.getPaletteColor(objPixel.palette, objPixel.color);
        }
      } else {
        mergedPixel = this.getPaletteColor(this.bgPalette, bgPixel.color);
      }

      this.lcd.setPixel(this.xPosition, this.scanline, mergedPixel);
      this.xPosition++;

      if (this.xPosition === LCD_WIDTH) {
        this.updateScanline();
        this.objBuffer.splice(0);

        if (this.last !== this.dot + 1) {
          console.log("HBlank at ", this.dot + 1);
          this.last = this.dot + 1;
        }

        this.setMode(PPUMode.HBlank);
      }
    }
  }

  private bgFetcherTick() {
    if (this.bgFetcher.step === 0) {
      if (this.objFetcher.busy) {
        return;
      }
      this.bgFetcher.busy = true;
    }

    switch (this.bgFetcher.step) {
      case 0:
        this.bgFetcher.tileNo = this.inWindow
          ? this.fetchWindowTileNo(this.bgXPosition, this.windowLineCounter)
          : this.fetchBackgroundTileNo(this.bgXPosition, this.scanline);
        break;
      case 2:
        this.bgFetcher.dataLow = this.inWindow
          ? this.fetchWindowTileDataLow(
              this.bgFetcher.tileNo,
              this.windowLineCounter
            )
          : this.fetchBackgroundTileDataLow(
              this.bgFetcher.tileNo,
              this.scanline
            );
        break;
      case 4:
        this.bgFetcher.dataHigh = this.inWindow
          ? this.fetchWindowTileDataHigh(
              this.bgFetcher.tileNo,
              this.windowLineCounter
            )
          : this.fetchBackgroundTileDataHigh(
              this.bgFetcher.tileNo,
              this.scanline
            );
        break;
      case 6:
        this.bgFetcher.busy = false;
        this.bgFetcher.ready = true;
        break;
    }

    if (this.bgFetcher.ready) {
      if (this.bgQueue.length === 0) {
        for (let x = 0; x < 8; x++) {
          if (this.isBGAndWindowEnabled()) {
            const lsb =
              (this.bgFetcher.dataLow >> (7 - (this.bgXPosition % 8))) & 0x1;
            const msb =
              (this.bgFetcher.dataHigh >> (7 - (this.bgXPosition % 8))) & 0x1;

            const color = (msb << 1) | lsb;

            this.bgQueue.push({ color, palette: this.bgPalette });
          } else {
            this.bgQueue.push({ color: 0, palette: this.bgPalette });
          }

          this.bgXPosition++;
        }
        this.bgFetcher.ready = false;
      }
    }

    this.bgFetcher.step += 1;
    if (this.bgFetcher.step >= 8 && !this.bgFetcher.ready) {
      this.bgFetcher.step = 0;
    }
  }

  private objFetcherTick() {
    if (this.objFetcher.step === 0) {
      if (this.objFetcher.busy == null || this.bgFetcher.busy) {
        return;
      }
    }

    switch (this.objFetcher.step) {
      case 0:
        this.objFetcher.tileNo = this.fetchObjectTileNo(this.objFetcher.busy!);
        break;
      case 2:
        this.objFetcher.dataLow = this.fetchObjectTileDataLow(
          this.objFetcher.busy!,
          this.objFetcher.tileNo
        );
        break;
      case 4:
        this.objFetcher.dataHigh = this.fetchObjectTileDataHigh(
          this.objFetcher.busy!,
          this.objFetcher.tileNo
        );
        break;
      case 6:
        this.objFetcher.ready = this.objFetcher.busy;
        this.objFetcher.busy = null;
        break;
    }

    if (this.objFetcher.ready) {
      const firstIdx = this.xPosition - (this.objFetcher.ready.xPosition - 8);
      for (let j = firstIdx; j < 8; j++) {
        const color = this.fetchObjectColor(
          this.objFetcher.ready,
          this.objFetcher.dataLow,
          this.objFetcher.dataHigh,
          j
        );

        const pixel = {
          color,
          bgPriority: testBit(this.objFetcher.ready.attributes, 7),
          palette: testBit(this.objFetcher.ready.attributes, 4)
            ? this.objPalette1
            : this.objPalette0,
        };

        const oldPixel = this.objQueue[j - firstIdx];
        if (oldPixel == null || oldPixel?.color === 0) {
          this.objQueue[j - firstIdx] = pixel;
        }
      }
      this.objFetcher.ready = null;
    }

    this.objFetcher.step += 1;
    if (this.objFetcher.step >= 8 && !this.objFetcher.ready) {
      this.objFetcher.step = 0;
    }
  }

  private updateScanline() {
    while (this.xPosition < LCD_WIDTH) {}

    if (this.windowTriggered) {
      this.windowLineCounter++;
    }
  }

  private getCurrentObject(x: number) {
    const objHeight = this.getObjHeight();
    let minObj: OAMEntry | null = null;

    for (let obj of this.objBuffer) {
      const objY = obj.yPosition - 16;
      const objX = obj.xPosition - 8;

      if (
        x < objX ||
        x >= objX + 8 ||
        this.scanline < objY ||
        this.scanline >= objY + objHeight
      ) {
        continue;
      }

      if (minObj === null || minObj.xPosition > obj.xPosition) {
        minObj = obj;
      }
    }

    if (minObj != null) {
      this.objBuffer.splice(this.objBuffer.indexOf(minObj), 1);
    }

    return minObj;
  }

  private fetchObjectTileNo(obj: OAMEntry) {
    const size = this.getObjHeight();

    const objY = obj.yPosition - 16;

    const flipY = testBit(obj.attributes, 6);

    const tileY = Math.floor(this.scanline - objY);

    const top = flipY ? size - 1 - tileY : tileY;

    return size === 16
      ? top >= 8
        ? obj.tileIndex | 0x01
        : obj.tileIndex & 0xfe
      : obj.tileIndex;
  }

  private fetchObjectTileDataLow(obj: OAMEntry, tileNo: number) {
    const size = this.getObjHeight();
    const objY = obj.yPosition - 16;

    const flipY = testBit(obj.attributes, 6);
    const tileY = Math.floor(this.scanline - objY);
    const top = flipY ? size - 1 - tileY : tileY;

    const off = tileNo * 16;
    return this.vram[off + (top % 8) * 2];
  }

  private fetchObjectTileDataHigh(obj: OAMEntry, tileNo: number) {
    const size = this.getObjHeight();

    const objY = obj.yPosition - 16;

    const flipY = testBit(obj.attributes, 6);
    const tileY = Math.floor(this.scanline - objY);

    const top = flipY ? size - 1 - tileY : tileY;

    const off = tileNo * 16;
    return this.vram[off + (top % 8) * 2 + 1];
  }

  private fetchObjectColor(
    obj: OAMEntry,
    firstByte: number,
    secondByte: number,
    tileX: number
  ) {
    const flipX = testBit(obj.attributes, 5);

    const left = flipX ? 7 - tileX : tileX;

    const lsb = (firstByte >> (7 - left)) & 0x1;
    const msb = (secondByte >> (7 - left)) & 0x1;

    return (msb << 1) | lsb;
  }

  private getPaletteColor(p: number, id: number) {
    return palette[(p >> (id * 2)) & 0x3];
  }

  private hBlankTick() {
    if (this.dot === DOTS_PER_SCANLINE - 1) {
      if (this.scanline < LCD_HEIGHT - 1) {
        this.setMode(PPUMode.OAMScan);
      } else {
        this.setMode(PPUMode.VBlank);
      }
    }
  }

  private vBlankTick() {
    if (this.dot === 0 && this.scanline === LCD_HEIGHT) {
      this.onVBlank();
      this.lcd.render();
    } else if (
      this.dot === DOTS_PER_SCANLINE - 1 &&
      this.scanline === SCANLINES_PER_FRAME - 1
    ) {
      this.setMode(PPUMode.OAMScan);
      this.windowLineCounter = 0;
    }
  }

  private advanceDot() {
    this.dot = (this.dot + 1) % DOTS_PER_SCANLINE;

    if (this.dot === 0) {
      this.advanceScanline();
    }
  }

  private advanceScanline() {
    this.scanline = (this.scanline + 1) % SCANLINES_PER_FRAME;
  }

  private fetchBackgroundTileNo(x: number, y: number) {
    const top = (this.viewportY + y) % 256;
    const left = x % 256;

    const tileX = (Math.floor(left / 8) + Math.floor(this.viewportX / 8)) % 32;
    const tileY = Math.floor(top / 8);

    const pos = (tileY * 32 + tileX) % 1024;

    return this.vram[this.getBGTileMapArea() + pos];
  }

  private fetchBackgroundTileDataLow(tileNo: number, y: number) {
    const dataBase = this.getBGAndWindowTileDataArea();

    let off = 0;

    if (dataBase === 0) {
      off = tileNo * 16;
    } else {
      off = dataBase + ((128 + tileNo) % 256) * 16;
    }

    return this.vram[off + ((y + this.viewportY) % 8) * 2];
  }

  private fetchBackgroundTileDataHigh(tileNo: number, y: number) {
    const dataBase = this.getBGAndWindowTileDataArea();

    let off = 0;

    if (dataBase === 0) {
      off = tileNo * 16;
    } else {
      off = dataBase + ((128 + tileNo) % 256) * 16;
    }

    return this.vram[off + ((y + this.viewportY) % 8) * 2 + 1];
  }

  private fetchWindowTileNo(x: number, y: number) {
    const top = y;
    const left = x % 256;

    const tileX = Math.floor(left / 8) % 32;
    const tileY = Math.floor(top / 8);

    const pos = (tileY * 32 + tileX) % 1024;

    return this.vram[this.getWindowTileMapArea() + pos];
  }

  private fetchWindowTileDataLow(tileNo: number, y: number) {
    const dataBase = this.getBGAndWindowTileDataArea();

    let off = 0;

    if (dataBase === 0) {
      off = tileNo * 16;
    } else {
      off = dataBase + ((128 + tileNo) % 256) * 16;
    }

    return this.vram[off + (y % 8) * 2];
  }

  private fetchWindowTileDataHigh(tileNo: number, y: number) {
    const dataBase = this.getBGAndWindowTileDataArea();

    let off = 0;

    if (dataBase === 0) {
      off = tileNo * 16;
    } else {
      off = dataBase + ((128 + tileNo) % 256) * 16;
    }

    return this.vram[off + (y % 8) * 2 + 1];
  }
}
