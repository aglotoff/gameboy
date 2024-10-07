import { CpuState, fetchImmediateByte, fetchImmediateWord } from "../cpu-state";

export type OpTable = Partial<
  Record<number, [string, (state: CpuState) => number]>
>;

export function instruction<T extends unknown[]>(
  cb: (state: CpuState, ...args: T) => number
) {
  return cb;
}

export function instructionWithImmediateByte<T extends unknown[]>(
  cb: (state: CpuState, byte: number, ...args: T) => number
) {
  return (state: CpuState, ...args: T) =>
    cb(state, fetchImmediateByte(state), ...args);
}

export function instructionWithImmediateWord<T extends unknown[]>(
  cb: (state: CpuState, word: number, ...args: T) => number
) {
  return (state: CpuState, ...args: T) =>
    cb(state, fetchImmediateWord(state), ...args);
}
