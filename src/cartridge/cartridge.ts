import { MBC } from "./mbc";
import { MBC1 } from "./mbc1";
import { MBC5 } from "./mbc5";
import { NoMBC } from "./no-mbc";

const LOGO_BASE = 0x0104;
const LOGO_END = 0x0134;
const TYPE = 0x0147;
const ROM_SIZE = 0x0148;
const RAM_SIZE = 0x0149;

export function createMBC(
  type: number,
  rom: Uint8Array,
  romSize: number,
  ramSize: number
): MBC {
  switch (type) {
    case 0x0:
      return new NoMBC(rom);
    case 0x1:
    case 0x2:
    case 0x3:
      return new MBC1(rom, romSize, ramSize);
    case 0x19:
    case 0x1a:
    case 0x1b:
    case 0x1c:
    case 0x1d:
    case 0x1e:
      return new MBC5(rom, romSize, ramSize);
    default:
      throw new Error("Unsupported type " + type.toString(16));
  }
}

export class Cartridge {
  private rom: Uint8Array;
  private mbc: MBC;
  private romSize: number;
  private ramSize: number;

  public constructor(buffer: ArrayBuffer) {
    this.rom = new Uint8Array(buffer);

    this.romSize = this.calculateROMSize(this.rom[ROM_SIZE]);
    this.ramSize = this.calculateRAMSize(this.rom[RAM_SIZE]);

    this.mbc = createMBC(this.rom[TYPE], this.rom, this.romSize, this.ramSize);
  }

  public getROMSize() {
    return this.romSize;
  }

  public getRAMSize() {
    return this.ramSize;
  }

  private calculateROMSize(value: number) {
    return 32 * 1024 * (1 << value);
  }

  private calculateRAMSize(value: number) {
    switch (value) {
      case 2:
        return 8 * 1024;
      case 3:
        return 32 * 1024;
      case 4:
        return 128 * 1024;
      case 5:
        return 64 * 1024;
      default:
        return 0;
    }
  }

  public getLogo() {
    return this.rom.slice(LOGO_BASE, LOGO_END);
  }

  public getTitle() {
    return String.fromCharCode(...this.rom.slice(0x0134, 0x143));
  }

  public getType() {
    return this.rom[TYPE];
  }

  public getMBC() {
    return this.mbc;
  }
}
