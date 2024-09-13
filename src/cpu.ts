import * as Memory from "./memory";

export type Register8 = "A" | "F" | "B" | "C" | "D" | "E" | "H" | "L";
export type Register16 = "PC" | "SP";
export type Register = Register8 | Register16;
export type RegisterPair = "AF" | "BC" | "DE" | "HL";
export type Flag = "Z" | "N" | "H" | "CY";
export type Condition = "Z" | "C" | "NZ" | "NC";

const registers = {
  a: 0,
  f: 0,
  b: 0,
  c: 0,
  d: 0,
  e: 0,
  h: 0,
  l: 0,
  sp: 0,
  pc: 0,
};

export const resetRegisters = () => {
  registers.a = 0;
  registers.f = 0;
  registers.b = 0;
  registers.c = 0;
  registers.d = 0;
  registers.e = 0;
  registers.h = 0;
  registers.l = 0;
  registers.sp = 0;
  registers.pc = 0;
};

export const readRegister8 = (register: Register8) => {
  switch (register) {
    case "A":
      return registers.a;
    case "F":
      return registers.f;
    case "B":
      return registers.b;
    case "C":
      return registers.c;
    case "D":
      return registers.d;
    case "E":
      return registers.e;
    case "H":
      return registers.h;
    case "L":
      return registers.l;
  }
};

export const readRegister16 = (register: Register16) => {
  switch (register) {
    case "PC":
      return registers.pc;
    case "SP":
      return registers.sp;
  }
};

export const writeRegister8 = (register: Register8, value: number) => {
  switch (register) {
    case "A":
      registers.a = value;
      break;
    case "F":
      registers.f = value;
      break;
    case "B":
      registers.b = value;
      break;
    case "C":
      registers.c = value;
      break;
    case "D":
      registers.d = value;
      break;
    case "E":
      registers.e = value;
      break;
    case "H":
      registers.h = value;
      break;
    case "L":
      registers.l = value;
      break;
  }
};

export const writeRegister16 = (register: Register16, value: number) => {
  switch (register) {
    case "PC":
      registers.pc = value;
      break;
    case "SP":
      registers.sp = value;
      break;
  }
};

const pairToRegisters = (pair: RegisterPair) =>
  [pair.charAt(0), pair.charAt(1)] as [Register8, Register8];

export const getHighByte = (value: number) => (value >> 8) & 0xff;

export const getLowByte = (value: number) => value & 0xff;

export const makeWord = (highByte: number, lowByte: number) =>
  (highByte << 8) | lowByte;

export function incrementWord(value: number) {
  return (value + 1) & 0xffff;
}

export function decrementWord(value: number) {
  return (0x10000 + value - 1) & 0xffff;
}

export function getSignedByte(value: number) {
  return value > 0x7f ? value - 0x100 : value;
}

export const readRegisterPair = (pair: RegisterPair) => {
  const [high, low] = pairToRegisters(pair);
  return makeWord(readRegister8(high), readRegister8(low));
};

export const writeRegisterPair = (pair: RegisterPair, value: number) => {
  const [high, low] = pairToRegisters(pair);
  writeRegister8(high, getHighByte(value));
  writeRegister8(low, getLowByte(value));
};

const flagShift: Record<Flag, number> = {
  Z: 7,
  N: 6,
  H: 5,
  CY: 4,
};

export const isSetFlag = (flag: Flag) =>
  !!(registers.f & (1 << flagShift[flag]));

export const setFlag = (flag: Flag) => {
  registers.f |= 1 << flagShift[flag];
};

export const clearFlag = (flag: Flag) => {
  registers.f &= ~(1 << flagShift[flag]);
};

export const checkCondition = (condition: Condition) => {
  switch (condition) {
    case "Z":
      return isSetFlag("Z");
    case "C":
      return isSetFlag("CY");
    case "NZ":
      return !isSetFlag("Z");
    case "NC":
      return !isSetFlag("CY");
  }
};

export const fetchImmediateByte = () => {
  return Memory.read(registers.pc++);
};

export const fetchImmediateWord = () => {
  let lowByte = fetchImmediateByte();
  let highByte = fetchImmediateByte();
  return makeWord(highByte, lowByte);
};

let ime = false;

export const setIME = (value: boolean) => {
  ime = value;
};

const updateZeroFlag = (result: number) => {
  if (result === 0) {
    setFlag("Z");
  } else {
    clearFlag("Z");
  }
};

export const xor = (a: number, b: number) => {
  const result = a ^ b;

  updateZeroFlag(result);
  clearFlag("N");
  clearFlag("H");
  clearFlag("CY");

  return result;
};
