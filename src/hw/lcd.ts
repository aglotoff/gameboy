import { setBit, testBit } from "../utils";
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
  private inWindow = false;

  public constructor(
    private context: CanvasRenderingContext2D,
    private debugContext: CanvasRenderingContext2D,
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
    if ((data & ~0b1000000) !== 0) {
      throw new Error("Not implemented " + data.toString(2));
    }
    this.statusRegister = data;
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

  // private getBGColor(id: number) {
  //   return this.getPaletteColor(this.bgPalette, id);
  // }

  private getPaletteColor(p: number, id: number) {
    return palette[(p >> (id * 2)) & 0x3];
  }

  // public displayTile(tileNumber: number, x: number, y: number) {
  //   for (let line = 0; line < 8; line++) {
  //     for (let pixel = 0; pixel < 8; pixel++) {
  //       const id = this.getTilePixelId(tileNumber, pixel, line, false);

  //       this.debugContext.fillStyle =
  //         "#" + ("00000000" + this.getBGColor(id).toString(16)).slice(-8);
  //       this.debugContext.fillRect(x + pixel * 2, y + line * 2, 2, 2);
  //     }
  //   }
  // }

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
        this.mode = 3;
      } else if (this.dot === 252) {
        this.mode = 0;
        this.updateScanline();
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
        this.onStat();

        this.statusRegister = setBit(this.statusRegister, 2);
      }
    }
  }

  private updateScanline() {
    this.inWindow = false;

    if (
      this.isWindowEnabled() &&
      this.isBGAndWindowEnabled() &&
      this.windowX <= 166 &&
      this.windowY <= 143 &&
      this.scanline >= this.windowY
    ) {
      this.inWindow = true;
    }

    for (let i = 0; i < CANVAS_WIDTH; i++) {
      let bgPixel: Pixel = { color: 0, palette: this.bgPalette };
      let objPixel: Pixel | null = null;

      if (this.isBGAndWindowEnabled()) {
        bgPixel = this.getBGPixel(i, this.scanline);

        if (this.inWindow && i >= this.windowX - 7) {
          bgPixel = this.getWindowPixel(i, this.windowLineCounter);
        }
      }

      if (this.isObjEnabled()) {
        objPixel = this.getObjPixel(i, this.scanline);
      }

      let pixel = 0x00000000;

      if (objPixel) {
        if (
          objPixel.color != 0x00 &&
          objPixel.bgPriority &&
          bgPixel.color !== 0
        ) {
          pixel = this.getPaletteColor(this.bgPalette, bgPixel.color);
        } else {
          pixel = this.getPaletteColor(objPixel.palette, objPixel.color);
        }
      } else {
        pixel = this.getPaletteColor(this.bgPalette, bgPixel.color);
      }

      this.setPixel(i, this.scanline, pixel);
    }

    if (this.inWindow) {
      this.windowLineCounter++;
    }
  }

  private getBGPixel(x: number, y: number): Pixel {
    const mapBase = this.getBGTileMapArea();

    const top = (this.viewportY + y) % 256;
    const left = (this.viewportX + x) % 256;

    const tileX = Math.floor(left / 8);
    const tileY = Math.floor(top / 8);

    const tileNumber = this.vram[mapBase + tileY * 32 + tileX];

    const color = this.getTilePixelId(tileNumber, left % 8, top % 8, false);

    return { color, palette: this.bgPalette };
  }

  private getWindowPixel(x: number, y: number): Pixel {
    const mapBase = this.getWindowTileMapArea();

    const top = y;
    const left = x - this.windowX + 7;

    const tileX = Math.floor(left / 8);
    const tileY = Math.floor(top / 8);

    const tileNumber = this.vram[mapBase + tileY * 32 + tileX];

    const color = this.getTilePixelId(tileNumber, left % 8, top % 8, false);

    return { color, palette: this.bgPalette };
  }

  private oamScan() {
    if (this.objectsPerLine.length === 10) {
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

  private getObjPixel(x: number, y: number) {
    let pixel: Pixel | null = null;
    let minX = 0xfff;

    const size = this.getObjSize();

    for (let obj of this.objectsPerLine) {
      const objY = obj.y - 16;
      const objX = obj.x - 8;

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
    // for (let y = 0; y < 24; y++) {
    //   for (let x = 0; x < 16; x++) {
    //     this.displayTile(y * 16 + x, x * 16, y * 16);
    //   }
    // }

    this.context.putImageData(this.imageData, 0, 0);
  }
}
