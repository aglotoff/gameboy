import { TimerRegisters } from "./hw/timer";
import { InterruptController } from "./hw/interrupt-controller";
import { PPU } from "./hw/ppu";
import { IBus } from "./cpu";
import { OAM } from "./hw/oam";
import { MBC } from "./cartridge";
import { Joypad } from "./hw/joypad";
import { APU, APURegister } from "./hw/apu";

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

const bootROM = [
  0x31, 0xfe, 0xff, 0xaf, 0x21, 0xff, 0x9f, 0x32, 0xcb, 0x7c, 0x20, 0xfb, 0x21,
  0x26, 0xff, 0x0e, 0x11, 0x3e, 0x80, 0x32, 0xe2, 0x0c, 0x3e, 0xf3, 0xe2, 0x32,
  0x3e, 0x77, 0x77, 0x3e, 0xfc, 0xe0, 0x47, 0x11, 0x04, 0x01, 0x21, 0x10, 0x80,
  0x1a, 0xcd, 0x95, 0x00, 0xcd, 0x96, 0x00, 0x13, 0x7b, 0xfe, 0x34, 0x20, 0xf3,
  0x11, 0xd8, 0x00, 0x06, 0x08, 0x1a, 0x13, 0x22, 0x23, 0x05, 0x20, 0xf9, 0x3e,
  0x19, 0xea, 0x10, 0x99, 0x21, 0x2f, 0x99, 0x0e, 0x0c, 0x3d, 0x28, 0x08, 0x32,
  0x0d, 0x20, 0xf9, 0x2e, 0x0f, 0x18, 0xf3, 0x67, 0x3e, 0x64, 0x57, 0xe0, 0x42,
  0x3e, 0x91, 0xe0, 0x40, 0x04, 0x1e, 0x02, 0x0e, 0x0c, 0xf0, 0x44, 0xfe, 0x90,
  0x20, 0xfa, 0x0d, 0x20, 0xf7, 0x1d, 0x20, 0xf2, 0x0e, 0x13, 0x24, 0x7c, 0x1e,
  0x83, 0xfe, 0x62, 0x28, 0x06, 0x1e, 0xc1, 0xfe, 0x64, 0x20, 0x06, 0x7b, 0xe2,
  0x0c, 0x3e, 0x87, 0xe2, 0xf0, 0x42, 0x90, 0xe0, 0x42, 0x15, 0x20, 0xd2, 0x05,
  0x20, 0x4f, 0x16, 0x20, 0x18, 0xcb, 0x4f, 0x06, 0x04, 0xc5, 0xcb, 0x11, 0x17,
  0xc1, 0xcb, 0x11, 0x17, 0x05, 0x20, 0xf5, 0x22, 0x23, 0x22, 0x23, 0xc9, 0xce,
  0xed, 0x66, 0x66, 0xcc, 0x0d, 0x00, 0x0b, 0x03, 0x73, 0x00, 0x83, 0x00, 0x0c,
  0x00, 0x0d, 0x00, 0x08, 0x11, 0x1f, 0x88, 0x89, 0x00, 0x0e, 0xdc, 0xcc, 0x6e,
  0xe6, 0xdd, 0xdd, 0xd9, 0x99, 0xbb, 0xbb, 0x67, 0x63, 0x6e, 0x0e, 0xec, 0xcc,
  0xdd, 0xdc, 0x99, 0x9f, 0xbb, 0xb9, 0x33, 0x3e, 0x3c, 0x42, 0xb9, 0xa5, 0xb9,
  0xa5, 0x42, 0x3c, 0x21, 0x04, 0x01, 0x11, 0xa8, 0x00, 0x1a, 0x13, 0xbe, 0x20,
  0xfe, 0x23, 0x7d, 0xfe, 0x34, 0x20, 0xf5, 0x06, 0x19, 0x78, 0x86, 0x23, 0x05,
  0x20, 0xfb, 0x86, 0x20, 0xfe, 0x3e, 0x01, 0xe0, 0x50,
];

export class Memory implements IBus {
  private wram = new Uint8Array(0x2000);
  private hram = new Uint8Array(0x80);
  private bootROMDisabled = false;
  private mbc: MBC | null = null;

