import { MBC } from "./mbc";

export class NoMBC implements MBC {
  constructor(private rom: Uint8Array) {}

  public readROM(offset: number) {
    if (offset < this.rom.length) {
      return this.rom[offset];
    } else {
      return 0xff;
    }
  }

  public writeROM() {}

  public readRAM() {
    return 0xff;
  }

  public writeRAM() {}
}
