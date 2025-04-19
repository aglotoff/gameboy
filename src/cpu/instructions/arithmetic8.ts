import { CpuState } from "../cpu-state";
import { Flag, Register, RegisterPair } from "../register";
import {
  addBytes,
  instruction,
  instructionWithImmediateByte,
  subtractBytes,
} from "./lib";

export const addRegister = instruction((cpu, reg: Register) => {
  addToAccumulator(cpu, cpu.readRegister(reg));
});

export const addIndirectHL = instruction((cpu) => {
  const data = cpu.readBus(cpu.readRegisterPair(RegisterPair.HL));
  cpu.cycle();

  addToAccumulator(cpu, data);
});

export const addImmediate = instructionWithImmediateByte((cpu, value) => {
  addToAccumulator(cpu, value);
});

export const addRegisterWithCarry = instruction((cpu, reg: Register) => {
  addToAccumulator(cpu, cpu.readRegister(reg), true);
});

export const addIndirectHLWithCarry = instruction((cpu) => {
  const data = cpu.readBus(cpu.readRegisterPair(RegisterPair.HL));
  cpu.cycle();

  addToAccumulator(cpu, data, true);
});

export const addImmediateWithCarry = instructionWithImmediateByte(
  (cpu, value) => {
    addToAccumulator(cpu, value, true);
  }
);

function addToAccumulator(cpu: CpuState, value: number, carry = false) {
  const { result, carryFrom3, carryFrom7 } = addBytes(
    cpu.readRegister(Register.A),
    value,
    carry && cpu.isFlagSet(Flag.CY)
  );

  cpu.writeRegister(Register.A, result);
  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, carryFrom3);
  cpu.setFlag(Flag.CY, carryFrom7);
}

export const subtractRegister = instruction((cpu, reg: Register) => {
  subtractFromAccumulator(cpu, cpu.readRegister(reg));
});

export const subtractIndirectHL = instruction((cpu) => {
  const data = cpu.readBus(cpu.readRegisterPair(RegisterPair.HL));
  cpu.cycle();

  subtractFromAccumulator(cpu, data);
});

export const subtractImmediate = instructionWithImmediateByte((cpu, value) => {
  subtractFromAccumulator(cpu, value);
});

export const subtractRegisterWithCarry = instruction((cpu, reg: Register) => {
  subtractFromAccumulator(cpu, cpu.readRegister(reg), true);
});

export const subtractIndirectHLWithCarry = instruction((cpu) => {
  const data = cpu.readBus(cpu.readRegisterPair(RegisterPair.HL));
  cpu.cycle();

  subtractFromAccumulator(cpu, data, true);
});

export const subtractImmediateWithCarry = instructionWithImmediateByte(
  (cpu, value) => {
    subtractFromAccumulator(cpu, value, true);
  }
);

function subtractFromAccumulator(cpu: CpuState, value: number, carry = false) {
  const { result, borrowTo3, borrowTo7 } = subtractBytes(
    cpu.readRegister(Register.A),
    value,
    carry && cpu.isFlagSet(Flag.CY)
  );

  cpu.writeRegister(Register.A, result);
  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, true);
  cpu.setFlag(Flag.H, borrowTo3);
  cpu.setFlag(Flag.CY, borrowTo7);
}

export const compareRegister = instruction((cpu, reg: Register) => {
  compareWithAccumulator(cpu, cpu.readRegister(reg));
});

export const compareIndirectHL = instruction((cpu) => {
  const data = cpu.readBus(cpu.readRegisterPair(RegisterPair.HL));
  cpu.cycle();

  compareWithAccumulator(cpu, data);
});

export const compareImmediate = instructionWithImmediateByte((cpu, value) => {
  compareWithAccumulator(cpu, value);
});

function compareWithAccumulator(cpu: CpuState, value: number) {
  const { result, borrowTo3, borrowTo7 } = subtractBytes(
    cpu.readRegister(Register.A),
    value
  );

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, true);
  cpu.setFlag(Flag.H, borrowTo3);
  cpu.setFlag(Flag.CY, borrowTo7);
}