  public constructor(
    private ppu: PPU,
    private interruptController: InterruptController,
    private timer: TimerRegisters,
    private oam: OAM,
    private joypad: Joypad,
    private apu?: APU
  ) {}

  public reset() {
    this.wram = new Uint8Array(0x2000);
    this.hram = new Uint8Array(0x80);
    this.bootROMDisabled = false;
    this.mbc = null;
    this.timer.control = 0;
  }

  public setMBC(mbc: MBC) {
    this.mbc = mbc;
  }

  public readDMA(address: number) {
    if (address < bootROM.length && !this.bootROMDisabled) {
      return bootROM[address];
    }

    // 16 KiB ROM bank 00
    if (address <= 0x3fff) {
      return this.mbc?.readROM(address) ?? 0xff;
    }

    // 16 KiB ROM Bank 01–NN
    if (address <= 0x7fff) {
      return this.mbc?.readROM(address) ?? 0xff;
    }

    // 8 KiB Video RAM (VRAM)
    if (address <= 0x9fff) {
      return this.ppu.readVRAM(address - 0x8000);
    }

    // 8 KiB External RAM
    if (address <= 0xbfff) {
      return this.mbc?.readRAM(address - 0xa000) ?? 0xff;
    }

    // WRAM
    return this.wram[(address - 0xc000) & 0x1fff];
  }

  public read(address: number): number {
    if (address <= 0xfdff) {
      // if (this.oam.isDMAInProgress()) {
      //   return 0xff;
      // }
      return this.readDMA(address);
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
          return this.timer.divider;
        case HWRegister.TIMA:
          return this.timer.counter;
        case HWRegister.TMA:
          return this.timer.modulo;
        case HWRegister.TAC:
          return this.timer.control;
        case HWRegister.LCDC:
          return this.ppu.getControlRegister();
        case HWRegister.LY:
          return this.ppu.getYCoordinateRegister();
        case HWRegister.LYC:
          return this.ppu.getLYCompareRegister();
        case HWRegister.STAT:
          return this.ppu.getStatusRegister();
        case HWRegister.SCY:
          return this.ppu.getViewportYPositionRegister();
        case HWRegister.SCX:
          return this.ppu.getViewportXPositionRegister();
        case HWRegister.BGP:
          return this.ppu.getBGPaletteDataRegister();
        case HWRegister.WY:
          return this.ppu.getWindowYPositionRegister();
        case HWRegister.WX:
          return this.ppu.getWindowXPositionRegister();
        case HWRegister.OBP0:
          return this.ppu.getObjPalette0DataRegister();
        case HWRegister.OPB1:
          return this.ppu.getObjPalette1DataRegister();
        case HWRegister.IF:
          return this.interruptController.getFlagRegister();
        case HWRegister.IE:
          return this.interruptController.getEnableRegister();

        case HWRegister.NR11:
          return this.apu?.readRegister(APURegister.NR11) ?? 0xff;
        case HWRegister.NR12:
          return this.apu?.readRegister(APURegister.NR12) ?? 0xff;
        case HWRegister.NR13:
          return this.apu?.readRegister(APURegister.NR13) ?? 0xff;
        case HWRegister.NR14:
          return this.apu?.readRegister(APURegister.NR14) ?? 0xff;
        case HWRegister.NR21:
          return this.apu?.readRegister(APURegister.NR21) ?? 0xff;
        case HWRegister.NR22:
          return this.apu?.readRegister(APURegister.NR22) ?? 0xff;
        case HWRegister.NR23:
          return this.apu?.readRegister(APURegister.NR23) ?? 0xff;
        case HWRegister.NR24:
          return this.apu?.readRegister(APURegister.NR24) ?? 0xff;
        case HWRegister.NR51:
          return this.apu?.getSoundPanning() ?? 0xff;
        case HWRegister.NR52:
          return this.apu?.getAudioMasterControl() ?? 0xff;

        default:
          //console.log("READ", address.toString(16));
          return 0xff;
      }
    }

