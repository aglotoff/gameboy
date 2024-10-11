import { getLSB, getMSB, makeWord, resetBit, setBit, testBit } from "../utils";

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

const pairToRegisters: Record<RegisterPair, [Register, Register]> = {
  [RegisterPair.AF]: [Register.A, Register.F],
  [RegisterPair.BC]: [Register.B, Register.C],
  [RegisterPair.DE]: [Register.D, Register.E],
  [RegisterPair.HL]: [Register.H, Register.L],
  [RegisterPair.SP]: [Register.SP_H, Register.SP_L],
  [RegisterPair.PC]: [Register.PC_H, Register.PC_L],
};

export enum Flag {
  Z = 7,
  N = 6,
  H = 5,
  CY = 4,
}

const FLAG_MASK = 0xf0;

export class RegisterFile {
  private registers = new Uint8Array(14);

  public read(register: Register) {
    return this.registers[register];
  }

  public write(register: Register, value: number) {
    if (register === Register.F) {
      this.registers[register] = value & FLAG_MASK;
    } else {
      this.registers[register] = value;
    }
  }

  public readPair(pair: RegisterPair) {
    const [high, low] = pairToRegisters[pair];
    return makeWord(this.read(high), this.read(low));
  }

  public writePair(pair: RegisterPair, value: number) {
    const [high, low] = pairToRegisters[pair];
    this.write(high, getMSB(value));
    this.write(low, getLSB(value));
  }

  public isFlagSet(flag: Flag) {
    return testBit(this.registers[Register.F], flag);
  }

  public setFlag(flag: Flag, value: boolean) {
    if (value) {
      this.registers[Register.F] = setBit(this.registers[Register.F], flag);
    } else {
      this.registers[Register.F] = resetBit(this.registers[Register.F], flag);
    }
  }
}