export const incrementRegister = instruction((cpu, reg: Register) => {
  cpu.writeRegister(reg, incrementAndSetFlags(cpu, cpu.readRegister(reg)));
});

export const incrementIndirectHL = instruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);
  cpu.cycle();

  cpu.writeBus(address, incrementAndSetFlags(cpu, data));
  cpu.cycle();
});

function incrementAndSetFlags(cpu: CpuState, value: number) {
  const { result, carryFrom3 } = addBytes(value, 1);

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, carryFrom3);

  return result;
}

export const decrementRegister = instruction((cpu, reg: Register) => {
  cpu.writeRegister(reg, decrement(cpu, cpu.readRegister(reg)));
});

export const decrementIndirectHL = instruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);
  cpu.cycle();

  cpu.writeBus(address, decrement(cpu, data));
  cpu.cycle();
});

function decrement(cpu: CpuState, value: number) {
  const { result, borrowTo3 } = subtractBytes(value, 1);

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, true);
  cpu.setFlag(Flag.H, borrowTo3);

  return result;
}

export const andRegister = instruction((cpu, reg: Register) => {
  andAccumulator(cpu, cpu.readRegister(reg));
});

export const andIndirectHL = instruction((cpu) => {
  const data = cpu.readBus(cpu.readRegisterPair(RegisterPair.HL));
  cpu.cycle();

  andAccumulator(cpu, data);
});

export const andImmediate = instructionWithImmediateByte((cpu, value) => {
  andAccumulator(cpu, value);
});

function andAccumulator(cpu: CpuState, value: number) {
  const result = cpu.readRegister(Register.A) & value;

  cpu.writeRegister(Register.A, result);
  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, true);
  cpu.setFlag(Flag.CY, false);
}

export const orRegister = instruction((cpu, reg: Register) => {
  orAccumulator(cpu, cpu.readRegister(reg));
});

export const orIndirectHL = instruction((cpu) => {
  const data = cpu.readBus(cpu.readRegisterPair(RegisterPair.HL));
  cpu.cycle();

  orAccumulator(cpu, data);
});

export const orImmediate = instructionWithImmediateByte((cpu, value) => {
  orAccumulator(cpu, value);
});

function orAccumulator(cpu: CpuState, value: number) {
  const result = cpu.readRegister(Register.A) | value;

  cpu.writeRegister(Register.A, result);
  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, false);
}

export const xorRegister = instruction((cpu, reg: Register) => {
  xorAccumulator(cpu, cpu.readRegister(reg));
});

export const xorIndirectHL = instruction((cpu) => {
  const data = cpu.readBus(cpu.readRegisterPair(RegisterPair.HL));
  cpu.cycle();

  xorAccumulator(cpu, data);
});

export const xorImmediate = instructionWithImmediateByte((cpu, value) => {
  xorAccumulator(cpu, value);
});

function xorAccumulator(cpu: CpuState, value: number) {
  const result = cpu.readRegister(Register.A) ^ value;

  cpu.writeRegister(Register.A, result);
  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, false);
}

export const complementCarryFlag = instruction((cpu) => {
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, !cpu.isFlagSet(Flag.CY));
});

export const setCarryFlag = instruction((cpu) => {
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, true);
});

export const decimalAdjustAccumulator = instruction((cpu) => {
  let a = cpu.readRegister(Register.A);
  const cy = cpu.isFlagSet(Flag.CY);
  const h = cpu.isFlagSet(Flag.H);
  const n = cpu.isFlagSet(Flag.N);

  let offset = 0;
  let carry = false;

  if ((!n && (a & 0xf) > 0x09) || h) {
    offset |= 0x06;
  }

  if ((!n && a > 0x99) || cy) {
    offset |= 0x60;
    carry = true;
  }

  if (!n) {
    a = (a + offset) & 0xff;
  } else {
    a = (a - offset) & 0xff;
  }

  cpu.writeRegister(Register.A, a);
  cpu.setFlag(Flag.Z, a === 0);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);
});

export const complementAccumulator = instruction((cpu) => {
  cpu.writeRegister(Register.A, ~cpu.readRegister(Register.A));
  cpu.setFlag(Flag.N, true);
  cpu.setFlag(Flag.H, true);
});
