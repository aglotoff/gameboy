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

export const readRegister = (register: Register) => {
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
    case "PC":
      return registers.pc;
    case "SP":
      return registers.sp;
  }
};

export const writeRegister = (register: Register, value: number) => {
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

const getHighByte = (value: number) => (value >> 8) & 0xff;

const getLowByte = (value: number) => value & 0xff;

const makeWord = (highByte: number, lowByte: number) =>
  (highByte << 8) | lowByte;

export const readRegisterPair = (pair: RegisterPair) => {
  const [high, low] = pairToRegisters(pair);
  return makeWord(readRegister(high), readRegister(low));
};

export const writeRegisterPair = (pair: RegisterPair, value: number) => {
  const [high, low] = pairToRegisters(pair);
  writeRegister(high, getHighByte(value));
  writeRegister(low, getLowByte(value));
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
