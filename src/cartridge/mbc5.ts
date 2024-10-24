import { MBC } from "./mbc";

export class MBC5 implements MBC {
  private romBankNumber = 1;
  private ramBankNumber = 0;
  private maxROMBanks = 0;

  private ram: Uint8Array | null = null;
  private ramEnabled = false;
  private maxRAMBanks = 0;

  constructor(private rom: Uint8Array, romSize: number, ramSize: number) {
    this.maxROMBanks = Math.floor(romSize / 0x4000);

    if (ramSize !== 0) {
      this.ram = new Uint8Array(ramSize);
      this.maxRAMBanks = Math.floor(ramSize / 0x2000);
    }
  }

  public readROM(offset: number) {
    if (offset <= 0x3fff) {
      return this.readROMFirstBank(offset);
    } else if (offset <= 0x7fff) {
      return this.readROMSecondBank(offset - 0x4000);
    } else {
      return 0xff;
    }
  }

  private readROMFirstBank(offset: number) {
    return this.rom[offset];
  }

  private readROMSecondBank(offset: number) {
    const bankNo = this.romBankNumber % this.maxROMBanks;
    return this.rom[bankNo * 0x4000 + offset];
  }

  public writeROM(offset: number, data: number) {
    if (offset <= 0x1fff) {
      this.setRAMEnable(data);
    } else if (offset <= 0x2fff) {
      this.setROMBankNumberLow(data);
    } else if (offset <= 0x3fff) {
      this.setROMBankNumberHigh(data);
    } else if (offset <= 0x5fff) {
      this.setRAMBankNumber(data);
    }
  }

  private setRAMEnable(value: number) {
    if ((value & 0xf) === 0xa) {
      //console.log("Enable RAM", data.toString(16));
      this.ramEnabled = true;
    } else {
      //console.log("Disable RAM", data.toString(16));
      this.ramEnabled = false;
    }
  }

  private setROMBankNumberLow(value: number) {
    //console.log("Set bank number", data.toString(16));
    this.romBankNumber = (this.romBankNumber & 0x100) | (value & 0xff);
  }

  private setROMBankNumberHigh(value: number) {
    //console.log("Set bank number", data.toString(16));
    this.romBankNumber = (this.romBankNumber & 0xff) | ((value & 0x1) << 8);
  }

  private setRAMBankNumber(value: number) {
    //console.log("Set bank 2 numberrrrrr", data.toString(16));
    this.ramBankNumber = value & 0x3;
  }

  public readRAM(offset: number) {
    if (!this.ramEnabled || !this.ram) {
      return 0xff;
    }

    const bankNo = this.ramBankNumber % this.maxRAMBanks;
    return this.ram[bankNo * 0x2000 + offset];
  }

  public writeRAM(offset: number, data: number) {
    if (!this.ramEnabled || !this.ram) {
      return;
    }

    const bankNo = this.ramBankNumber % this.maxRAMBanks;
    this.ram[bankNo * 0x2000 + offset] = data;
  }
}
