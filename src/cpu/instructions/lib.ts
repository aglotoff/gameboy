import { CpuState } from "../cpu-state";
import { getLSB, getMSB, makeWord } from "../../utils";

export type OpTable = Partial<
  Record<number, [string, (this: CpuState) => void]>
>;

export function instruction<T extends unknown[]>(
  cb: (this: CpuState, ...args: T) => void
) {
  return function (this: CpuState, ...args: T) {
    cb.call(this, ...args);

    this.fetchNextOpcode();

    if (this.stepsToIME > 0) {
      this.stepsToIME -= 1;
      if (this.stepsToIME === 0) {
        this.setIME(true);
      }
    }
  };
}

export function instructionWithImmediateByte<T extends unknown[]>(
  cb: (this: CpuState, byte: number, ...args: T) => void
) {
  return function (this: CpuState, ...args: T) {
    cb.call(this, this.fetchImmediateByte(), ...args);

    this.fetchNextOpcode();

    if (this.stepsToIME > 0) {
      this.stepsToIME -= 1;
      if (this.stepsToIME === 0) {
        this.setIME(true);
      }
    }
  };
}

export function instructionWithImmediateWord<T extends unknown[]>(
  cb: (this: CpuState, word: number, ...args: T) => void
) {
  return function (this: CpuState, ...args: T) {
    cb.call(this, this.fetchImmediateWord(), ...args);

    this.fetchNextOpcode();

    if (this.stepsToIME > 0) {
      this.stepsToIME -= 1;
      if (this.stepsToIME === 0) {
        this.setIME(true);
      }
    }
  };
}

export function bindArgs<T extends unknown[]>(
  f: (this: CpuState, ...args: T) => void,
  ...args: T
) {
  return function (this: CpuState) {
    f.call(this, ...args);
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
