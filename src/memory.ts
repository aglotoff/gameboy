import { Timer } from "./hw/timer";
import { InterruptController } from "./hw/interrupt-controller";
import { LCD } from "./hw/lcd";
import { IBus } from "./cpu";
import { OAM } from "./hw/oam";
import { MBC } from "./cartridge";
import { Joypad } from "./hw/joypad";

let buf = "";

export enum HWRegister {
  JOYP = 0xff00,
  SB = 0xff01,
  SC = 0xff02,
  DIV = 0xff04,
  TIMA = 0xff05,
  TMA = 0xff06,
  TAC = 0xff07,
  IF = 0xff0f,
  NR10 = 0xff10,
  NR11 = 0xff11,
  NR12 = 0xff12,
  NR13 = 0xff13,
  NR14 = 0xff14,
  NR21 = 0xff16,
  NR22 = 0xff17,
  NR23 = 0xff18,
  NR24 = 0xff19,
  NR30 = 0xff1a,
  NR31 = 0xff1b,
  NR32 = 0xff1c,
  NR33 = 0xff1d,
  NR34 = 0xff1e,
  NR41 = 0xff20,
  NR42 = 0xff21,
  NR43 = 0xff22,
  NR44 = 0xff23,
  NR50 = 0xff24,
  NR51 = 0xff25,
  NR52 = 0xff26,
  LCDC = 0xff40,
  STAT = 0xff41,
  SCY = 0xff42,
  SCX = 0xff43,
  LY = 0xff44,
  LYC = 0xff45,
  DMA = 0xff46,
  BGP = 0xff47,
  OBP0 = 0xff48,
  OPB1 = 0xff49,
  WY = 0xff4a,
  WX = 0xff4b,
  IE = 0xffff,
}

export class Memory implements IBus {
  private wram = new Uint8Array(0x10000);

  public constructor(
    private lcd: LCD,
    private interruptController: InterruptController,
    private timer: Timer,
    private mbc: MBC,
    private oam: OAM,
    private joypad: Joypad
  ) {}

  public read(address: number): number {
    // 16 KiB ROM bank 00
    if (address <= 0x3fff) {
      return this.mbc.readROM(address);
    }

    // 16 KiB ROM Bank 01–NN
    if (address <= 0x7fff) {
      return this.mbc.readROM(address);
    }

    // 8 KiB Video RAM (VRAM)
    if (address <= 0x9fff) {
      return this.lcd.readVRAM(address - 0x8000);
    }

    // 8 KiB External RAM
    if (address <= 0xbfff) {
      return this.mbc.readRAM(address - 0xa000);
    }

    // 4 KiB Work RAM (WRAM)
    if (address <= 0xcfff) {
      return this.wram[address];
    }

    // 4 KiB Work RAM (WRAM)
    if (address <= 0xdfff) {
      return this.wram[address];
    }

    // Echo RAM
    if (address <= 0xfdff) {
      return this.wram[address - 0x2000];
    }

    // Object attribute memory (OAM)
    if (address <= 0xfe9f) {
      return this.oam.read(address - 0xfe00);
    }

    // Not Usable
    if (address <= 0xfeff) {
      return 0xff;
    }

    // I/O Registers
    if (address <= 0xff7f || address === 0xffff) {
      switch (address) {
        case HWRegister.JOYP:
          return this.joypad.readRegister();
        case HWRegister.DMA:
          return this.oam.getDMASource();
        case HWRegister.DIV:
          return this.timer.getDividerRegister();
        case HWRegister.TIMA:
          return this.timer.getCounterRegister();
        case HWRegister.TMA:
          return this.timer.getModuloRegister();
        case HWRegister.TAC:
          return this.timer.getControlRegister();
        case HWRegister.LCDC:
          return this.lcd.getControlRegister();
        case HWRegister.LY:
          return this.lcd.getYCoordinateRegister();
        case HWRegister.LYC:
          return this.lcd.getLYCompareRegister();
        case HWRegister.STAT:
          return this.lcd.getStatusRegister();
        case HWRegister.SCY:
          return this.lcd.getViewportYPositionRegister();
        case HWRegister.SCX:
          return this.lcd.getViewportXPositionRegister();
        case HWRegister.BGP:
          return this.lcd.getBGPaletteDataRegister();
        case HWRegister.WY:
          return this.lcd.getWindowYPositionRegister();
        case HWRegister.WX:
          return this.lcd.getWindowXPositionRegister();
        case HWRegister.OBP0:
          return this.lcd.getObjPalette0DataRegister();
        case HWRegister.OPB1:
          return this.lcd.getObjPalette1DataRegister();
        case HWRegister.IF:
          return this.interruptController.getFlagRegister();
        case HWRegister.IE:
          return this.interruptController.getEnableRegister();
        default:
          //console.log("READ", address.toString(16));
          return 0xff;
      }
    }

    // High RAM
    return this.wram[address];
  }

