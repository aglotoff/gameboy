import { resetBit, setBit, testBit } from "../utils";
import { OAM, OAM_TOTAL_OBJECTS, OAMEntry } from "./oam";

const LCD_WIDTH = 160;
const LCD_HEIGHT = 144;

const DOTS_PER_SCANLINE = 456;
const SCANLINES_PER_FRAME = 154;

const VRAM_BASE = 0x8000;
const VRAM_SIZE = 0x2000;

const TICKS_PER_OAM_ENTRY = 2;
const OAM_SCAN_TICKS = TICKS_PER_OAM_ENTRY * OAM_TOTAL_OBJECTS;

const MIN_DRAWING_TICKS = 172;

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

export class LCD {
  private imageData: ImageData;

  constructor(private context: CanvasRenderingContext2D) {
    this.imageData = context.createImageData(160 * 2, 144 * 2);
  }

  public render() {
    this.context.putImageData(this.imageData, 0, 0);
  }

  public setPixel(x: number, y: number, color: number) {
    this.setImagePixel(x * 2, y * 2, color);
    this.setImagePixel(x * 2 + 1, y * 2, color);
    this.setImagePixel(x * 2, y * 2 + 1, color);
    this.setImagePixel(x * 2 + 1, y * 2 + 1, color);
  }

  private setImagePixel(x: number, y: number, color: number) {
    const idx = (y * this.imageData.width + x) * 4;
    this.imageData.data[idx] = (color >> 24) & 0xff;
    this.imageData.data[idx + 1] = (color >> 16) & 0xff;
    this.imageData.data[idx + 2] = (color >> 8) & 0xff;
    this.imageData.data[idx + 3] = (color >> 0) & 0xff;
  }
}

const STAT_MODE_MASK = 0x3;
const STAT_RW_MASK = 0x78;

export class PPU {
  private vram = new Uint8Array(VRAM_SIZE);

  private controlRegister = 0;
  private lyCompareRegister = 0;
  private statusRegister = 0;

  private scanline = 0;
  private dot = 0;

  private viewportX = 0;
  private viewportY = 0;
  private windowX = 0;
  private windowY = 0;
  private bgPalette = 0;
  private objPalette0 = 0;
  private objPalette1 = 0;
  private objBuffer = [] as OAMEntry[];
  private windowLineCounter = 0;
  private inWindow = false;

  public constructor(
    private lcd: LCD,
    private oam: OAM,
    private onVBlank: () => void,
    private onStat: () => void
  ) {}

  public readVRAM(offset: number) {
    return this.getMode() !== PPUMode.Drawing ? this.vram[offset] : 0xff;
  }

  public writeVRAM(offset: number, value: number) {
    if (this.getMode() !== PPUMode.Drawing) {
      this.vram[offset] = value;
    }
  }

  // ff40
  public getControlRegister() {
    return this.controlRegister;
  }

  public setControlRegister(value: number) {
    // const wasOn = this.isEnabled();
    this.controlRegister = value;
    // const isOn = this.isEnabled();

    // if (wasOn && !isOn) {
    //   this.dot = 0;
    //   this.scanline = 0;
    // }
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
    if ((data & ~0b1000111) !== 0) {
      throw new Error("Not implemented " + data.toString(2));
    }
    this.statusRegister = data & STAT_RW_MASK;
  }

  private getMode() {
    return this.statusRegister & STAT_MODE_MASK;
  }

  private setMode(mode: PPUMode) {
    this.statusRegister &= ~STAT_MODE_MASK;
    this.statusRegister |= mode;
  }

  // ff44
  public getYCoordinateRegister() {
    return this.scanline;
  }

  // ff45
  public getLYCompareRegister() {
    return this.lyCompareRegister;
  }

