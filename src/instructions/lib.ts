import { CpuState } from "../cpu-state";

export type OpTable = Partial<
  Record<number, [string, (this: CpuState) => number]>
>;

export function instruction<T extends unknown[]>(
  cb: (this: CpuState, ...args: T) => number
) {
  return cb;
}

export function instructionWithImmediateByte<T extends unknown[]>(
  cb: (this: CpuState, byte: number, ...args: T) => number
) {
  return function (this: CpuState, ...args: T) {
    return cb.call(this, this.fetchImmediateByte(), ...args);
  };
}

export function instructionWithImmediateWord<T extends unknown[]>(
  cb: (this: CpuState, word: number, ...args: T) => number
) {
  return function (this: CpuState, ...args: T) {
    return cb.call(this, this.fetchImmediateWord(), ...args);
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