  public write(address: number, data: number) {
    // console.log(address.toString(16), data.toString(16));

    if (address <= 0x3fff) {
      // 16 KiB ROM bank 00
      this.mbc.writeROM(address, data);
    } else if (address <= 0x7fff) {
      // 16 KiB ROM Bank 01–NN
      this.mbc.writeROM(address, data);
    } else if (address <= 0x9fff) {
      // 8 KiB Video RAM (VRAM)
      this.lcd.writeVRAM(address - 0x8000, data);
    } else if (address <= 0xbfff) {
      // 8 KiB External RAM
      this.mbc.writeRAM(address - 0xa000, data);
    } else if (address <= 0xcfff) {
      // 4 KiB Work RAM (WRAM)
      this.wram[address] = data;
    } else if (address <= 0xdfff) {
      // 4 KiB Work RAM (WRAM)
      this.wram[address] = data;
    } else if (address <= 0xfdff) {
      // Echo RAM
      this.wram[address - 0x2000] = data;
    } else if (address <= 0xfe9f) {
      // Object attribute memory (OAM)
      this.oam.write(address - 0xfe00, data);
    } else if (address <= 0xfeff) {
      // Not Usable
    } else if (address <= 0xff7f || address === 0xffff) {
      // I/O Registers
      switch (address) {
        case HWRegister.JOYP:
          this.joypad.writeRegister(data);
          break;
        case HWRegister.SB:
          if (data == 10) {
            if (buf.length > 0) {
              console.log(buf);
            }
            buf = "";
          } else {
            buf += String.fromCharCode(data);
          }
          break;
        case HWRegister.DMA:
          this.oam.startDMA(data);
          break;
        case HWRegister.DIV:
          this.timer.setDividerRegister(data);
          break;
        case HWRegister.TIMA:
          this.timer.setCounterRegister(data);
          break;
        case HWRegister.TMA:
          this.timer.setModuloRegister(data);
          break;
        case HWRegister.TAC:
          this.timer.setControlRegister(data);
          break;
        case HWRegister.LCDC:
          this.lcd.setControlRegister(data);
          break;
        case HWRegister.LYC:
          this.lcd.setLYCompareRegister(data);
          break;
        case HWRegister.STAT:
          this.lcd.setStatusRegister(data);
          break;
        case HWRegister.SCY:
          this.lcd.setViewportYPositionRegister(data);
          break;
        case HWRegister.SCX:
          this.lcd.setViewportXPositionRegister(data);
          break;
        case HWRegister.BGP:
          this.lcd.setBGPaletteDataRegister(data);
          break;
        case HWRegister.WY:
          this.lcd.setWindowYPositionRegister(data);
          break;
        case HWRegister.WX:
          this.lcd.setWindowXPositionRegister(data);
          break;
        case HWRegister.OBP0:
          this.lcd.setObjPalett0DataRegister(data);
          break;
        case HWRegister.OPB1:
          this.lcd.setObjPalett1DataRegister(data);
          break;
        case HWRegister.IF:
          this.interruptController.setFlagRegister(data);
          break;
        case HWRegister.IE:
          this.interruptController.setEnableRegister(data);
          break;
        case HWRegister.NR10:
        case HWRegister.NR11:
        case HWRegister.NR12:
        case HWRegister.NR13:
        case HWRegister.NR14:
        case HWRegister.NR21:
        case HWRegister.NR22:
        case HWRegister.NR23:
        case HWRegister.NR24:
        case HWRegister.NR30:
        case HWRegister.NR31:
        case HWRegister.NR32:
        case HWRegister.NR33:
        case HWRegister.NR34:
        case HWRegister.NR41:
        case HWRegister.NR42:
        case HWRegister.NR43:
        case HWRegister.NR44:
        case HWRegister.NR50:
        case HWRegister.NR51:
        case HWRegister.NR52:
        case 0xff15:
        case 0xff1f:
          // TODO
          break;
        default:
          //console.log("WRITE", address.toString(16));
          break;
      }
    } else {
      // High RAM
      this.wram[address] = data;
    }
  }
}
