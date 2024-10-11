import { testBit } from "./utils";

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

export class LCD {
  private controlRegister = 0;

  private oam = new Uint8Array(0xa0);
  private vram = new Uint8Array(VRAM_SIZE);
  private scanline = 0;
  private dot = 0;
  private imageData: ImageData;
  private mode = 0;

  private viewportX = 0;
  private viewportY = 0;
  private bgPalette = 0;

  public constructor(
    private context: CanvasRenderingContext2D,
    private debugContext: CanvasRenderingContext2D
  ) {
    this.imageData = context.createImageData(160 * 2, 144 * 2);
  }

  public readOAM(offset: number) {
    // TODO: modes
    return this.oam[offset];
  }

  public writeOAM(offset: number, value: number) {
    // TODO: modes
    this.oam[offset] = value;
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
    throw new Error("Not implemented");
    return 0;
  }

  public setLYCompareRegister(_data: number) {
    throw new Error("Not implemented");
  }

  public getStatusRegister() {
    throw new Error("Not implemented");
    return 0;
  }

  public setStatusRegister(_data: number) {
    throw new Error("Not implemented");
  }

  private isEnabled() {
    return testBit(this.controlRegister, 7);
  }

  private getWindowTileMapArea() {
    return testBit(this.controlRegister, 6) ? 0x400 : 0;
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
    return testBit(this.controlRegister, 2) ? 2 : 1;
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

  public getBGPaletteDataRegister() {
    return this.bgPalette;
  }

  public setBGPaletteDataRegister(data: number) {
    this.bgPalette = data;
  }

  private getBGColor(id: number) {
    const palette = [0xe0f8d0, 0x88c070, 0x346856, 0x081820];
    return palette[id];
  }

  public displayTile(tileNumber: number, x: number, y: number) {
    for (let line = 0; line < 8; line++) {
      for (let pixel = 0; pixel < 8; pixel++) {
        const id = this.getTilePixelId(tileNumber, pixel, line);

        this.debugContext.fillStyle =
          "#" + ("000000" + this.getBGColor(id).toString(16)).slice(-6);
        this.debugContext.fillRect(x + pixel * 2, y + line * 2, 2, 2);
      }
    }
  }

  private getTilePixelId(tileNumber: number, x: number, y: number) {
    const dataBase = this.getBGAndWindowTileDataArea();

    const off = dataBase + tileNumber * 16;

    const firstByte = this.vram[off + y * 2];
    const secondByte = this.vram[off + y * 2 + 1];

    const lsb = (firstByte >> (8 - x)) & 0x1;
    const msb = (secondByte >> (8 - x)) & 0x1;

    return (msb << 1) | lsb;
  }

  public tick() {
    if (!this.isEnabled()) {
      return;
    }

    if (this.scanline < 144) {
      if (this.dot === 0) {
        this.mode = 2;
      } else if (this.dot === 80) {
        this.mode = 3;
      } else if (this.dot === 252) {
        this.mode = 0;
        this.updateScanline();
      }
    } else if (this.scanline === 144 && this.dot === 0) {
      this.mode = 1;
      this.render();
    }

    this.dot = (this.dot + 1) % DOTS_PER_SCANLINE;

    if (this.dot === 0) {
      this.scanline = (this.scanline + 1) % SCANLINES_PER_FRAME;
    }
  }

  private updateScanline() {
    for (let i = 0; i < CANVAS_WIDTH; i++) {
      this.setPixel(
        i,
        this.scanline,
        (this.getBGColor(this.getBGPixel(i, this.scanline)) << 8) | 0xff
      );
    }
  }

  private getBGPixel(x: number, y: number) {
    const mapBase = this.getBGTileMapArea();

    const top = (this.viewportY + y) % 256;
    const left = (this.viewportX + x) % 256;

    const tileX = Math.floor(left / 8);
    const tileY = Math.floor(top / 8);

    const tileNumber = this.vram[mapBase + tileY * 32 + tileX];

    return this.getTilePixelId(tileNumber, left % 8, top % 8);
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
    this.context.putImageData(this.imageData, 0, 0);

    for (let y = 0; y < 24; y++) {
      for (let x = 0; x < 16; x++) {
        this.displayTile(y * 16 + x, x * 16, y * 16);
      }
    }
  }
}
