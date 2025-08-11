const enum Byte {
  SHIFT = 8,
  MIN = 0x00,
  MAX = 0xff,
}

const enum Word {
  MIN = 0x0000,
  MAX = 0xffff,
}

export function getMSB(value: number) {
  return (value >> Byte.SHIFT) & Byte.MAX;
}

export function getLSB(value: number) {
  return value & Byte.MAX;
}

export function makeWord(highByte: number, lowByte: number) {
  return (highByte << Byte.SHIFT) | lowByte;
}

export function wrappingIncrementByte(value: number) {
  return value == Byte.MAX ? Byte.MIN : value + 1;
}

export function wrappingDecrementByte(value: number) {
  return value == Byte.MIN ? Byte.MAX : value - 1;
}

export function wrappingIncrementWord(value: number) {
  return value == Word.MAX ? Word.MIN : value + 1;
}

export function wrappingDecrementWord(value: number) {
  return value == Word.MIN ? Word.MAX : value - 1;
}

export function testBit(value: number, bit: number) {
  return (value & (1 << bit)) !== 0;
}

export function resetBit(value: number, bit: number) {
  return value & ~(1 << bit);
}

export function setBit(value: number, bit: number) {
  return value | (1 << bit);
}

export const enum Mask {
  Word = 0b11111111_11111111,
  Byte = 0b11111111,
  Nibble = 0b00001111,

  MSB = 0b10000000,
  LSB = 0b00000001,
}
