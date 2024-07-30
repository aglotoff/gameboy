const ram = new Uint8Array(0x10000);

export const read = (address: number) => {
  if (address >= 0x8000) throw new Error("Not implemented");
  return ram[address];
};

export const write = (address: number, data: number) => {
  if (address >= 0x8000) throw new Error("Not implemented");
  ram[address] = data;
};
