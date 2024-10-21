import { MBC } from "./mbc";

export class MBC1 implements MBC {
  private romBankNumber = 1;
  private ramBankNumber = 0;
  private bankingMode = 0;
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
    if (this.bankingMode) {
      const bankNo = (this.ramBankNumber * 32) % this.maxROMBanks;
      return this.rom[bankNo * 0x4000 + offset];
    }

    return this.rom[offset];
  }

  private readROMSecondBank(offset: number) {
    const bankNo =
      (this.ramBankNumber * 32 + this.romBankNumber) % this.maxROMBanks;
    return this.rom[bankNo * 0x4000 + offset];
  }

  public writeROM(offset: number, data: number) {
    if (offset <= 0x1fff) {
      this.setRAMEnable(data);
    } else if (offset <= 0x3fff) {
      this.setROMBankNumber(data);
    } else if (offset <= 0x5fff) {
      this.setRAMBankNumber(data);
    } else if (offset <= 0x7fff) {
      this.setBankingMode(data);
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

  private setROMBankNumber(value: number) {
    //console.log("Set bank number", data.toString(16));
    this.romBankNumber = value & 0x1f ? value & 0x1f : 0x1;
  }

  private setRAMBankNumber(value: number) {
    //console.log("Set bank 2 numberrrrrr", data.toString(16));
    this.ramBankNumber = value & 0x3;
  }

  private setBankingMode(value: number) {
    //console.log("Banking mode", data.toString(16));
    this.bankingMode = value & 0x1;
  }

  public readRAM(offset: number) {
    if (!this.ramEnabled || !this.ram) {
      return 0xff;
    }

    if (this.bankingMode) {
      const bankNo = this.ramBankNumber % this.maxRAMBanks;
      return this.ram[bankNo * 0x2000 + offset];
    }

    return this.ram[offset];
  }

  public writeRAM(offset: number, data: number) {
    if (!this.ramEnabled || !this.ram) {
      return;
    }

    if (this.bankingMode) {
      const bankNo = this.ramBankNumber % this.maxRAMBanks;
      this.ram[bankNo * 0x2000 + offset] = data;
      return;
    }

    this.ram[offset] = data;
  }
}
