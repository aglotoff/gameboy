export interface MBC {
  readROM(offset: number): number;
  writeROM(offset: number, value: number): void;
  readRAM(offset: number): number;
  writeRAM(offset: number, value: number): void;
}
