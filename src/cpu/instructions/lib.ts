import { CpuState } from "../cpu-state";
import {
  getLSB,
  getMSB,
  makeWord,
  wrappingDecrementWord,
  wrappingIncrementWord,
} from "../../utils";
import { Flag, RegisterPair } from "../register";

export type OpTable = Partial<
  Record<number, [string, (cpu: CpuState) => void]>
>;

export function makeInstruction<T extends unknown[]>(
  cb: (cpu: CpuState, ...args: T) => void
) {
  return function (cpu: CpuState, ...args: T) {
    cpu.beginNextCycle();
    cb(cpu, ...args);
    cpu.fetchNextOpcode();
  };
}

export function makeInstructionWithImmediateByte<T extends unknown[]>(
  cb: (cpu: CpuState, byte: number, ...args: T) => void
) {
  return (cpu: CpuState, ...args: T) => {
    cpu.beginNextCycle();
    cb(cpu, cpu.fetchImmediateByte(), ...args);
    cpu.fetchNextOpcode();
  };
}

export function makeInstructionWithImmediateWord<T extends unknown[]>(
  cb: (cpu: CpuState, word: number, ...args: T) => void
) {
  return (cpu: CpuState, ...args: T) => {
    cpu.beginNextCycle();
    cb(cpu, cpu.fetchImmediateWord(), ...args);
    cpu.fetchNextOpcode();
  };
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
const BYTE_SIGN_MASK = 0b10000000;

export function addBytes(a: number, b: number, carryFlag = false) {
  const c = carryFlag ? 1 : 0;

  return {
    carryFrom3: (a & NIBBLE_MASK) + (b & NIBBLE_MASK) + c > NIBBLE_MASK,
    carryFrom7: (a & BYTE_MASK) + (b & BYTE_MASK) + c > BYTE_MASK,
    result: (a + b + c) & BYTE_MASK,
  };
}

export function isNegative(a: number) {
  return (a & BYTE_SIGN_MASK) !== 0;
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

export function checkCondition(cpu: CpuState, condition: Condition) {
  switch (condition) {
    case Condition.Z:
      return cpu.getFlag(Flag.Z);
    case Condition.C:
      return cpu.getFlag(Flag.CY);
    case Condition.NZ:
      return !cpu.getFlag(Flag.Z);
    case Condition.NC:
      return !cpu.getFlag(Flag.CY);
  }
}

export function pushWord(cpu: CpuState, data: number) {
  let address = cpu.readRegisterPair(RegisterPair.SP);
  address = wrappingDecrementWord(address);

  cpu.beginNextCycle();

  cpu.writeMemory(address, getMSB(data));
  address = wrappingDecrementWord(address);

  cpu.beginNextCycle();

  cpu.writeMemory(address, getLSB(data));
  cpu.writeRegisterPair(RegisterPair.SP, address);
}

export function popWord(cpu: CpuState) {
  let address = cpu.readRegisterPair(RegisterPair.SP);

  const lsb = cpu.readMemory(address);
  address = wrappingIncrementWord(address);

  cpu.writeRegisterPair(RegisterPair.SP, address);

  cpu.beginNextCycle();

  const msb = cpu.readMemory(address);
  address = wrappingIncrementWord(address);

  cpu.writeRegisterPair(RegisterPair.SP, address);

  cpu.beginNextCycle();

  return makeWord(msb, lsb);
}
