const BYTE_SHIFT = 8;
const BYTE_MIN = 0x00;
const BYTE_MAX = 0xff;

const WORD_MIN = 0x0000;
const WORD_MAX = 0xffff;

export function getMSB(value: number) {
  return (value >> BYTE_SHIFT) & BYTE_MAX;
}

export function getLSB(value: number) {
  return value & BYTE_MAX;
}

export function makeWord(highByte: number, lowByte: number) {
  return (highByte << BYTE_SHIFT) | lowByte;
}

export function wrappingIncrementByte(value: number) {
  return value == BYTE_MAX ? BYTE_MIN : value + 1;
}

export function wrappingIncrementWord(value: number) {
  return value == WORD_MAX ? WORD_MIN : value + 1;
}

export function wrappingDecrementWord(value: number) {
  return value == WORD_MIN ? WORD_MAX : value - 1;
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
