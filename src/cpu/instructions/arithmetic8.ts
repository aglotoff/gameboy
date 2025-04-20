import { CpuState } from "../cpu-state";
import { Flag, Register, RegisterPair } from "../register";
import {
  addBytes,
  instruction,
  instructionWithImmediateByte,
  subtractBytes,
} from "./lib";

export const addRegister = instruction((cpu, reg: Register) => {
  addToAccumulator(cpu, cpu.getRegister(reg));
});

export const addIndirectHL = instruction((cpu) => {
  const data = cpu.readBus(cpu.getRegisterPair(RegisterPair.HL));

  cpu.beginNextCycle();

  addToAccumulator(cpu, data);
});

export const addImmediate = instructionWithImmediateByte((cpu, data) => {
  addToAccumulator(cpu, data);
});

export const addRegisterWithCarry = instruction((cpu, reg: Register) => {
  addToAccumulator(cpu, cpu.getRegister(reg), cpu.getFlag(Flag.CY));
});

export const addIndirectHLWithCarry = instruction((cpu) => {
  const data = cpu.readBus(cpu.getRegisterPair(RegisterPair.HL));

  cpu.beginNextCycle();

  addToAccumulator(cpu, data, cpu.getFlag(Flag.CY));
});

export const addImmediateWithCarry = instructionWithImmediateByte(
  (cpu, data) => {
    addToAccumulator(cpu, data, cpu.getFlag(Flag.CY));
  }
);

function addToAccumulator(cpu: CpuState, value: number, carry = false) {
  const { result, carryFrom3, carryFrom7 } = addBytes(
    cpu.getRegister(Register.A),
    value,
    carry
  );

  cpu.setRegister(Register.A, result);

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, carryFrom3);
  cpu.setFlag(Flag.CY, carryFrom7);
}

export const subtractRegister = instruction((cpu, reg: Register) => {
  subtractFromAccumulator(cpu, cpu.getRegister(reg));
});

export const subtractIndirectHL = instruction((cpu) => {
  const data = cpu.readBus(cpu.getRegisterPair(RegisterPair.HL));

  cpu.beginNextCycle();

  subtractFromAccumulator(cpu, data);
});

export const subtractImmediate = instructionWithImmediateByte((cpu, data) => {
  subtractFromAccumulator(cpu, data);
});

export const subtractRegisterWithCarry = instruction((cpu, reg: Register) => {
  subtractFromAccumulator(cpu, cpu.getRegister(reg), cpu.getFlag(Flag.CY));
});

export const subtractIndirectHLWithCarry = instruction((cpu) => {
  const data = cpu.readBus(cpu.getRegisterPair(RegisterPair.HL));

  cpu.beginNextCycle();

  subtractFromAccumulator(cpu, data, cpu.getFlag(Flag.CY));
});

export const subtractImmediateWithCarry = instructionWithImmediateByte(
  (cpu, data) => {
    subtractFromAccumulator(cpu, data, cpu.getFlag(Flag.CY));
  }
);

function subtractFromAccumulator(cpu: CpuState, value: number, carry = false) {
  const { result, borrowTo3, borrowTo7 } = subtractBytes(
    cpu.getRegister(Register.A),
    value,
    carry
  );

  cpu.setRegister(Register.A, result);

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, true);
  cpu.setFlag(Flag.H, borrowTo3);
  cpu.setFlag(Flag.CY, borrowTo7);
}

export const compareRegister = instruction((cpu, reg: Register) => {
  compareWithAccumulator(cpu, cpu.getRegister(reg));
});

export const compareIndirectHL = instruction((cpu) => {
  const data = cpu.readBus(cpu.getRegisterPair(RegisterPair.HL));

  cpu.beginNextCycle();

  compareWithAccumulator(cpu, data);
});

export const compareImmediate = instructionWithImmediateByte((cpu, data) => {
  compareWithAccumulator(cpu, data);
});

function compareWithAccumulator(cpu: CpuState, value: number) {
  const { result, borrowTo3, borrowTo7 } = subtractBytes(
    cpu.getRegister(Register.A),
    value
  );

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, true);
  cpu.setFlag(Flag.H, borrowTo3);
  cpu.setFlag(Flag.CY, borrowTo7);
}

