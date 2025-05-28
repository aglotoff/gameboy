import { TimerRegisters } from "./hw/timer";
import { InterruptController } from "./hw/interrupt-controller";
import { PPU, OAM, PPURegisters } from "./hw/graphics";
import { IMemory } from "./cpu";
import { MBC } from "./cartridge";
import { Joypad } from "./hw/joypad";
import { SystemCounter } from "./hw/system-counter";
import { getMSB } from "./utils";
import { APURegisters } from "./hw/audio/apu-registers";
import { VRAM } from "./hw/graphics/vram";
import { Serial } from "./hw/serial";

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

export class Memory implements IMemory {
  private wram = new Uint8Array(0x2000);
  private hram = new Uint8Array(0x80);
  private bootROMDisabled = false;
  private mbc: MBC | null = null;
  private ppuRegs: PPURegisters;

  public constructor(
    ppu: PPU,
    private interruptController: InterruptController,
    private timer: TimerRegisters,
    private oam: OAM,
    private vram: VRAM,
    private joypad: Joypad,
    private apu: APURegisters,
    private systemCounter: SystemCounter,
    private serial: Serial,
    private bootROM: number[]
  ) {
    this.ppuRegs = new PPURegisters(ppu);
  }

  public setMBC(mbc: MBC) {
    this.mbc = mbc;
  }

