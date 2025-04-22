import { Flag, Register, RegisterPair } from "../register";
import { resetBit, setBit } from "../../utils";
import { makeInstruction } from "./lib";
import { CpuState } from "../cpu-state";

export const rotateLeftCircularAccumulator = makeInstruction((cpu) => {
  const result = rotateLeftCircular(cpu, cpu.readRegister(Register.A));

  cpu.writeRegister(Register.A, result);
  cpu.setFlag(Flag.Z, false);
});

export const rotateLeftCircularRegister = makeInstruction(
  (cpu, reg: Register) => {
    const result = rotateLeftCircular(cpu, cpu.readRegister(reg));

    cpu.writeRegister(reg, result);
    cpu.setFlag(Flag.Z, result === 0);
  }
);

export const rotateLeftCircularIndirectHL = makeInstruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readMemory(address);

  cpu.beginNextCycle();

  const result = rotateLeftCircular(cpu, data);

  cpu.writeMemory(address, result);
  cpu.setFlag(Flag.Z, result === 0);

  cpu.beginNextCycle();
});

function rotateLeftCircular(cpu: CpuState, value: number) {
  const result = ((value << 1) | (value >> 7)) & 0xff;
  const carry = (value & 0x80) != 0;

  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);

  return result;
}

export const rotateRightCircularAccumulator = makeInstruction((cpu) => {
  const result = rotateRightCircular(cpu, cpu.readRegister(Register.A));

  cpu.writeRegister(Register.A, result);
  cpu.setFlag(Flag.Z, false);
});

export const rotateRightCircularRegister = makeInstruction(
  (cpu, reg: Register) => {
    const result = rotateRightCircular(cpu, cpu.readRegister(reg));

    cpu.writeRegister(reg, result);
    cpu.setFlag(Flag.Z, result === 0);
  }
);

export const rotateRightCircularIndirectHL = makeInstruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readMemory(address);

  cpu.beginNextCycle();

  const result = rotateRightCircular(cpu, data);

  cpu.writeMemory(address, result);
  cpu.setFlag(Flag.Z, result === 0);

  cpu.beginNextCycle();
});

function rotateRightCircular(cpu: CpuState, value: number) {
  const result = ((value >> 1) | (value << 7)) & 0xff;
  const carry = (value & 0x01) != 0;

  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);

  return result;
}

export const rotateLeftAccumulator = makeInstruction((cpu) => {
  const result = rotateLeft(cpu, cpu.readRegister(Register.A));

  cpu.writeRegister(Register.A, result);
  cpu.setFlag(Flag.Z, false);
});

export const rotateLeftRegister = makeInstruction((cpu, reg: Register) => {
  const result = rotateLeft(cpu, cpu.readRegister(reg));

  cpu.writeRegister(reg, result);
  cpu.setFlag(Flag.Z, result === 0);
});

export const rotateLeftIndirectHL = makeInstruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readMemory(address);

  cpu.beginNextCycle();

  const result = rotateLeft(cpu, data);

  cpu.writeMemory(address, result);
  cpu.setFlag(Flag.Z, result === 0);

  cpu.beginNextCycle();
});

function rotateLeft(cpu: CpuState, value: number) {
  const result = ((value << 1) & 0xff) | (cpu.getFlag(Flag.CY) ? 0x01 : 0x00);
  const carry = (value & 0x80) != 0;

  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);

  return result;
}

export const rotateRightAccumulator = makeInstruction((cpu) => {
  const result = rotateRight(cpu, cpu.readRegister(Register.A));

  cpu.writeRegister(Register.A, result);
  cpu.setFlag(Flag.Z, false);
});

export const rotateRightRegister = makeInstruction((cpu, reg: Register) => {
  const result = rotateRight(cpu, cpu.readRegister(reg));

  cpu.writeRegister(reg, result);
  cpu.setFlag(Flag.Z, result === 0);
});

export const rotateRightIndirectHL = makeInstruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readMemory(address);

  cpu.beginNextCycle();

  const result = rotateRight(cpu, data);

  cpu.writeMemory(address, result);
  cpu.setFlag(Flag.Z, result === 0);

  cpu.beginNextCycle();
});

function rotateRight(cpu: CpuState, value: number) {
  const result = ((value >> 1) & 0xff) | (cpu.getFlag(Flag.CY) ? 0x80 : 0x00);
  const carry = (value & 0x01) != 0;

  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);

  return result;
}

