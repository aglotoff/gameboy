// Register names are array indices for maximum performance
export const enum Register {
  A = 0,
  F = 1,
  B = 2,
  C = 3,
  D = 4,
  E = 5,
  H = 6,
  L = 7,
  SP_H = 8,
  SP_L = 9,
  PC_H = 10,
  PC_L = 11,
  IR = 12,
  IE = 13,
}

// Use bit masks for flag names to avoid extra shifts
export const enum Flag {
  Z = 0b1000_0000,
  N = 0b0100_0000,
  H = 0b0010_0000,
  CY = 0b0001_0000,
}

const FLAG_MASK = 0b1111_0000;

export class RegisterFile {
  private registers = new Uint8Array(14);

  public readRegister(register: Register) {
    return this.registers[register];
  }

  public writeRegister(register: Register, value: number) {
    if (register === Register.F) {
      // High 4 bits of flags are always zero
      // TODO: re-check that
      this.registers[register] = value & FLAG_MASK;
    } else {
      this.registers[register] = value;
    }
  }

  public getFlag(flag: Flag) {
    return (this.registers[Register.F] & flag) !== 0;
  }

  public setFlag(flag: Flag, value: boolean) {
    if (value) {
      this.registers[Register.F] |= flag;
    } else {
      this.registers[Register.F] &= ~flag;
    }
  }
}