export const incrementRegister = instruction((cpu, reg: Register) => {
  cpu.setRegister(reg, increment(cpu, cpu.getRegister(reg)));
});

export const incrementIndirectHL = instruction((cpu) => {
  const address = cpu.getRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);

  cpu.beginNextCycle();

  cpu.writeBus(address, increment(cpu, data));

  cpu.beginNextCycle();
});

function increment(cpu: CpuState, value: number) {
  const { result, carryFrom3 } = addBytes(value, 1);

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, carryFrom3);

  return result;
}

export const decrementRegister = instruction((cpu, reg: Register) => {
  cpu.setRegister(reg, decrement(cpu, cpu.getRegister(reg)));
});

export const decrementIndirectHL = instruction((cpu) => {
  const address = cpu.getRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);

  cpu.beginNextCycle();

  cpu.writeBus(address, decrement(cpu, data));

  cpu.beginNextCycle();
});

function decrement(cpu: CpuState, value: number) {
  const { result, borrowTo3 } = subtractBytes(value, 1);

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, true);
  cpu.setFlag(Flag.H, borrowTo3);

  return result;
}

export const andRegister = instruction((cpu, reg: Register) => {
  andAccumulator(cpu, cpu.getRegister(reg));
});

export const andIndirectHL = instruction((cpu) => {
  const data = cpu.readBus(cpu.getRegisterPair(RegisterPair.HL));

  cpu.beginNextCycle();

  andAccumulator(cpu, data);
});

export const andImmediate = instructionWithImmediateByte((cpu, value) => {
  andAccumulator(cpu, value);
});

function andAccumulator(cpu: CpuState, value: number) {
  const result = cpu.getRegister(Register.A) & value;

  cpu.setRegister(Register.A, result);

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, true);
  cpu.setFlag(Flag.CY, false);
}

export const orRegister = instruction((cpu, reg: Register) => {
  orAccumulator(cpu, cpu.getRegister(reg));
});

export const orIndirectHL = instruction((cpu) => {
  const data = cpu.readBus(cpu.getRegisterPair(RegisterPair.HL));

  cpu.beginNextCycle();

  orAccumulator(cpu, data);
});

export const orImmediate = instructionWithImmediateByte((cpu, value) => {
  orAccumulator(cpu, value);
});

function orAccumulator(cpu: CpuState, value: number) {
  const result = cpu.getRegister(Register.A) | value;

  cpu.setRegister(Register.A, result);

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, false);
}

export const xorRegister = instruction((cpu, reg: Register) => {
  xorAccumulator(cpu, cpu.getRegister(reg));
});

export const xorIndirectHL = instruction((cpu) => {
  const data = cpu.readBus(cpu.getRegisterPair(RegisterPair.HL));

  cpu.beginNextCycle();

  xorAccumulator(cpu, data);
});

export const xorImmediate = instructionWithImmediateByte((cpu, value) => {
  xorAccumulator(cpu, value);
});

function xorAccumulator(cpu: CpuState, value: number) {
  const result = cpu.getRegister(Register.A) ^ value;

  cpu.setRegister(Register.A, result);

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, false);
}

export const complementCarryFlag = instruction((cpu) => {
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, !cpu.getFlag(Flag.CY));
});

export const setCarryFlag = instruction((cpu) => {
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, true);
});

export const decimalAdjustAccumulator = instruction((cpu) => {
  let a = cpu.getRegister(Register.A);
  const cy = cpu.getFlag(Flag.CY);
  const h = cpu.getFlag(Flag.H);
  const n = cpu.getFlag(Flag.N);

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

  cpu.setRegister(Register.A, a);

  cpu.setFlag(Flag.Z, a === 0);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);
});

export const complementAccumulator = instruction((cpu) => {
  cpu.setRegister(Register.A, ~cpu.getRegister(Register.A));
  cpu.setFlag(Flag.N, true);
  cpu.setFlag(Flag.H, true);
});