  public setLYCompareRegister(data: number) {
    this.lyCompareRegister = data;
    // TODO: trigger IRQ?
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

    switch (this.getMode()) {
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

  private drawingTick() {
    if (this.dot === MIN_DRAWING_TICKS + OAM_SCAN_TICKS - 1) {
      this.updateScanline();
      this.objBuffer.splice(0);
      this.setMode(PPUMode.HBlank);
    }
  }

  private updateScanline() {
    this.inWindow = false;

    if (
      this.isWindowEnabled() &&
      this.isBGAndWindowEnabled() &&
      this.windowX <= 166 &&
      this.windowY < LCD_HEIGHT &&
      this.scanline >= this.windowY
    ) {
      this.inWindow = true;
    }

    const bgQueue: Pixel[] = [];
    const objQueue: Array<Pixel | null> = [];
    let bgXPosition = 0;
    let inWindow = false;

    let skip = this.viewportX % 8;

    while (bgQueue.length < LCD_WIDTH + skip) {
      if (inWindow) {
        bgQueue.push(this.getWindowPixel(bgXPosition, this.windowLineCounter));
        bgXPosition++;
      } else if (
        this.inWindow &&
        bgQueue.length === skip + this.windowX - 7 &&
        !inWindow
      ) {
        inWindow = true;
        bgXPosition = 0;
      } else {
        bgQueue.push(this.getBGPixel(bgXPosition, this.scanline));
        bgXPosition++;
      }
    }

    for (let i = 0; i < LCD_WIDTH; i++) {
      if (i >= objQueue.length) {
        objQueue[i] = null;
      }

      if (this.isObjEnabled()) {
        let obj = this.getCurrentObject(i);

        while (obj != null) {
          const tileNo = this.fetchObjectTileNo(obj);
          const dataLow = this.fetchObjectTileDataLow(obj, tileNo);
          const dataHigh = this.fetchObjectTileDataHigh(obj, tileNo);

          const firstIdx = i - (obj.xPosition - 8);
          for (let j = firstIdx; j < 8; j++) {
            const color = this.fetchObjectColor(obj, dataLow, dataHigh, j);

            const pixel = {
              color,
              bgPriority: testBit(obj.attributes, 7),
              palette: testBit(obj.attributes, 4)
                ? this.objPalette1
                : this.objPalette0,
            };

            const oldPixel = objQueue[i + j - firstIdx];
            if (oldPixel == null || oldPixel?.color === 0) {
              objQueue[i + j - firstIdx] = pixel;
            }
          }

          obj = this.getCurrentObject(i);
        }
      }
    }

    let i = 0;
    while (i < LCD_WIDTH) {
      const bgPixel = bgQueue.shift()!;

      if (skip > 0) {
        skip -= 1;
        continue;
      }

      const objPixel = objQueue.shift();

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

      this.lcd.setPixel(i, this.scanline, mergedPixel);
      i++;
    }

    if (this.inWindow) {
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

    // const objX = obj.x - 8;

    // const tileX = Math.floor(i - objX);

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

    if (this.scanline === this.lyCompareRegister) {
      this.statusRegister = setBit(this.statusRegister, 2);
      this.onStat();
    } else {
      this.statusRegister = resetBit(this.statusRegister, 2);
    }
  }

  private getBGPixel(x: number, y: number): Pixel {
    if (!this.isBGAndWindowEnabled()) {
      return { color: 0, palette: this.bgPalette };
    }

    const tileNo = this.fetchBackgroundTileNo(x, y);
    const dataLow = this.fetchBackgroundTileDataLow(tileNo, y);
    const dataHigh = this.fetchBackgroundTileDataHigh(tileNo, y);

    const lsb = (dataLow >> (7 - (x % 8))) & 0x1;
    const msb = (dataHigh >> (7 - (x % 8))) & 0x1;

    const color = (msb << 1) | lsb;

    return { color, palette: this.bgPalette };
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

  private getTilePixelId(
    tileNumber: number,
    x: number,
    y: number,
    obj: boolean
  ) {
    const dataBase = obj ? 0 : this.getBGAndWindowTileDataArea();

    let off = 0;

    if (dataBase === 0) {
      off = tileNumber * 16;
    } else {
      off = dataBase + ((128 + tileNumber) % 256) * 16;
    }

    const firstByte = this.vram[off + y * 2];
    const secondByte = this.vram[off + y * 2 + 1];

    const lsb = (firstByte >> (7 - x)) & 0x1;
    const msb = (secondByte >> (7 - x)) & 0x1;

    return (msb << 1) | lsb;
  }

  private getWindowPixel(x: number, y: number): Pixel {
    const tileNo = this.fetchWindowTileNo(x, y);
    const dataLow = this.fetchWindowTileDataLow(tileNo, y);
    const dataHigh = this.fetchWindowTileDataHigh(tileNo, y);

    const lsb = (dataLow >> (7 - (x % 8))) & 0x1;
    const msb = (dataHigh >> (7 - (x % 8))) & 0x1;

    const color = (msb << 1) | lsb;

    return { color, palette: this.bgPalette };
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

  private getObjPixel(x: number, y: number) {
    let pixel: Pixel | null = null;
    let minX = 0xfff;

    const size = this.getObjHeight();

    for (let obj of this.objBuffer) {
      const objY = obj.yPosition - 16;
      const objX = obj.xPosition - 8;

      if (x < objX || x >= objX + 8 || y < objY || y >= objY + size) {
        continue;
      }

      if (objX >= minX) {
        continue;
      }

      const flipX = testBit(obj.attributes, 5);
      const flipY = testBit(obj.attributes, 6);

      const tileX = Math.floor(x - objX);
      const tileY = Math.floor(y - objY);

      const left = flipX ? 7 - tileX : tileX;
      const top = flipY ? size - 1 - tileY : tileY;

      const color = this.getTilePixelId(
        size === 16
          ? top >= 8
            ? obj.tileIndex | 0x01
            : obj.tileIndex & 0xfe
          : obj.tileIndex,
        left,
        top % 8,
        true
      );

      if (color == 0x00) {
        continue;
      }

      minX = objX;

      pixel = {
        color,
        bgPriority: testBit(obj.attributes, 7),
        palette: testBit(obj.attributes, 4)
          ? this.objPalette1
          : this.objPalette0,
      };
    }

    return pixel;
  }
}
