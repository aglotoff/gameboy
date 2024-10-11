import { Timer } from "./timer";
import { InterruptController } from "./interrupt-controller";
import { LCD } from "./lcd";
import { makeWord } from "./utils";

let buf = "";

export interface IMemory {
  read(address: number): number;
  write(address: number, data: number): void;
}

export enum HWRegister {
  JOYP = 0xff00,
  DIV = 0xff04,
  TIMA = 0xff05,
  TMA = 0xff06,
  TAC = 0xff07,
  IF = 0xff0f,
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
  IE = 0xffff,
  KEY1 = 0xff4d,
}

export class Memory implements IMemory {
  private dmaInProgress = false;
  private ticksToDMA = 0;
  private dmaSource = 0;
  private wram = new Uint8Array(0x10000);

  private startDMA(source: number) {
    this.dmaInProgress = true;
    this.dmaSource = source;
    this.ticksToDMA = 160 * 4;
  }

  public tick() {
    if (!this.dmaInProgress) {
      return;
    }

    if (this.ticksToDMA > 0) {
      this.ticksToDMA -= 1;
      return;
    }

    this.dmaInProgress = false;

    for (let i = 0; i < 160; i++) {
      const sourceAddress = makeWord(this.dmaSource, i);
      this.lcd.writeOAM(i, this.read(sourceAddress));
    }
  }

  public constructor(
    private lcd: LCD,
    private interruptController: InterruptController,
    private timer: Timer,
    private cartridge: Uint8Array
  ) {}

  private ramEnabled = false;
  private romBankNumber = 1;

  private externalRAM = new Uint8Array(0x2000);

  public read(address: number) {
    if (address >= 0x8000 && address <= 0x9fff) {
      return this.lcd.readVRAM(address - 0x8000);
    }

    if (address >= 0xfe00 && address <= 0xfe9f) {
      if (this.dmaInProgress) {
        return 0xff;
      }
      return this.lcd.readOAM(address - 0xfe00);
    }

    if (address <= 0x3fff) {
      return this.cartridge[address];
    }

    if (address <= 0x7fff) {
      console.log(
        "Reading",
        (address + (this.romBankNumber - 1) * 0x4000).toString(16),
        this.cartridge.length.toString(16),
        this.cartridge[address + (this.romBankNumber - 1) * 0x4000]
      );
      return this.cartridge[address + (this.romBankNumber - 1) * 0x4000];
    }

    if (address >= 0xc000 && address <= 0xdfff) {
      return this.wram[address];
    } else if (address >= 0xff80 && address <= 0xfffe) {
      return this.wram[address];
    }

    if ((address >= 0xff00 && address <= 0xff80) || address == 0xffff) {
      switch (address) {
        case HWRegister.DMA:
          return this.dmaSource;
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
        case HWRegister.IF:
          return this.interruptController.getFlagRegister();
        case HWRegister.IE:
          return this.interruptController.getEnableRegister();
        case HWRegister.KEY1:
          console.log("TODO: read KEY1");
          return 0xff;
        default:
          console.log("Reading " + address.toString(16));
          // throw new Error("Reading " + address.toString(16));
          return 0xff;
      }
    }

    throw new Error("Reading! " + address.toString(16));
  }

  public write(address: number, data: number) {
    if (address <= 0x1fff) {
      if ((data & 0xf) === 0xa) {
        console.log("Enable RAM", data.toString(16));
        this.ramEnabled = true;
      } else {
        console.log("Disable RAM", data.toString(16));
        this.ramEnabled = false;
      }
    } else if (address <= 0x3fff) {
      console.log("Set bank number", data.toString(16));

      this.romBankNumber = data ? data & 0x1f : 0x1;
    } else if (address <= 0x7fff) {
      console.log(
        "Writing cartridge data",
        address.toString(16),
        data.toString(16)
      );
      //this.cartridge[address + this.romBankNumber * 0x4000] = data;
    } else if (address >= 0x8000 && address <= 0x9fff) {
      this.lcd.writeVRAM(address - 0x8000, data);
    } else if (address >= 0xc000 && address <= 0xdfff) {
      this.wram[address] = data;
    } else if (address >= 0xff80 && address <= 0xfffe) {
      this.wram[address] = data;
    } else if (address >= 0xfe00 && address <= 0xfe9f) {
      if (!this.dmaInProgress) {
        this.lcd.writeOAM(address - 0xfe00, data);
      }
    } else if ((address >= 0xff00 && address <= 0xff80) || address == 0xffff) {
      switch (address) {
        case 0xff01:
          if (data == 10) {
            if (buf.length > 0) {
              console.log(buf);
            }
            buf = "";
          } else {
            buf += String.fromCharCode(data);
          }
          break;
        case 0xff02:
          console.log("TODO: SC");
          break;
        case HWRegister.DMA:
          this.startDMA(data);
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
        case HWRegister.NR50:
          console.log("TODO: NR50");
          break;
        case HWRegister.NR51:
          console.log("TODO: NR51");
          break;
        case HWRegister.NR52:
          console.log("TODO: NR52");
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
        case HWRegister.IF:
          this.interruptController.setFlagRegister(data);
          break;
        case HWRegister.IE:
          this.interruptController.setEnableRegister(data);
          break;
        default:
          console.log("Writing " + address.toString(16));
          // throw new Error();
          break;
      }
    } else {
      throw new Error("Writing " + address.toString(16));
    }
  }
}
