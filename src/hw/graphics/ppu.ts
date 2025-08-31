import { resetBit, setBit, testBit } from "../../utils";
import { OAM, OAM_TOTAL_OBJECTS, OAMEntry } from "./oam";
import { VRAM } from "./vram";

const LCD_WIDTH = 160;
const LCD_HEIGHT = 144;

const DOTS_PER_SCANLINE = 456;
const SCANLINES_PER_FRAME = 154;

const TICKS_PER_OAM_ENTRY = 2;
const OAM_SCAN_TICKS = TICKS_PER_OAM_ENTRY * OAM_TOTAL_OBJECTS;

const BYTES_PER_TILE = 16;

const palette = [0xe0f8d0ff, 0x88c070ff, 0x346856ff, 0x081820ff];

interface Pixel {
  color: number;
  palette: number;
  bgPriority?: boolean;
}

const enum PPUMode {
  HBlank = 0,
  VBlank = 1,
  OAMScan = 2,
  Drawing = 3,
}

const enum StatSource {
  Mode0 = 3,
  Mode1 = 4,
  Mode2 = 5,
  LYC = 6,
}

const STAT_SOURCE_MASK = 0b1111000;

const STAT_MODE_MASK = 0x3;

export interface ILCD {
  setPixel(x: number, y: number, pixel: number): void;
  render(): void;
}

export class PPU {
  // Registers
  private statusRegister = 0;
  private scanlineToCompare = 0;
  private viewportY = 0;
  private viewportX = 0;
  private windowY = 0;
  private windowX = 0;
  private bgPalette = 0;
  private objPalette0 = 0;
  private objPalette1 = 0;
  private isEnabled = false;

  // Interrupts
  private statInterruptLine = false;

