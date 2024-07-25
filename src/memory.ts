const ram = new Uint8Array(0x10000);

export const read = (address: number) => ram[address];

export const write = (address: number, data: number) => {
  ram[address] = data;
};
