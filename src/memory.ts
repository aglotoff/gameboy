export class Memory {
  private ram = new Uint8Array(0x10000);

  public reset() {
    this.ram = new Uint8Array(0x10000);
  }

  public read(address: number) {
    return this.ram[address];
  }

  public write(address: number, data: number) {
    this.ram[address] = data;
  }
}

export const memory = new Memory();