  // Per-frame state
  private scanline = 0;
  private mode = 0;
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
    ready: [] as Pixel[],
  };

  private objFetcher = {
    step: 0,
    tileNo: 0,
    dataLow: 0,
    dataHigh: 0,
    busy: false,
    ready: [] as Pixel[],
    current: null as OAMEntry | null,
  };

  public constructor(
    private lcd: ILCD,
    private oam: OAM,
    private vram: VRAM,
    private onVBlank: () => void,
    private onStat: () => void
  ) {}

  public setIsEnabled(enabled: boolean) {
    const wasEnabled = this.isEnabled;
    this.isEnabled = enabled;

    if (!wasEnabled && enabled) {
      this.scanline = 0;
      this.dot = 4;
      this.mode = PPUMode.HBlank;
      this.statusRegister &= ~STAT_MODE_MASK;
      this.objBuffer.splice(0);

      this.oam.unlockRead();
      this.oam.unlockWrite();
      this.vram.unlockRead();
      this.vram.unlockWrite();
    }
  }

  private windowTileMapArea = 0;

  public setWindowTileMapArea(base: number) {
    this.windowTileMapArea = base;
  }

  private isWindowEnabled = false;

  public setWindowEnabled(enabled: boolean) {
    this.isWindowEnabled = enabled;
  }

  private bgTileMapArea = 0;

  public setBGTileMapArea(area: number) {
    this.bgTileMapArea = area;
  }

  private objHeight = 8;

  public setObjHeight(objHeight: number) {
    this.objHeight = objHeight;
  }

  private isObjEnabled = false;

  public setObjEnabled(enabled: boolean) {
    this.isObjEnabled = enabled;
  }

  private isBGAndWindowEnabled = false;

  public setBGAndWindowEnabled(enabled: boolean) {
    this.isBGAndWindowEnabled = enabled;
  }

  // ff41
  public getStatusRegister() {
    return 0x80 | this.statusRegister;
  }

  // TODO: IRQs
  public setStatusRegister(data: number) {
    this.statusRegister &= ~STAT_SOURCE_MASK;
    this.statusRegister |= data & STAT_SOURCE_MASK;
  }

  private statModeDelay = 0;
  private irqModeDelay = 0;
  private irqMode = 0;

  private setMode(mode: PPUMode, statModeDelay = 4, irqModeDelay = 4) {
    this.mode = mode;

    if (statModeDelay === 0) {
      this.statusRegister &= ~STAT_MODE_MASK;
      this.statusRegister |= mode;
    } else {
      this.statModeDelay = statModeDelay;
    }

    if (irqModeDelay === 0) {
      this.irqMode = mode;
    } else {
      this.irqModeDelay = irqModeDelay;
    }
  }

  public getScanline() {
    return this.scanline;
  }

  public getScanlineToCompare() {
    return this.scanlineToCompare;
  }

  public setScanlineToCompare(data: number) {
    this.scanlineToCompare = data;
  }

  public getViewportYPosition() {
    return this.viewportY;
  }

  public setViewportYPosition(data: number) {
    this.viewportY = data;
  }

  public getViewportXPosition() {
    return this.viewportX;
  }

  public setViewportXPosition(data: number) {
    this.viewportX = data;
  }

  public getWindowYPosition() {
    return this.windowY;
  }

  public setWindowYPosition(data: number) {
    this.windowY = data;
  }

  public getWindowXPosition() {
    return this.windowX;
  }

  public setWindowXPosition(data: number) {
    this.windowX = data;
  }

  public getBGPaletteData() {
    return this.bgPalette;
  }

  public setBGPaletteData(data: number) {
    this.bgPalette = data;
  }

  public getObjPalette0Data() {
    return this.objPalette0;
  }

  public setObjPalette0Data(data: number) {
    this.objPalette0 = data;
  }

  public getObjPalette1Data() {
    return this.objPalette1;
  }

  public setObjPalette1Data(data: number) {
    this.objPalette1 = data;
  }

  public tick() {
    if (!this.isEnabled) {
      this.statusRegister &= ~STAT_MODE_MASK;
      this.objBuffer.splice(0);
      this.oam.unlockRead();
      this.oam.unlockWrite();
      this.vram.unlockRead();
      this.vram.unlockWrite();
      return;
    }

    this.updateStatMode();
    this.checkStatRisingEdge();

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
    this.updateStatLYC();
  }

  private updateStatMode() {
    if (this.statModeDelay > 0) {
      this.statModeDelay -= 1;
      if (this.statModeDelay === 0) {
        this.statusRegister &= ~STAT_MODE_MASK;
        this.statusRegister |= this.mode;
      }
    }

    if (this.irqModeDelay > 0) {
      this.irqModeDelay -= 1;
      if (this.irqModeDelay === 0) {
        this.irqMode = this.mode;
      }
    }
  }

  private oamScanTick() {
    if (this.dot === 0) {
      this.oam.lockWrite();
    }

    if (this.dot % TICKS_PER_OAM_ENTRY === 0) {
      const entryIdx = this.dot / TICKS_PER_OAM_ENTRY;

      if (entryIdx === 38) {
        this.oam.unlockWrite();
      }

      this.checkOAMEntry(entryIdx);

      this.oam.setActiveRow(Math.floor((entryIdx + 1) / 2));
    } else if (this.dot === OAM_SCAN_TICKS - 1) {
      this.objBuffer.sort((o1, o2) => o1.xPosition - o2.xPosition);

      this.setMode(PPUMode.Drawing);
      this.oam.setActiveRow(0);
      this.vram.lockRead();
    }
  }

  private checkOAMEntry(entryIndex: number) {
    if (this.objBuffer.length === 10) {
      return;
    }

    const entry = this.oam.getEntry(entryIndex);

    const top = entry.yPosition;
    const bottom = top + this.objHeight - 1;

    if (this.scanline < top || this.scanline > bottom) {
      return;
    }

    this.objBuffer.push(entry);
  }

  private drawingTick() {
    if (this.dot === OAM_SCAN_TICKS) {
      this.bgQueue = [
        { color: 0, palette: 0 },
        { color: 0, palette: 0 },
        { color: 0, palette: 0 },
        { color: 0, palette: 0 },
        { color: 0, palette: 0 },
        { color: 0, palette: 0 },
        { color: 0, palette: 0 },
        { color: 0, palette: 0 },
      ];
      this.objQueue = [];
      this.bgXPosition = 0;
      this.inWindow = false;
      this.xPosition = -8;
      this.bgXSkip = this.viewportX % 8;
      this.bgFetcher.step = 0;
      this.bgFetcher.busy = false;
      this.bgFetcher.ready = [];
      this.objFetcher.busy = false;
      this.objFetcher.current = null;
      this.objFetcher.ready = [];
      this.objFetcher.step = 0;

      this.oam.lockRead();
      this.oam.lockWrite();
      this.vram.lockRead();
      this.vram.lockWrite();

      this.windowTriggered = false;

      if (
        this.isWindowEnabled &&
        this.isBGAndWindowEnabled &&
        this.windowX <= 166 &&
        this.windowY < LCD_HEIGHT &&
        this.scanline >= this.windowY
      ) {
        this.windowTriggered = true;
      }
    }

    if (this.dot >= OAM_SCAN_TICKS + 4) {
      let success = false;

      if (this.objFetcher.current == null) {
        this.objFetcher.current = this.getCurrentObject(this.xPosition);
      }

      if (!this.objFetcher.busy && !this.objFetcher.current) {
        if (this.bgQueue.length !== 0) {
          const bgPixel = this.bgQueue.shift()!;

          if (this.bgXSkip > 0) {
            this.bgXSkip -= 1;
          } else {
            const objPixel = this.objQueue.shift();

            let mergedPixel = 0x00000000;

            if (objPixel && objPixel.color != 0) {
              if (objPixel.bgPriority && bgPixel.color !== 0) {
                mergedPixel = this.getPaletteColor(
                  this.bgPalette,
                  bgPixel.color
                );
              } else {
                mergedPixel = this.getPaletteColor(
                  objPixel.palette,
                  objPixel.color
                );
              }
            } else {
              mergedPixel = this.getPaletteColor(this.bgPalette, bgPixel.color);
            }

            if (this.xPosition >= 0) {
              this.lcd.setPixel(this.xPosition, this.scanline, mergedPixel);
            }
            success = true;
          }
        }
      }

      this.bgFetcherTick();
      this.objFetcherTick();

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
        this.bgFetcher.ready = [];
        return;
      }

      if (success) {
        this.xPosition++;
        this.objFetcher.current = null;

        if (this.xPosition === LCD_WIDTH) {
          this.objBuffer.splice(0);

          if (this.windowTriggered) {
            this.windowLineCounter++;
          }

          this.setMode(PPUMode.HBlank, 1);
        }
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

    let pos = (256 + this.bgXPosition) % 256;

    switch (this.bgFetcher.step) {
      case 0:
        this.bgFetcher.tileNo = this.inWindow
          ? this.fetchWindowTileNo(pos, this.windowLineCounter)
          : this.fetchBackgroundTileNo(
              pos + this.viewportX,
              this.scanline + this.viewportY
            );
        break;

      case 2:
        this.bgFetcher.dataLow = this.inWindow
          ? this.fetchWindowTileDataLow(
              this.bgFetcher.tileNo,
              this.windowLineCounter
            )
          : this.fetchBackgroundTileDataLow(
              this.bgFetcher.tileNo,
              this.scanline + this.viewportY
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
              this.scanline + this.viewportY
            );

        this.bgFetcher.ready = [];

        for (let x = 0; x < 8; x++) {
          let pos = (256 + this.bgXPosition) % 256;

          if (this.isBGAndWindowEnabled) {
            const lsb = (this.bgFetcher.dataLow >> (7 - (pos % 8))) & 0x1;
            const msb = (this.bgFetcher.dataHigh >> (7 - (pos % 8))) & 0x1;

            const color = (msb << 1) | lsb;

            this.bgFetcher.ready.push({ color, palette: this.bgPalette });
          } else {
            this.bgFetcher.ready.push({ color: 0, palette: this.bgPalette });
          }

          this.bgXPosition++;
        }
        break;

      case 5:
        this.bgFetcher.busy = false;

        if (this.bgQueue.length === 0) {
          for (let x = 0; x < 8; x++) {
            this.bgQueue.push(this.bgFetcher.ready.shift()!);
          }

          this.bgFetcher.step = 0;
        }
        return;
    }

    this.bgFetcher.step += 1;
  }

  private fetchWindowTileNo(x: number, y: number) {
    return this.vram.readTileMap(this.windowTileMapArea, x, y);
  }

  private fetchBackgroundTileNo(x: number, y: number) {
    return this.vram.readTileMap(this.bgTileMapArea, x, y);
  }

  private fetchWindowTileDataLow(tileNo: number, y: number) {
    const base = this.getBgAndWindowTileBase(tileNo);
    return this.vram.readTileDataLow(base, y);
  }

  private fetchBackgroundTileDataLow(tileNo: number, y: number) {
    const base = this.getBgAndWindowTileBase(tileNo);
    return this.vram.readTileDataLow(base, y);
  }

  private fetchWindowTileDataHigh(tileNo: number, y: number) {
    const base = this.getBgAndWindowTileBase(tileNo);
    return this.vram.readTileDataHigh(base, y);
  }

  private fetchBackgroundTileDataHigh(tileNo: number, y: number) {
    const base = this.getBgAndWindowTileBase(tileNo);
    return this.vram.readTileDataHigh(base, y);
  }

  private bgAndWindowTileBase = 0x1000;

  public setBgAndWindowTileBase(base: number) {
    this.bgAndWindowTileBase = base;
  }

  private getBgAndWindowTileBase(tileNo: number) {
    if (tileNo > 127) {
      return Math.floor(0x0800 / BYTES_PER_TILE) + (tileNo % 128);
    }

    return Math.floor(this.bgAndWindowTileBase / BYTES_PER_TILE) + tileNo;
  }

  private objFetcherTick() {
    if (this.objFetcher.step === 0) {
      if (this.objFetcher.current == null || this.bgFetcher.busy) {
        return;
      }

      this.objFetcher.busy = true;
    }

    switch (this.objFetcher.step) {
      case 0:
        this.objFetcher.tileNo = this.getObjectTileNo(this.objFetcher.current!);
        break;
      case 2:
        this.objFetcher.dataLow = this.fetchObjectTileDataLow(
          this.objFetcher.current!,
          this.objFetcher.tileNo,
          this.scanline
        );
        break;
      case 4:
        this.objFetcher.dataHigh = this.fetchObjectTileDataHigh(
          this.objFetcher.current!,
          this.objFetcher.tileNo,
          this.scanline
        );

        break;

      case 5:
        const start = this.xPosition - this.objFetcher.current!.xPosition;

        for (let j = start; j < 8; j++) {
          const color = this.fetchObjectColor(
            this.objFetcher.current!,
            this.objFetcher.dataLow,
            this.objFetcher.dataHigh,
            j
          );

          const pixel = {
            color,
            bgPriority: this.objFetcher.current!.bgPriority,
            palette: this.objFetcher.current!.palette
              ? this.objPalette1
              : this.objPalette0,
          };

          const oldPixel = this.objFetcher.ready[j - start];
          if (oldPixel == null || oldPixel?.color === 0) {
            this.objFetcher.ready[j - start] = pixel;
          }
        }

        this.objFetcher.current = this.getCurrentObject(this.xPosition);
        if (this.objFetcher.current == null) {
          for (let j = 0; j < this.objFetcher.ready.length; j++) {
            const pixel = this.objFetcher.ready[j];
            const oldPixel = this.objQueue[j];
            if (oldPixel == null || oldPixel?.color === 0) {
              this.objQueue[j] = pixel;
            }
          }

          this.objFetcher.ready = [];
          this.objFetcher.busy = false;
        }

        this.objFetcher.step = 0;
        return;
    }

    this.objFetcher.step += 1;
  }

  private getObjectTileNo(obj: OAMEntry) {
    const size = this.objHeight;

    const objY = obj.yPosition;

    const tileY = Math.floor(this.scanline - objY);

    const top = obj.flipY ? size - 1 - tileY : tileY;

    return size === 16
      ? top >= 8
        ? obj.tileIndex | 0x01
        : obj.tileIndex & 0xfe
      : obj.tileIndex;
  }

  private fetchObjectTileDataLow(obj: OAMEntry, tileNo: number, y: number) {
    const top = this.getObjectTileDataOffset(obj, y);
    return this.vram.readTileDataLow(tileNo, top);
  }

  private fetchObjectTileDataHigh(obj: OAMEntry, tileNo: number, y: number) {
    const top = this.getObjectTileDataOffset(obj, y);
    return this.vram.readTileDataHigh(tileNo, top);
  }

  private getObjectTileDataOffset(obj: OAMEntry, y: number) {
    const size = this.objHeight;

    const objY = obj.yPosition;

    const flipY = obj.flipY;
    const tileY = y - objY;

    return flipY ? size - 1 - tileY : tileY;
  }

  private fetchObjectColor(
    obj: OAMEntry,
    firstByte: number,
    secondByte: number,
    tileX: number
  ) {
    const left = obj.flipX ? 7 - tileX : tileX;

    const lsb = (firstByte >> (7 - left)) & 0x1;
    const msb = (secondByte >> (7 - left)) & 0x1;

    return (msb << 1) | lsb;
  }

  private getCurrentObject(x: number) {
    if (!this.isObjEnabled || this.objBuffer.length === 0) {
      return null;
    }

    if (this.objBuffer[0].xPosition > x) {
      return null;
    }

    return this.objBuffer.shift()!;
  }

  private getPaletteColor(p: number, id: number) {
    return palette[(p >> (id * 2)) & 0x3];
  }

  private hBlankTick() {
    if (this.dot === OAM_SCAN_TICKS - 1) {
      this.setMode(PPUMode.Drawing);
      return;
    }

    if (this.dot < OAM_SCAN_TICKS - 1) {
      return;
    }

    this.vram.unlockRead();
    this.vram.unlockWrite();
    this.oam.unlockRead();
    this.oam.unlockWrite();

    if (this.dot === DOTS_PER_SCANLINE - 1) {
      this.advanceScanline();

      if (this.scanline === LCD_HEIGHT) {
        this.setMode(PPUMode.VBlank);
      } else {
        this.setMode(PPUMode.OAMScan);
        this.oam.lockRead();
      }
    }
  }

  private vBlankTick() {
    if (this.dot === 4 && this.scanline === LCD_HEIGHT) {
      this.onVBlank();
      this.lcd.render();
    } else if (this.dot === DOTS_PER_SCANLINE - 1) {
      this.advanceScanline();

      if (this.scanline === 0) {
        this.setMode(PPUMode.OAMScan);
        this.oam.lockRead();
        this.windowLineCounter = 0;
      }
    }
  }

  private advanceDot() {
    this.dot = (this.dot + 1) % DOTS_PER_SCANLINE;
  }

  private updateStatLYC() {
    if (this.scanline === this.scanlineToCompare && this.dot !== 0) {
      this.statusRegister = setBit(this.statusRegister, 2);
    } else {
      this.statusRegister = resetBit(this.statusRegister, 2);
    }
  }

  private advanceScanline() {
    this.scanline = (this.scanline + 1) % SCANLINES_PER_FRAME;
  }

  private checkStatRisingEdge() {
    const newLine = this.getStatInterruptLine();

    if (!this.statInterruptLine && newLine) {
      this.onStat();
    }

    this.statInterruptLine = newLine;
  }

  private getStatInterruptLine() {
    if (
      testBit(this.statusRegister, StatSource.LYC) &&
      testBit(this.statusRegister, 2)
    ) {
      return true;
    }

    if (
      testBit(this.statusRegister, StatSource.Mode0) &&
      this.irqMode === PPUMode.HBlank
    ) {
      return true;
    }

    if (
      testBit(this.statusRegister, StatSource.Mode1) &&
      this.irqMode === PPUMode.VBlank
    ) {
      return true;
    }

    if (
      testBit(this.statusRegister, StatSource.Mode2) &&
      (this.irqMode === PPUMode.OAMScan ||
        (this.dot === 4 && this.scanline === LCD_HEIGHT))
    ) {
      return true;
    }

    return false;
  }
}