  public readDMA(address: number) {
    if (address < this.bootROM.length && !this.bootROMDisabled) {
      return this.bootROM[address];
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
      return this.vram.read(address - 0x8000);
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
      return this.readDMA(address);
    }

    // Object attribute memory (OAM)
    if (address <= 0xfeff) {
      return this.oam.read(address - 0xfe00);
    }

    // I/O Registers
    if (address <= 0xff7f || address === 0xffff) {
      switch (address) {
        // FIXME: dummy values to pass boot_hwio-dmgABCmgb
        case HWRegister.SB:
          return this.serial.getTransferData();
        case HWRegister.SC:
          return this.serial.getTransferControl();

        case HWRegister.JOYP:
          return this.joypad.readRegister();

        case HWRegister.DMA:
          return this.oam.getDMASource();

        case HWRegister.DIV:
          // DIV is the 8 upper bits of the system counter
          return getMSB(this.systemCounter.getValue());

        case HWRegister.TIMA:
          return this.timer.tima;
        case HWRegister.TMA:
          return this.timer.tma;
        case HWRegister.TAC:
          return this.timer.tac;

        case HWRegister.LCDC:
          return this.ppuRegs.lcdc;
        case HWRegister.LY:
          return this.ppuRegs.ly;
        case HWRegister.LYC:
          return this.ppuRegs.lyc;
        case HWRegister.STAT:
          return this.ppuRegs.stat;
        case HWRegister.SCY:
          return this.ppuRegs.scy;
        case HWRegister.SCX:
          return this.ppuRegs.scx;
        case HWRegister.BGP:
          return this.ppuRegs.bgp;
        case HWRegister.WY:
          return this.ppuRegs.wy;
        case HWRegister.WX:
          return this.ppuRegs.wx;
        case HWRegister.OBP0:
          return this.ppuRegs.obp0;
        case HWRegister.OPB1:
          return this.ppuRegs.obp1;

        case HWRegister.IF:
          return this.interruptController.getFlagRegister();
        case HWRegister.IE:
          return this.interruptController.getEnableRegister();

        case HWRegister.NR10:
          // console.log("NR10 = ", this.apu.nr10.toString(16));
          return this.apu.nr10;
        case HWRegister.NR11:
          //console.log("NR11 = ", this.apu.nr11.toString(16));
          return this.apu.nr11;
        case HWRegister.NR12:
          //console.log("NR12 = ", this.apu.nr12.toString(16));
          return this.apu.nr12;
        case HWRegister.NR13:
          // console.log("NR13 = ", this.apu.nr13.toString(16));
          return this.apu.nr13;
        case HWRegister.NR14:
          // console.log("NR14 = ", this.apu.nr14.toString(16));
          return this.apu.nr14;
        case HWRegister.NR21:
          // console.log("NR21 = ", this.apu.nr21.toString(16));
          return this.apu.nr21;
        case HWRegister.NR22:
          // console.log("NR22 = ", this.apu.nr22.toString(16));
          return this.apu.nr22;
        case HWRegister.NR23:
          // console.log("NR23 = ", this.apu.nr23.toString(16));
          return this.apu.nr23;
        case HWRegister.NR24:
          // console.log("NR24 = ", this.apu.nr24.toString(16));
          return this.apu.nr24;
        case HWRegister.NR30:
          //console.log("NR30 = ", this.apu.nr30.toString(16));
          return this.apu.nr30;
        case HWRegister.NR31:
          // console.log("NR31 = ", this.apu.nr31.toString(16));
          return this.apu.nr31;
        case HWRegister.NR32:
          // console.log("NR32 = ", this.apu.nr32.toString(16));
          return this.apu.nr32;
        case HWRegister.NR33:
          //console.log("NR33 = ", this.apu.nr33.toString(16));
          return this.apu.nr33;
        case HWRegister.NR34:
          // console.log("NR34 = ", this.apu.nr34.toString(16));
          return this.apu.nr34;
        case HWRegister.NR41:
          //console.log("NR41 = ", this.apu.nr41.toString(16));
          return this.apu.nr41;
        case HWRegister.NR42:
          //console.log("NR42 = ", this.apu.nr42.toString(16));
          return this.apu.nr42;
        case HWRegister.NR43:
          //console.log("NR43 = ", this.apu.nr43.toString(16));
          return this.apu.nr43;
        case HWRegister.NR44:
          //console.log("NR44 = ", this.apu.nr44.toString(16));
          return this.apu.nr44;
        case HWRegister.NR50:
          //console.log("NR50 = ", this.apu.nr50.toString(16));
          return this.apu.nr50;
        case HWRegister.NR51:
          //console.log("NR51 = ", this.apu.nr51.toString(16));
          return this.apu.nr51;
        case HWRegister.NR52:
          //console.log("NR52 = ", this.apu.nr52.toString(16));
          return this.apu.nr52;

        case 0xff30:
        case 0xff31:
        case 0xff32:
        case 0xff33:
        case 0xff34:
        case 0xff35:
        case 0xff36:
        case 0xff37:
        case 0xff38:
        case 0xff39:
        case 0xff3a:
        case 0xff3b:
        case 0xff3c:
        case 0xff3d:
        case 0xff3e:
        case 0xff3f:
          return this.apu.readWaveRAM(address - 0xff30);

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
      return this.vram.write(address - 0x8000, data);
    }

    if (address <= 0xbfff) {
      // 8 KiB External RAM
      return this.mbc?.writeRAM(address - 0xa000, data);
    }

    // WRAM
    this.wram[(address - 0xc000) & 0x1fff] = data;
  }

  public triggerWrite(address: number) {
    if (address >= 0xfe00 && address <= 0xfeff) {
      // Object attribute memory (OAM)
      return this.oam.triggerWrite();
    }
  }

  public triggerIncrementRead(address: number) {
    if (address >= 0xfe00 && address <= 0xfeff) {
      // Object attribute memory (OAM)
      return this.oam.triggerIncrementRead();
    }
  }

  public write(address: number, data: number) {
    if (address <= 0xfdff) {
      return this.writeDMA(address, data);
    }

    if (address <= 0xfeff) {
      // Object attribute memory (OAM)
      return this.oam.write(address - 0xfe00, data);
    }

    if (address <= 0xff7f || address === 0xffff) {
      // I/O Registers
      switch (address) {
        case HWRegister.JOYP:
          return this.joypad.writeRegister(data);

        case HWRegister.SB:
          this.serial.setTransferData(data);
          break;
        case HWRegister.SC:
          this.serial.setTransferControl(data);
          break;

        case HWRegister.DMA:
          return this.oam.startDMA(data);

        case HWRegister.DIV:
          // Writing any value resets the divider
          this.systemCounter.resetValue();
          break;

        case HWRegister.TIMA:
          this.timer.tima = data;
          break;
        case HWRegister.TMA:
          this.timer.tma = data;
          break;
        case HWRegister.TAC:
          this.timer.tac = data;
          break;

        case HWRegister.LCDC:
          this.ppuRegs.lcdc = data;
          break;
        case HWRegister.LYC:
          this.ppuRegs.lyc = data;
          break;
        case HWRegister.STAT:
          this.ppuRegs.stat = data;
          break;
        case HWRegister.SCY:
          this.ppuRegs.scy = data;
          break;
        case HWRegister.SCX:
          this.ppuRegs.scx = data;
          break;
        case HWRegister.BGP:
          this.ppuRegs.bgp = data;
          break;
        case HWRegister.WY:
          this.ppuRegs.wy = data;
          break;
        case HWRegister.WX:
          this.ppuRegs.wx = data;
          break;
        case HWRegister.OBP0:
          this.ppuRegs.obp0 = data;
          break;
        case HWRegister.OPB1:
          this.ppuRegs.obp1 = data;
          break;

        case HWRegister.IF:
          return this.interruptController.setFlagRegister(data);
        case HWRegister.IE:
          return this.interruptController.setEnableRegister(data);

        case HWRegister.NR10:
          this.apu.nr10 = data;
          break;
        case HWRegister.NR11:
          this.apu.nr11 = data;
          break;
        case HWRegister.NR12:
          this.apu.nr12 = data;
          break;
        case HWRegister.NR13:
          this.apu.nr13 = data;
          break;
        case HWRegister.NR14:
          //console.log("wchn 14", data.toString(16));
          this.apu.nr14 = data;
          break;
        case HWRegister.NR21:
          this.apu.nr21 = data;
          break;
        case HWRegister.NR22:
          this.apu.nr22 = data;
          break;
        case HWRegister.NR23:
          this.apu.nr23 = data;
          break;
        case HWRegister.NR24:
          //console.log("wchn 24", data.toString(16));
          this.apu.nr24 = data;
          break;
        case HWRegister.NR30:
          this.apu.nr30 = data;
          break;
        case HWRegister.NR31:
          this.apu.nr31 = data;
          break;
        case HWRegister.NR32:
          this.apu.nr32 = data;
          break;
        case HWRegister.NR33:
          this.apu.nr33 = data;
          break;
        case HWRegister.NR34:
          //console.log("wchn 34", data.toString(16));
          this.apu.nr34 = data;
          break;
        case HWRegister.NR41:
          this.apu.nr41 = data;
          break;
        case HWRegister.NR42:
          this.apu.nr42 = data;
          break;
        case HWRegister.NR43:
          this.apu.nr43 = data;
          break;
        case HWRegister.NR44:
          //console.log("wchn 44", data.toString(16));
          this.apu.nr44 = data;
          break;
        case HWRegister.NR50:
          this.apu.nr50 = data;
          break;
        case HWRegister.NR51:
          this.apu.nr51 = data;
          break;
        case HWRegister.NR52:
          this.apu.nr52 = data;
          break;

        case 0xff30:
        case 0xff31:
        case 0xff32:
        case 0xff33:
        case 0xff34:
        case 0xff35:
        case 0xff36:
        case 0xff37:
        case 0xff38:
        case 0xff39:
        case 0xff3a:
        case 0xff3b:
        case 0xff3c:
        case 0xff3d:
        case 0xff3e:
        case 0xff3f:
          this.apu.writeWaveRAM(address - 0xff30, data);
          break;

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
