const LOGO_BASE = 0x0104;
const LOGO_END = 0x0134;
const TYPE = 0x0147;
const ROM_SIZE = 0x0148;

export class Cartridge {
  private rom: Uint8Array;
  private romBankNumber = 1;
  private ramBankNumber = 0;
  private bankingMode = 1;

  private ram = new Uint8Array(0x8000);

  public constructor(buffer: ArrayBuffer) {
    this.rom = new Uint8Array(buffer);

    const romSize = 32 * 1024 * (1 << this.rom[ROM_SIZE]);
    if (romSize !== this.rom.length) {
      throw new Error("Bad ROM size");
    }
  }

  public getROMSize() {
    return this.rom.length;
  }

  public readROM(address: number) {
    if (address <= 0x3fff) {
      if (this.bankingMode) {
        const i = this.ramBankNumber * 0x4000 + address;
        if (i >= this.rom.length) {
          throw new Error("AAAAAA");
        }
        return this.rom[i];
      } else {
        return this.rom[address];
      }
    } else if (address <= 0x7fff) {
      const bankNumber = (this.ramBankNumber << 5) | this.romBankNumber;
      return this.rom[(bankNumber - 1) * 0x4000 + address];
    }

    console.log(
      "Reading",
      (address + (this.romBankNumber - 1) * 0x4000).toString(16),
      this.rom[address + (this.romBankNumber - 1) * 0x4000]
    );

    return 0xff;
  }

  public readRAM(offset: number) {
    if (this.bankingMode) {
      return this.ram[this.ramBankNumber * 0x4000 + offset];
    }
    return this.ram[offset];
  }

  public writeRAM(offset: number, data: number) {
    if (this.bankingMode) {
      this.ram[this.ramBankNumber * 0x4000 + offset] = data;
    } else {
      this.ram[offset] = data;
    }
  }

  public writeROM(address: number, data: number) {
    if (address <= 0x1fff) {
      if ((data & 0xf) === 0xa) {
        //console.log("Enable RAM", data.toString(16));
        //this.ramEnabled = true;
      } else {
        //console.log("Disable RAM", data.toString(16));
        //this.ramEnabled = false;
      }
    } else if (address <= 0x3fff) {
      //console.log("Set bank number", data.toString(16));

      this.romBankNumber = data ? data & 0x1f : 0x1;
    } else if (address <= 0x5fff) {
      //console.log("Set bank numberrrrrr", data.toString(16));

      this.ramBankNumber = data & 0x3;
    } else if (address <= 0x7fff) {
      //console.log("Banking mode", data.toString(16));
      this.bankingMode = data & 0x1;
      // console.log(
      //   "Writing cartridge data",
      //   address.toString(16),
      //   data.toString(16)
      // );
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
}
