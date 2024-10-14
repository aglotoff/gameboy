import { resetBit, setBit, testBit } from "../utils";
import { OAM } from "./oam";

export enum OAMFlags {
  PaletteNumber = 1 << 4,
  XFlip = 1 << 5,
  YFlip = 1 << 6,
  BGAndWindowOverOBJ = 1 << 7,
}
const CANVAS_WIDTH = 160;
const CANVAS_HEIGHT = 144;

const DOTS_PER_SCANLINE = 456;
const SCANLINES_PER_FRAME = 154;

const VRAM_BASE = 0x8000;
const VRAM_SIZE = 0x2000;

const palette = [0xe0f8d0ff, 0x88c070ff, 0x346856ff, 0x081820ff];

interface OAMEntry {
  y: number;
  x: number;
  tileIndex: number;
  attributes: number;
}

interface Pixel {
  color: number;
  palette: number;
  bgPriority?: boolean;
}

export class LCD {
  private controlRegister = 0;
  private lyCompareRegister = 0;
  private statusRegister = 0;

  private vram = new Uint8Array(VRAM_SIZE);
  private scanline = 0;
  private dot = 0;
  private imageData: ImageData;
  private mode = 0;

  private viewportX = 0;
  private viewportY = 0;
  private windowX = 0;
  private windowY = 0;
  private bgPalette = 0;
  private objPalette0 = 0;
  private objPalette1 = 0;
  private objectsPerLine = [] as OAMEntry[];
  private windowLineCounter = 0;
  private windowTriggered = false;

  public constructor(
    private context: CanvasRenderingContext2D,
    //private debugContext: CanvasRenderingContext2D,
    private oam: OAM,
    private onVBlank: () => void,
    private onStat: () => void
  ) {
    this.imageData = context.createImageData(160 * 2, 144 * 2);
  }

  public readVRAM(offset: number) {
    if (this.mode !== 3) {
      return this.vram[offset];
    }
    return 0xff;
  }

  public writeVRAM(offset: number, value: number) {
    if (this.mode !== 3) {
      this.vram[offset] = value;
    }
  }

  public getControlRegister() {
    return this.controlRegister;
  }

  public setControlRegister(value: number) {
    const wasOn = this.isEnabled();
    this.controlRegister = value;
    const isOn = this.isEnabled();

    if (wasOn && !isOn) {
      this.context.fillStyle = "#ffffff";
      this.context.fillRect(0, 0, CANVAS_WIDTH * 2, CANVAS_HEIGHT * 2);

      this.dot = 0;
      this.scanline = 0;
    }
  }

  public getYCoordinateRegister() {
    return this.scanline;
  }

  public getLYCompareRegister() {
    return this.lyCompareRegister;
  }

  public setLYCompareRegister(data: number) {
    this.lyCompareRegister = data;
  }

  public getStatusRegister() {
    return this.statusRegister | this.mode;
  }

