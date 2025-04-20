import { CpuState } from "../cpu-state";
import {
  getLSB,
  getMSB,
  makeWord,
  testBit,
  wrappingDecrementWord,
  wrappingIncrementWord,
} from "../../utils";
import { Flag, RegisterPair } from "../register";

export type OpTable = Partial<
  Record<number, [string, (cpu: CpuState) => void]>
>;

export function instruction<T extends unknown[]>(
  cb: (cpu: CpuState, ...args: T) => void
) {
  return function (cpu: CpuState, ...args: T) {
    cpu.beginNextCycle();
    cb(cpu, ...args);
    cpu.fetchNextOpcode();
  };
}

export function instructionWithImmediateByte<T extends unknown[]>(
  cb: (cpu: CpuState, byte: number, ...args: T) => void
) {
  return (cpu: CpuState, ...args: T) => {
    cpu.beginNextCycle();
    cb(cpu, cpu.fetchImmediateByte(), ...args);
    cpu.fetchNextOpcode();
  };
}

export function instructionWithImmediateWord<T extends unknown[]>(
  cb: (cpu: CpuState, word: number, ...args: T) => void
) {
  return (cpu: CpuState, ...args: T) => {
    cpu.beginNextCycle();
    cb(cpu, fetchImmediateWord(cpu), ...args);
    cpu.fetchNextOpcode();
  };
}

function fetchImmediateWord(state: CpuState) {
  let lowByte = state.fetchImmediateByte();
  let highByte = state.fetchImmediateByte();
  return makeWord(highByte, lowByte);
}

export function bindInstructionArgs<T extends unknown[]>(
  instruction: (cpu: CpuState, ...args: T) => void,
  ...args: T
) {
  return (cpu: CpuState) => {
    instruction(cpu, ...args);
  };
}

const BYTE_MASK = 0xff;
const NIBBLE_MASK = 0xf;

export function addBytes(a: number, b: number, carryFlag = false) {
  const c = carryFlag ? 1 : 0;

  return {
    carryFrom3: (a & NIBBLE_MASK) + (b & NIBBLE_MASK) + c > NIBBLE_MASK,
    carryFrom7: (a & BYTE_MASK) + (b & BYTE_MASK) + c > BYTE_MASK,
    result: (a + b + c) & BYTE_MASK,
  };
}

export function isNegative(a: number) {
  return testBit(a, 7);
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
      return state.getFlag(Flag.Z);
    case Condition.C:
      return state.getFlag(Flag.CY);
    case Condition.NZ:
      return !state.getFlag(Flag.Z);
    case Condition.NC:
      return !state.getFlag(Flag.CY);
  }
}

export function pushWord(state: CpuState, data: number) {
  let sp = state.getRegisterPair(RegisterPair.SP);
  sp = wrappingDecrementWord(sp);

  state.beginNextCycle();

  state.writeBus(sp, getMSB(data));
  sp = wrappingDecrementWord(sp);

  state.beginNextCycle();

  state.writeBus(sp, getLSB(data));
  state.setRegisterPair(RegisterPair.SP, sp);
}

export function popWord(state: CpuState) {
  let sp = state.getRegisterPair(RegisterPair.SP);

  const lsb = state.readBus(sp);
  sp = wrappingIncrementWord(sp);

  state.setRegisterPair(RegisterPair.SP, sp);

  state.beginNextCycle();

  const msb = state.readBus(sp);
  sp = wrappingIncrementWord(sp);

  state.setRegisterPair(RegisterPair.SP, sp);

  state.beginNextCycle();

  return makeWord(msb, lsb);
}