    // High RAM
    return this.hram[address - 0xff80];
  }

  public writeDMA(address: number, data: number) {
    if (address <= 0x3fff) {
      // 16 KiB ROM bank 00
      return this.mbc?.writeROM(address, data);
    }

    if (address <= 0x7fff) {
      // 16 KiB ROM Bank 01–NN
      return this.mbc?.writeROM(address, data);
    }

    if (address <= 0x9fff) {
      // 8 KiB Video RAM (VRAM)
      return this.ppu.writeVRAM(address - 0x8000, data);
    }

    if (address <= 0xbfff) {
      // 8 KiB External RAM
      return this.mbc?.writeRAM(address - 0xa000, data);
    }

    // WRAM
    this.wram[(address - 0xc000) & 0x1fff] = data;
  }

  public write(address: number, data: number) {
    if (address <= 0xfdff) {
      // if (this.oam.isDMAInProgress()) {
      //   return;
      // }
      return this.writeDMA(address, data);
    }

    if (address <= 0xfe9f) {
      // Object attribute memory (OAM)
      return this.oam.write(address - 0xfe00, data);
    }

    if (address <= 0xfeff) {
      // Not Usable
      return;
    }

    if (address <= 0xff7f || address === 0xffff) {
      // I/O Registers
      switch (address) {
        case HWRegister.JOYP:
          return this.joypad.writeRegister(data);
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
          return this.oam.startDMA(data);
        case HWRegister.DIV:
          this.timer.divider = data;
          break;
        case HWRegister.TIMA:
          this.timer.counter = data;
          break;
        case HWRegister.TMA:
          this.timer.modulo = data;
          break;
        case HWRegister.TAC:
          this.timer.control = data;
          break;
        case HWRegister.LCDC:
          return this.ppu.setControlRegister(data);
        case HWRegister.LYC:
          return this.ppu.setLYCompareRegister(data);
        case HWRegister.STAT:
          return this.ppu.setStatusRegister(data);
        case HWRegister.SCY:
          return this.ppu.setViewportYPositionRegister(data);
        case HWRegister.SCX:
          return this.ppu.setViewportXPositionRegister(data);
        case HWRegister.BGP:
          return this.ppu.setBGPaletteDataRegister(data);
        case HWRegister.WY:
          return this.ppu.setWindowYPositionRegister(data);
        case HWRegister.WX:
          return this.ppu.setWindowXPositionRegister(data);
        case HWRegister.OBP0:
          return this.ppu.setObjPalette0DataRegister(data);
        case HWRegister.OPB1:
          return this.ppu.setObjPalette1DataRegister(data);
        case HWRegister.IF:
          return this.interruptController.setFlagRegister(data);
        case HWRegister.IE:
          return this.interruptController.setEnableRegister(data);

        case HWRegister.NR11:
          this.apu?.writeRegister(APURegister.NR11, data);
          break;
        case HWRegister.NR12:
          this.apu?.writeRegister(APURegister.NR12, data);
          break;
        case HWRegister.NR13:
          this.apu?.writeRegister(APURegister.NR13, data);
          break;
        case HWRegister.NR14:
          this.apu?.writeRegister(APURegister.NR14, data);
          break;
        case HWRegister.NR21:
          this.apu?.writeRegister(APURegister.NR21, data);
          break;
        case HWRegister.NR22:
          this.apu?.writeRegister(APURegister.NR22, data);
          break;
        case HWRegister.NR23:
          this.apu?.writeRegister(APURegister.NR23, data);
          break;
        case HWRegister.NR24:
          this.apu?.writeRegister(APURegister.NR24, data);
          break;
        case HWRegister.NR51:
          this.apu?.setSoundPanning(data);
          break;
        case HWRegister.NR52:
          this.apu?.setAudioMasterControl(data);
          break;

        case HWRegister.NR10:
          //console.log("Sweeep = ", data.toString(16));
          break;
        case HWRegister.NR50:
          //console.log("NR50 = ", data.toString(16));
          break;

        case HWRegister.NR30:
        case HWRegister.NR31:
        case HWRegister.NR32:
        case HWRegister.NR33:
        case HWRegister.NR34:
        case HWRegister.NR41:
        case HWRegister.NR42:
        case HWRegister.NR43:
        case HWRegister.NR44:

        case 0xff15:
        case 0xff1f:
          // TODO
          break;
        case 0xff50:
          if (data !== 0) {
            this.bootROMDisabled = true;
          }
          break;

        default:
          //console.log("WRITE", address.toString(16));
          break;
      }
      return;
    }

    // High RAM
    this.hram[address - 0xff80] = data;
  }
}