export const shiftLeftArithmeticRegister = makeInstruction(
  (cpu, reg: Register) => {
    const result = shiftLeftArithmetic(cpu, cpu.readRegister(reg));

    cpu.writeRegister(reg, result);
    cpu.setFlag(Flag.Z, result === 0);
  }
);

export const shiftLeftArithmeticIndirectHL = makeInstruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readMemory(address);

  cpu.beginNextCycle();

  const result = shiftLeftArithmetic(cpu, data);

  cpu.writeMemory(address, result);
  cpu.setFlag(Flag.Z, result === 0);

  cpu.beginNextCycle();
});

function shiftLeftArithmetic(cpu: CpuState, value: number) {
  const result = (value << 1) & 0xff;
  const carry = (value & 0x80) !== 0;

  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);

  return result;
}

export const shiftRightArithmeticRegister = makeInstruction(
  (cpu, reg: Register) => {
    const result = shiftRightArithmetic(cpu, cpu.readRegister(reg));

    cpu.writeRegister(reg, result);
    cpu.setFlag(Flag.Z, result === 0);
  }
);

export const shiftRightArithmeticIndirectHL = makeInstruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readMemory(address);

  cpu.beginNextCycle();

  const result = shiftRightArithmetic(cpu, data);

  cpu.writeMemory(address, result);
  cpu.setFlag(Flag.Z, result === 0);

  cpu.beginNextCycle();
});

function shiftRightArithmetic(cpu: CpuState, value: number) {
  const result = ((value >> 1) & 0xff) | (value & 0x80);
  const carry = (value & 0x01) !== 0;

  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);

  return result;
}

export const shiftRightLogicalRegister = makeInstruction(
  (cpu, reg: Register) => {
    const result = shiftRightLogical(cpu, cpu.readRegister(reg));

    cpu.writeRegister(reg, result);
    cpu.setFlag(Flag.Z, result === 0);
  }
);

export const shiftRightLogicalIndirectHL = makeInstruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readMemory(address);

  cpu.beginNextCycle();

  const result = shiftRightLogical(cpu, data);

  cpu.writeMemory(address, result);
  cpu.setFlag(Flag.Z, result === 0);

  cpu.beginNextCycle();
});

function shiftRightLogical(cpu: CpuState, value: number) {
  const result = (value >> 1) & 0xff;
  const carry = (value & 0x01) !== 0;

  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);

  return result;
}

export const swapNibblesRegister = makeInstruction((cpu, reg: Register) => {
  const result = swapNibbles(cpu, cpu.readRegister(reg));
  cpu.writeRegister(reg, result);
});

export const swapNibblesIndirectHL = makeInstruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readMemory(address);

  cpu.beginNextCycle();

  const result = swapNibbles(cpu, data);
  cpu.writeMemory(address, result);

  cpu.beginNextCycle();
});

function swapNibbles(cpu: CpuState, value: number) {
  const result = ((value & 0xf) << 4) | ((value >> 4) & 0xf);

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, false);

  return result;
}

export const testBitRegister = makeInstruction(
  (cpu, bit: number, reg: Register) => {
    testBit(cpu, cpu.readRegister(reg), bit);
  }
);

export const testBitIndirectHL = makeInstruction((cpu, bit: number) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readMemory(address);

  cpu.beginNextCycle();

  testBit(cpu, data, bit);
});

function testBit(cpu: CpuState, value: number, bit: number) {
  cpu.setFlag(Flag.Z, !(value & (1 << bit)));
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, true);
}

export const resetBitRegister = makeInstruction(
  (cpu, bit: number, reg: Register) => {
    cpu.writeRegister(reg, resetBit(cpu.readRegister(reg), bit));
  }
);

export const resetBitIndirectHL = makeInstruction((cpu, bit: number) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readMemory(address);

  cpu.beginNextCycle();

  cpu.writeMemory(address, resetBit(data, bit));

  cpu.beginNextCycle();
});

export const setBitRegister = makeInstruction(
  (cpu, bit: number, reg: Register) => {
    cpu.writeRegister(reg, setBit(cpu.readRegister(reg), bit));
  }
);

export const setBitIndirectHL = makeInstruction((cpu, bit: number) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readMemory(address);

  cpu.beginNextCycle();

  cpu.writeMemory(address, setBit(data, bit));

  cpu.beginNextCycle();
});
