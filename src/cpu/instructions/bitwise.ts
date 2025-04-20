import { Flag, Register, RegisterPair } from "../register";
import { resetBit, setBit } from "../../utils";
import { instruction } from "./lib";
import { CpuState } from "../cpu-state";

export const rotateLeftCircularAccumulator = instruction((cpu) => {
  const result = rotateLeftCircular(cpu, cpu.getRegister(Register.A));

  cpu.setRegister(Register.A, result);
  cpu.setFlag(Flag.Z, false);
});

export const rotateLeftCircularRegister = instruction((cpu, reg: Register) => {
  const result = rotateLeftCircular(cpu, cpu.getRegister(reg));

  cpu.setRegister(reg, result);
  cpu.setFlag(Flag.Z, result === 0);
});

export const rotateLeftCircularIndirectHL = instruction((cpu) => {
  const address = cpu.getRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);

  cpu.beginNextCycle();

  const result = rotateLeftCircular(cpu, data);

  cpu.writeBus(address, result);
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

export const rotateRightCircularAccumulator = instruction((cpu) => {
  const result = rotateRightCircular(cpu, cpu.getRegister(Register.A));

  cpu.setRegister(Register.A, result);
  cpu.setFlag(Flag.Z, false);
});

export const rotateRightCircularRegister = instruction((cpu, reg: Register) => {
  const result = rotateRightCircular(cpu, cpu.getRegister(reg));

  cpu.setRegister(reg, result);
  cpu.setFlag(Flag.Z, result === 0);
});

export const rotateRightCircularIndirectHL = instruction((cpu) => {
  const address = cpu.getRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);

  cpu.beginNextCycle();

  const result = rotateRightCircular(cpu, data);

  cpu.writeBus(address, result);
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

export const rotateLeftAccumulator = instruction((cpu) => {
  const result = rotateLeft(cpu, cpu.getRegister(Register.A));

  cpu.setRegister(Register.A, result);
  cpu.setFlag(Flag.Z, false);
});

export const rotateLeftRegister = instruction((cpu, reg: Register) => {
  const result = rotateLeft(cpu, cpu.getRegister(reg));

  cpu.setRegister(reg, result);
  cpu.setFlag(Flag.Z, result === 0);
});

export const rotateLeftIndirectHL = instruction((cpu) => {
  const address = cpu.getRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);

  cpu.beginNextCycle();

  const result = rotateLeft(cpu, data);

  cpu.writeBus(address, result);
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

export const rotateRightAccumulator = instruction((cpu) => {
  const result = rotateRight(cpu, cpu.getRegister(Register.A));

  cpu.setRegister(Register.A, result);
  cpu.setFlag(Flag.Z, false);
});

export const rotateRightRegister = instruction((cpu, reg: Register) => {
  const result = rotateRight(cpu, cpu.getRegister(reg));

  cpu.setRegister(reg, result);
  cpu.setFlag(Flag.Z, result === 0);
});

export const rotateRightIndirectHL = instruction((cpu) => {
  const address = cpu.getRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);

  cpu.beginNextCycle();

  const result = rotateRight(cpu, data);

  cpu.writeBus(address, result);
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

export const shiftLeftArithmeticRegister = instruction((cpu, reg: Register) => {
  const result = shiftLeftArithmetic(cpu, cpu.getRegister(reg));

  cpu.setRegister(reg, result);
  cpu.setFlag(Flag.Z, result === 0);
});

export const shiftLeftArithmeticIndirectHL = instruction((cpu) => {
  const address = cpu.getRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);

  cpu.beginNextCycle();

  const result = shiftLeftArithmetic(cpu, data);

  cpu.writeBus(address, result);
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

export const shiftRightArithmeticRegister = instruction(
  (cpu, reg: Register) => {
    const result = shiftRightArithmetic(cpu, cpu.getRegister(reg));

    cpu.setRegister(reg, result);
    cpu.setFlag(Flag.Z, result === 0);
  }
);

export const shiftRightArithmeticIndirectHL = instruction((cpu) => {
  const address = cpu.getRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);

  cpu.beginNextCycle();

  const result = shiftRightArithmetic(cpu, data);

  cpu.writeBus(address, result);
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

export const shiftRightLogicalRegister = instruction((cpu, reg: Register) => {
  const result = shiftRightLogical(cpu, cpu.getRegister(reg));

  cpu.setRegister(reg, result);
  cpu.setFlag(Flag.Z, result === 0);
});

export const shiftRightLogicalIndirectHL = instruction((cpu) => {
  const address = cpu.getRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);

  cpu.beginNextCycle();

  const result = shiftRightLogical(cpu, data);

  cpu.writeBus(address, result);
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

export const swapNibblesRegister = instruction((cpu, reg: Register) => {
  const result = swapNibbles(cpu, cpu.getRegister(reg));
  cpu.setRegister(reg, result);
});

export const swapNibblesIndirectHL = instruction((cpu) => {
  const address = cpu.getRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);

  cpu.beginNextCycle();

  const result = swapNibbles(cpu, data);
  cpu.writeBus(address, result);

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

export const testBitRegister = instruction(
  (cpu, bit: number, reg: Register) => {
    testBit(cpu, cpu.getRegister(reg), bit);
  }
);

export const testBitIndirectHL = instruction((cpu, bit: number) => {
  const address = cpu.getRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);

  cpu.beginNextCycle();

  testBit(cpu, data, bit);
});

function testBit(cpu: CpuState, value: number, bit: number) {
  cpu.setFlag(Flag.Z, !(value & (1 << bit)));
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, true);
}

export const resetBitRegister = instruction(
  (cpu, bit: number, reg: Register) => {
    cpu.setRegister(reg, resetBit(cpu.getRegister(reg), bit));
  }
);

export const resetBitIndirectHL = instruction((cpu, bit: number) => {
  const address = cpu.getRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);

  cpu.beginNextCycle();

  cpu.writeBus(address, resetBit(data, bit));

  cpu.beginNextCycle();
});

export const setBitRegister = instruction((cpu, bit: number, reg: Register) => {
  cpu.setRegister(reg, setBit(cpu.getRegister(reg), bit));
});

export const setBitIndirectHL = instruction((cpu, bit: number) => {
  const address = cpu.getRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);

  cpu.beginNextCycle();

  cpu.writeBus(address, setBit(data, bit));

  cpu.beginNextCycle();
});
