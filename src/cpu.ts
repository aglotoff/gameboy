import { Memory } from "./memory";
import { getLSB, getMSB, makeWord, incrementWord } from "./utils";

export enum Register {
  A = 0,
  F = 1,
  B = 2,
  C = 3,
  D = 4,
  E = 5,
  H = 6,
  L = 7,
  SP_L = 8,
  SP_H = 9,
  PC_L = 10,
  PC_H = 11,
  IR = 12,
  IE = 13,
}

export enum RegisterPair {
  AF = 0,
  BC = 1,
  DE = 2,
  HL = 3,
  SP = 4,
  PC = 5,
}

export enum Flag {
  Z = 7,
  N = 6,
  H = 5,
  CY = 4,
}

const pairToRegisters: Record<RegisterPair, [Register, Register]> = {
  [RegisterPair.AF]: [Register.A, Register.F],
  [RegisterPair.BC]: [Register.B, Register.C],
  [RegisterPair.DE]: [Register.D, Register.E],
  [RegisterPair.HL]: [Register.H, Register.L],
  [RegisterPair.SP]: [Register.SP_H, Register.SP_L],
  [RegisterPair.PC]: [Register.PC_H, Register.PC_L],
};

export class RegisterFile {
  private registers = new Uint8Array(14);

  reset() {
    this.registers = new Uint8Array(14);
  }

  read(register: Register) {
    return this.registers[register];
  }

  write(register: Register, value: number) {
    this.registers[register] = value;
  }

  readPair(pair: RegisterPair) {
    const [high, low] = pairToRegisters[pair];
    return makeWord(this.read(high), this.read(low));
  }

  writePair(pair: RegisterPair, value: number) {
    const [high, low] = pairToRegisters[pair];
    this.registers[high] = getMSB(value);
    this.registers[low] = getLSB(value);
  }

  isFlagSet(flag: Flag) {
    return !!(this.registers[Register.F] & (1 << flag));
  }

  setFlag(flag: Flag, value: boolean) {
    if (value) {
      this.registers[Register.F] |= 1 << flag;
    } else {
      this.registers[Register.F] &= ~(1 << flag);
    }
  }
}

export const regs = new RegisterFile();

export type Condition = "Z" | "C" | "NZ" | "NC";

export const checkCondition = (regs: RegisterFile, condition: Condition) => {
  switch (condition) {
    case "Z":
      return regs.isFlagSet(Flag.Z);
    case "C":
      return regs.isFlagSet(Flag.CY);
    case "NZ":
      return !regs.isFlagSet(Flag.Z);
    case "NC":
      return !regs.isFlagSet(Flag.CY);
  }
};

let ime = false;

export const setIME = (value: boolean) => {
  ime = value;
};
