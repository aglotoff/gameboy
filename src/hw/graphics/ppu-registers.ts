import { testBit } from "../../utils";
import { PPU } from "./ppu";

const TILE_HIGH = 0x9c00 - 0x8000;
const TILE_LOW = 0x9800 - 0x8000;

export class PPURegisters {
  private controlRegister = 0;

  public constructor(private ppu: PPU) {}

  // ff40
  public get lcdc() {
    return this.controlRegister;
  }

  public set lcdc(value: number) {
    this.controlRegister = value;

    this.ppu.setBGAndWindowEnabled(testBit(value, 0));
    this.ppu.setObjEnabled(testBit(value, 1));
    this.ppu.setObjHeight(testBit(value, 2) ? 16 : 8);
    this.ppu.setBGTileMapArea(testBit(value, 3) ? TILE_HIGH : TILE_LOW);
    this.ppu.setBgAndWindowTileBase(testBit(value, 4) ? 0x0000 : 0x1000);
    this.ppu.setWindowEnabled(testBit(value, 5));
    this.ppu.setWindowTileMapArea(testBit(value, 6) ? TILE_HIGH : TILE_LOW);
    this.ppu.setIsEnabled(testBit(value, 7));
  }

  // ff41
  public get stat() {
    return this.ppu.getStatusRegister();
  }

  public set stat(value: number) {
    this.ppu.setStatusRegister(value);
  }

  // ff42
  public get scy() {
    return this.ppu.getViewportYPosition();
  }

  public set scy(y: number) {
    this.ppu.setViewportYPosition(y);
  }

  // ff43
  public get scx() {
    return this.ppu.getViewportXPosition();
  }

  public set scx(x: number) {
    this.ppu.setViewportXPosition(x);
  }

  // ff44
  public get ly() {
    return this.ppu.getScanline();
  }

  // ff45
  public get lyc() {
    return this.ppu.getScanlineToCompare();
  }

  public set lyc(scanline: number) {
    this.ppu.setScanlineToCompare(scanline);
  }

  // ff47
  public get bgp() {
    return this.ppu.getBGPaletteData();
  }

  public set bgp(data: number) {
    this.ppu.setBGPaletteData(data);
  }

  // ff48
  public get obp0() {
    return this.ppu.getObjPalette0Data();
  }

  public set obp0(data: number) {
    this.ppu.setObjPalette0Data(data);
  }

  // ff49
  public get obp1() {
    return this.ppu.getObjPalette1Data();
  }

  public set obp1(data: number) {
    this.ppu.setObjPalette1Data(data);
  }

  // ff4a
  public get wy() {
    return this.ppu.getWindowYPosition();
  }

  public set wy(y: number) {
    this.ppu.setWindowYPosition(y);
  }

  // ff4b
  public get wx() {
    return this.ppu.getWindowXPosition();
  }

  public set wx(x: number) {
    this.ppu.setWindowXPosition(x);
  }
}
