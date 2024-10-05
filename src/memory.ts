let vbank = 0;

let buf = "";

export class Memory {
  private ram = new Uint8Array(0x10000);

  public reset() {
    this.ram = new Uint8Array(0x10000);
  }

  public read(address: number) {
    if (address === 0xff44) {
      let r = vbank;
      vbank = (vbank + 1) % 154;
      return r;
    }

    return this.ram[address];
  }

  public write(address: number, data: number) {
    if (address === 0xff01) {
      if (data == 10) {
        console.log(buf);
        buf = "";
      }
      buf += String.fromCharCode(data);
    }

    this.ram[address] = data;
  }
}

export const memory = new Memory();
