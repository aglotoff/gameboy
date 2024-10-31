import { CpuState } from "../cpu-state";
import {
  getLSB,
  getMSB,
  makeWord,
  wrapDecrementWord,
  wrapIncrementWord,
} from "../../utils";
import { Flag, RegisterPair } from "../register";

export type OpTable = Partial<
  Record<number, [string, (this: CpuState) => void]>
>;

export function instruction<T extends unknown[]>(
  cb: (this: CpuState, ...args: T) => void
) {
  return function (this: CpuState, ...args: T) {
    this.cycle();
    cb.call(this, ...args);
    this.fetchNextOpcode();
  };
}

export function instructionWithImmediateByte<T extends unknown[]>(
  cb: (this: CpuState, byte: number, ...args: T) => void
) {
  return function (this: CpuState, ...args: T) {
    this.cycle();
    cb.call(this, this.fetchImmediateByte(), ...args);
    this.fetchNextOpcode();
  };
}

export function instructionWithImmediateWord<T extends unknown[]>(
  cb: (this: CpuState, word: number, ...args: T) => void
) {
  return function (this: CpuState, ...args: T) {
    this.cycle();
    cb.call(this, fetchImmediateWord(this), ...args);
    this.fetchNextOpcode();
  };
}

function fetchImmediateWord(state: CpuState) {
  let lowByte = state.fetchImmediateByte();
  let highByte = state.fetchImmediateByte();
  return makeWord(highByte, lowByte);
}

export function bindInstructionArgs<T extends unknown[]>(
  instruction: (this: CpuState, ...args: T) => void,
  ...args: T
) {
  return function (this: CpuState) {
    instruction.call(this, ...args);
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

export enum Condition {
  Z,
  C,
  NZ,
  NC,
}

export function checkCondition(state: CpuState, condition: Condition) {
  switch (condition) {
    case Condition.Z:
      return state.isFlagSet(Flag.Z);
    case Condition.C:
      return state.isFlagSet(Flag.CY);
    case Condition.NZ:
      return !state.isFlagSet(Flag.Z);
    case Condition.NC:
      return !state.isFlagSet(Flag.CY);
  }
}

export function pushWord(state: CpuState, data: number) {
  let sp = state.readRegisterPair(RegisterPair.SP);

  sp = wrapDecrementWord(sp);
  state.cycle();

  state.writeBus(sp, getMSB(data));
  sp = wrapDecrementWord(sp);
  state.cycle();

  state.writeBus(sp, getLSB(data));
  state.writeRegisterPair(RegisterPair.SP, sp);
  state.cycle();
}

export function popWord(state: CpuState) {
  let sp = state.readRegisterPair(RegisterPair.SP);

  const lsb = state.readBus(sp);
  sp = wrapIncrementWord(sp);
  state.writeRegisterPair(RegisterPair.SP, sp);
  state.cycle();

  const msb = state.readBus(sp);
  sp = wrapIncrementWord(sp);
  state.writeRegisterPair(RegisterPair.SP, sp);
  state.cycle();

  return makeWord(msb, lsb);
}
