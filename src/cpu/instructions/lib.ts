import { CpuState } from "../cpu-state";
import { getLSB, getMSB, makeWord } from "../../utils";

export type OpTable = Partial<
  Record<number, [string, (this: CpuState) => number]>
>;

export function instruction<T extends unknown[]>(
  cb: (this: CpuState, ...args: T) => number
) {
  return function (this: CpuState, ...args: T) {
    const cycles = cb.call(this, ...args);

    for (let i = 0; i < cycles / 4 + 1; i++) {
      this.cycle();
    }

    return cycles + 4;
  };
}

export function instructionWithImmediateByte<T extends unknown[]>(
  cb: (this: CpuState, byte: number, ...args: T) => number
) {
  return function (this: CpuState, ...args: T) {
    const cycles = cb.call(this, this.fetchImmediateByte(), ...args);

    for (let i = 0; i < cycles / 4 + 2; i++) {
      this.cycle();
    }

    return cycles + 8;
  };
}

export function instructionWithImmediateWord<T extends unknown[]>(
  cb: (this: CpuState, word: number, ...args: T) => number
) {
  return function (this: CpuState, ...args: T) {
    const cycles = cb.call(this, this.fetchImmediateWord(), ...args);

    for (let i = 0; i < cycles / 4 + 3; i++) {
      this.cycle();
    }

    return cycles + 12;
  };
}

export function bindArgs<T extends unknown[]>(
  f: (this: CpuState, ...args: T) => number,
  ...args: T
) {
  return function (this: CpuState) {
    return f.call(this, ...args);
  };
}

const BYTE_MASK = 0xff;
const BYTE_SIGN_MASK = 0x80;
const NIBBLE_MASK = 0xf;

export function addBytes(a: number, b: number, carryFlag = false) {
  const c = carryFlag ? 1 : 0;

  return {
    carryFrom3: (a & NIBBLE_MASK) + (b & NIBBLE_MASK) + c > NIBBLE_MASK,
    carryFrom7: (a & BYTE_MASK) + (b & BYTE_MASK) + c > BYTE_MASK,
    result: (a + b + c) & BYTE_MASK,
  };
}

export function addSignedByteToWord(a: number, b: number) {
  const { result: lsb, carryFrom3, carryFrom7 } = addBytes(getLSB(a), b);

  const isNegative = b & BYTE_SIGN_MASK;
  const adj = isNegative ? BYTE_MASK : 0;
  const msb = (getMSB(a) + adj + +carryFrom7) & BYTE_MASK;

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
    borrowTo3: (a & NIBBLE_MASK) < (b & NIBBLE_MASK) + c,
    borrowTo7: (a & BYTE_MASK) < (b & BYTE_MASK) + c,
    result: (a - b - c) & BYTE_MASK,
  };
}
