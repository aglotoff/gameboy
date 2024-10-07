const BYTE_SHIFT = 8;
const BYTE_MIN = 0x00;
const BYTE_MAX = 0xff;
const BYTE_SIGN_MASK = 0x80;

const WORD_MIN = 0x0000;
const WORD_MAX = 0xffff;

const NIBBLE_MAX = 0xf;

export function getMSB(value: number) {
  return (value >> BYTE_SHIFT) & BYTE_MAX;
}

export function getLSB(value: number) {
  return value & BYTE_MAX;
}

export function makeWord(highByte: number, lowByte: number) {
  return (highByte << BYTE_SHIFT) | lowByte;
}

export function addBytes(a: number, b: number, carryFlag = false) {
  const c = carryFlag ? 1 : 0;

  return {
    carryFrom3: (a & NIBBLE_MAX) + (b & NIBBLE_MAX) + c > NIBBLE_MAX,
    carryFrom7: (a & BYTE_MAX) + (b & BYTE_MAX) + c > BYTE_MAX,
    result: (a + b + c) & BYTE_MAX,
  };
}

export function addSignedByteToWord(a: number, b: number) {
  const { result: lsb, carryFrom3, carryFrom7 } = addBytes(getLSB(a), b);

  const isNegative = b & BYTE_SIGN_MASK;
  const adj = isNegative ? BYTE_MAX : BYTE_MIN;
  const msb = (getMSB(a) + adj + +carryFrom7) & BYTE_MAX;

  return {
    carryFrom3,
    carryFrom7,
    result: makeWord(msb, lsb),
  };
}

export function addWords(a: number, b: number) {
  const { result: lsb, carryFrom7 } = addBytes(getLSB(a), getLSB(b));

  const {
    result: msb,
    carryFrom3: carryFrom11,
    carryFrom7: carryFrom15,
  } = addBytes(getMSB(a), getMSB(b), carryFrom7);

  return {
    result: makeWord(msb, lsb),
    carryFrom11,
    carryFrom15,
  };
}

export function subtractBytes(a: number, b: number, carryFlag = false) {
  const c = carryFlag ? 1 : 0;

  return {
    borrowTo3: (a & NIBBLE_MAX) < (b & NIBBLE_MAX) + c,
    borrowTo7: (a & BYTE_MAX) < (b & BYTE_MAX) + c,
    result: (a - b - c) & BYTE_MAX,
  };
}

export function wrapIncrementWord(value: number) {
  return value == WORD_MAX ? WORD_MIN : value + 1;
}

export function wrapDecrementWord(value: number) {
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