  public setStatusRegister(data: number) {
    if ((data & ~0b1000111) !== 0) {
      throw new Error("Not implemented " + data.toString(2));
    }
    this.statusRegister = data & 0xf8;
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

  private getObjSize() {
    return testBit(this.controlRegister, 2) ? 16 : 8;
  }

  private isObjEnabled() {
    return testBit(this.controlRegister, 1);
  }

  private isBGAndWindowEnabled() {
    return testBit(this.controlRegister, 0);
  }

  public getViewportYPositionRegister() {
    return this.viewportY;
  }

  public getViewportXPositionRegister() {
    return this.viewportX;
  }

  public setViewportYPositionRegister(data: number) {
    this.viewportY = data;
  }

  public setViewportXPositionRegister(data: number) {
    this.viewportX = data;
  }

  public getWindowYPositionRegister() {
    return this.windowY;
  }

  public getWindowXPositionRegister() {
    return this.windowX;
  }

  public setWindowYPositionRegister(data: number) {
    this.windowY = data;
  }

  public setWindowXPositionRegister(data: number) {
    this.windowX = data;
  }

  public getBGPaletteDataRegister() {
    return this.bgPalette;
  }

  public setBGPaletteDataRegister(data: number) {
    this.bgPalette = data;
  }

  public getObjPalette0DataRegister() {
    return this.objPalette0;
  }

  public setObjPalett0DataRegister(data: number) {
    this.objPalette0 = data;
  }

  public getObjPalette1DataRegister() {
    return this.objPalette1;
  }

  public setObjPalett1DataRegister(data: number) {
    this.objPalette1 = data;
  }

  private getPaletteColor(p: number, id: number) {
    return palette[(p >> (id * 2)) & 0x3];
  }

  public tick() {
    if (!this.isEnabled()) {
      return;
    }

    if (this.scanline < 144) {
      if (this.dot === 0) {
        this.mode = 2;
        this.objectsPerLine = [];
      } else if (this.dot < 80) {
        if (this.dot % 2 === 1) {
          this.oamScan();
        }
      } else if (this.dot === 80) {
        // Begin mode 3
        this.mode = 3;

        this.windowTriggered = false;

        if (
          !this.windowTriggered &&
          this.isWindowEnabled() &&
          this.isBGAndWindowEnabled() &&
          this.windowX <= 166 &&
          this.windowY <= 143 &&
          this.scanline >= this.windowY
        ) {
          this.windowTriggered = true;
        }

        this.bgXCounter = 0;
        this.bgPixelsToSkip = this.viewportX % 8;
        this.xPosition = 0;
        this.pixelFetcherBgStep = 0;
        this.pixelFetcherObjStep = 0;
        this.pixelFetcherInWindow = false;
        this.fifoEnabled = true;
        this.backgroundFIFO.splice(0);
        this.objectFIFO.splice(0);
        this.currentObject = null;
      } else if (this.xPosition < 160) {
        this.backgroundPixelFetcher();
        this.objectPixelFetcher();
        this.tryPushPixel();
      } else if (this.mode !== 0) {
        this.updateScanline();
        this.mode = 0;
      }
    } else if (this.scanline === 144 && this.dot === 0) {
      this.mode = 1;
      this.windowLineCounter = 0;
      this.onVBlank();
      this.render();
    }

    this.dot = (this.dot + 1) % DOTS_PER_SCANLINE;

    if (this.dot === 0) {
      this.scanline = (this.scanline + 1) % SCANLINES_PER_FRAME;

      if (this.scanline === this.lyCompareRegister) {
        this.statusRegister = setBit(this.statusRegister, 2);
        this.onStat();
      } else {
        this.statusRegister = resetBit(this.statusRegister, 2);
      }
    }
  }

  private updateScanline() {
    if (this.windowTriggered) {
      this.windowLineCounter++;
    }
  }

  private backgroundFIFO = [] as Pixel[];
  private objectFIFO = [] as Pixel[];
  private bgPixelsToSkip = 0;
  private fifoEnabled = false;
  private xPosition = 0;

  private bgXCounter = 0;
  private pixelFetcherBgTileNo = 0;
  private pixelFetcherBgDataLow = 0;
  private pixelFetcherBgDataHigh = 0;
  private pixelFetcherBgStep = 0;
  private pixelFetcherInWindow = false;
  private pixelFetcherObjTileNo = 0;
  private pixelFetcherObjDataLow = 0;
  private pixelFetcherObjDataHigh = 0;
  private pixelFetcherObjStep = 0;

  private backgroundPixelFetcher() {
    if (this.xPosition >= 160) {
      return;
    }

    switch (this.pixelFetcherBgStep) {
      case 0:
        if (
          (this.pixelFetcherObjStep >= 1 && this.pixelFetcherObjStep <= 6) ||
          this.backgroundFIFO.length > 0 ||
          this.currentObject
        ) {
          return;
        }
        break;
      case 1:
        this.pixelFetcherBgTileNo = this.pixelFetcherInWindow
          ? this.fetchWindowTileNo()
          : this.fetchBackgroundTileNo();
        break;
      case 3:
        this.pixelFetcherBgDataLow = this.pixelFetcherInWindow
          ? this.fetchWindowTileDataLow(this.pixelFetcherBgTileNo)
          : this.fetchBackgroundTileDataLow(this.pixelFetcherBgTileNo);
        break;
      case 5:
        this.pixelFetcherBgDataHigh = this.pixelFetcherInWindow
          ? this.fetchWindowTileDataHigh(this.pixelFetcherBgTileNo)
          : this.fetchBackgroundTileDataHigh(this.pixelFetcherBgTileNo);

        break;
    }

    this.pixelFetcherBgStep += 1;

    if (this.pixelFetcherBgStep > 7 && this.backgroundFIFO.length === 0) {
      for (let i = 0; i < 8; i++) {
        if (this.isBGAndWindowEnabled()) {
          const lsb =
            (this.pixelFetcherBgDataLow >> (7 - (this.bgXCounter % 8))) & 0x1;
          const msb =
            (this.pixelFetcherBgDataHigh >> (7 - (this.bgXCounter % 8))) & 0x1;

          const color = (msb << 1) | lsb;

          this.backgroundFIFO.unshift({ color, palette: this.bgPalette });
        } else {
          this.backgroundFIFO.push({ color: 0, palette: this.bgPalette });
        }

        this.bgXCounter += 1;
      }

      this.pixelFetcherBgStep = 0;
    }
  }

  private currentObject: OAMEntry | null = null;

  private objectPixelFetcher() {
    if (this.xPosition >= 160) {
      return;
    }

    switch (this.pixelFetcherObjStep) {
      case 0:
        if (
          (this.pixelFetcherBgStep >= 1 && this.pixelFetcherBgStep < 6) ||
          this.backgroundFIFO.length === 0 ||
          this.bgPixelsToSkip > 0
        ) {
          return;
        }

        if (this.currentObject == null) {
          this.currentObject = this.getCurrentObject();
          if (this.currentObject == null) {
            this.fifoEnabled = true;
            return;
          } else {
            this.fifoEnabled = false;
          }
        }

        break;

      case 1:
        this.pixelFetcherObjTileNo = this.fetchObjectTileNo(
          this.currentObject!
        );
        break;
      case 3:
        this.pixelFetcherObjDataLow = this.fetchObjectTileDataLow(
          this.currentObject!,
          this.pixelFetcherObjTileNo
        );
        break;
      case 5:
        this.pixelFetcherObjDataHigh = this.fetchObjectTileDataHigh(
          this.currentObject!,
          this.pixelFetcherObjTileNo
        );
        break;
    }

    this.pixelFetcherObjStep += 1;

    if (this.pixelFetcherObjStep > 7 && this.backgroundFIFO.length > 0) {
      const firstIdx = this.xPosition - (this.currentObject!.x - 8);

      for (let i = firstIdx; i < 8; i++) {
        const color = this.fetchObjectColor(
          this.currentObject!,
          this.pixelFetcherObjDataLow,
          this.pixelFetcherObjDataHigh,
          i
        );

        const pixel = {
          color,
          bgPriority: testBit(this.currentObject!.attributes, 7),
          palette: testBit(this.currentObject!.attributes, 4)
            ? this.objPalette1
            : this.objPalette0,
        };

        if (i - firstIdx < this.objectFIFO.length) {
          const oldPixel =
            this.objectFIFO[this.objectFIFO.length - i + firstIdx - 1]!;
          if (oldPixel.color === 0) {
            this.objectFIFO[this.objectFIFO.length - i + firstIdx - 1] = pixel;
          }
        } else {
          this.objectFIFO.unshift(pixel);
        }
      }

      this.pixelFetcherObjStep = 0;

      this.currentObject = this.getCurrentObject();
      if (this.currentObject == null) {
        this.fifoEnabled = true;
      }
    }
  }

  private getCurrentObject() {
    const objSize = this.getObjSize();
    let minObj: OAMEntry | null = null;

    for (let obj of this.objectsPerLine) {
      const objY = obj.y - 16;
      const objX = obj.x - 8;

      if (
        this.xPosition < objX ||
        this.xPosition >= objX + 8 ||
        this.scanline < objY ||
        this.scanline >= objY + objSize
      ) {
        continue;
      }

      if (minObj === null || minObj.x > obj.x) {
        minObj = obj;
      }
    }

    if (minObj != null) {
      this.objectsPerLine.splice(this.objectsPerLine.indexOf(minObj), 1);
    }

    return minObj;
  }

  private tryPushPixel() {
    if (!this.fifoEnabled || this.backgroundFIFO.length === 0) {
      return;
    }

    const bgPixel = this.backgroundFIFO.pop()!;

    if (this.bgPixelsToSkip > 0) {
      this.bgPixelsToSkip -= 1;
      return;
    }

    if (
      !this.pixelFetcherInWindow &&
      this.windowTriggered &&
      this.isWindowEnabled() &&
      this.xPosition >= this.windowX - 7
    ) {
      this.pixelFetcherInWindow = true;
      this.bgXCounter = 0;
      this.pixelFetcherBgStep = 0;
      this.backgroundFIFO.splice(0);
      return;
    }

    const objPixel = this.objectFIFO.pop();

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

    this.pushPixel(mergedPixel);

    this.xPosition += 1;
  }

  private pushPixel(pixel: number) {
    this.setPixel(this.xPosition, this.scanline, pixel);
  }

  private fetchBackgroundTileNo() {
    const top = (this.viewportY + this.scanline) % 256;
    const left = this.bgXCounter % 256;

    const tileX = (Math.floor(left / 8) + Math.floor(this.viewportX / 8)) % 32;
    const tileY = Math.floor(top / 8);

    const pos = (tileY * 32 + tileX) % 1024;

    return this.vram[this.getBGTileMapArea() + pos];
  }

  private fetchWindowTileNo() {
    const top = this.windowLineCounter;
    const left = this.bgXCounter % 256;

    const tileX = Math.floor(left / 8) % 32;
    const tileY = Math.floor(top / 8);

    const pos = (tileY * 32 + tileX) % 1024;

    return this.vram[this.getWindowTileMapArea() + pos];
  }

  private fetchBackgroundTileDataLow(tileNo: number) {
    const dataBase = this.getBGAndWindowTileDataArea();

    let off = 0;

    if (dataBase === 0) {
      off = tileNo * 16;
    } else {
      off = dataBase + ((128 + tileNo) % 256) * 16;
    }

    return this.vram[off + ((this.scanline + this.viewportY) % 8) * 2];
  }

  private fetchBackgroundTileDataHigh(tileNo: number) {
    const dataBase = this.getBGAndWindowTileDataArea();

    let off = 0;

    if (dataBase === 0) {
      off = tileNo * 16;
    } else {
      off = dataBase + ((128 + tileNo) % 256) * 16;
    }

    return this.vram[off + ((this.scanline + this.viewportY) % 8) * 2 + 1];
  }

  private fetchWindowTileDataLow(tileNo: number) {
    const dataBase = this.getBGAndWindowTileDataArea();

    let off = 0;

    if (dataBase === 0) {
      off = tileNo * 16;
    } else {
      off = dataBase + ((128 + tileNo) % 256) * 16;
    }

    return this.vram[off + (this.windowLineCounter % 8) * 2];
  }

  private fetchWindowTileDataHigh(tileNo: number) {
    const dataBase = this.getBGAndWindowTileDataArea();

    let off = 0;

    if (dataBase === 0) {
      off = tileNo * 16;
    } else {
      off = dataBase + ((128 + tileNo) % 256) * 16;
    }

    return this.vram[off + (this.windowLineCounter % 8) * 2 + 1];
  }

  private oamScan() {
    if (this.objectsPerLine.length === 10 || !this.isObjEnabled()) {
      return;
    }

    let entryIndex = Math.floor(this.dot / 2);

    const objX = this.oam.read(entryIndex * 4 + 1);

    if (objX === 0) {
      return;
    }

    const objY = this.oam.read(entryIndex * 4 + 0) - 16;

    if (this.scanline < objY || this.scanline >= objY + this.getObjSize()) {
      return;
    }

    this.objectsPerLine.push({
      y: objY + 16,
      x: objX,
      tileIndex: this.oam.read(entryIndex * 4 + 2),
      attributes: this.oam.read(entryIndex * 4 + 3),
    });
  }

  private fetchObjectTileNo(obj: OAMEntry) {
    const size = this.getObjSize();

    const objY = obj.y - 16;

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
    const size = this.getObjSize();
    const objY = obj.y - 16;

    const flipY = testBit(obj.attributes, 6);
    const tileY = Math.floor(this.scanline - objY);
    const top = flipY ? size - 1 - tileY : tileY;

    const off = tileNo * 16;
    return this.vram[off + (top % 8) * 2];
  }

  private fetchObjectTileDataHigh(obj: OAMEntry, tileNo: number) {
    const size = this.getObjSize();

    const objY = obj.y - 16;

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

  // private getObjPixel(x: number, y: number) {
  //   let pixel: Pixel | null = null;
  //   let minX = 0xfff;

  //   const size = this.getObjSize();

  //   for (let obj of this.objectsPerLine) {
  //     const objY = obj.y - 16;
  //     const objX = obj.x - 8;

  //     if (x < objX || x >= objX + 8 || y < objY || y >= objY + size) {
  //       continue;
  //     }

  //     if (objX >= minX) {
  //       continue;
  //     }

  //     const tileNo = this.fetchObjectTileNo(obj);

  //     const firstByte = this.fetchObjectTileDataLow(obj, tileNo);
  //     const secondByte = this.fetchObjectTileDataHigh(obj, tileNo);

  //     const color = this.fetchObjectColor(obj, firstByte, secondByte);

  //     if (color == 0x00) {
  //       continue;
  //     }

  //     minX = objX;

  //     pixel = {
  //       color,
  //       bgPriority: testBit(obj.attributes, 7),
  //       palette: testBit(obj.attributes, 4)
  //         ? this.objPalette1
  //         : this.objPalette0,
  //     };
  //   }

  //   return pixel;
  // }

  private setPixel(x: number, y: number, color: number) {
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

  private render() {
    this.context.putImageData(this.imageData, 0, 0);
  }
}
