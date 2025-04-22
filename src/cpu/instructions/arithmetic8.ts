import { CpuState } from "../cpu-state";
import { Flag, Register, RegisterPair } from "../register";
import {
  addBytes,
  makeInstruction,
  makeInstructionWithImmediateByte,
  subtractBytes,
} from "./lib";

export const addRegister = makeInstruction((cpu, reg: Register) => {
  doAdd(cpu, cpu.readRegister(reg));
});

export const addIndirectHL = makeInstruction((cpu) => {
  const data = cpu.readMemory(cpu.readRegisterPair(RegisterPair.HL));

  cpu.beginNextCycle();

  doAdd(cpu, data);
});

export const addImmediate = makeInstructionWithImmediateByte(doAdd);

export const addRegisterWithCarry = makeInstruction((cpu, reg: Register) => {
  doAdd(cpu, cpu.readRegister(reg), cpu.getFlag(Flag.CY));
});

export const addIndirectHLWithCarry = makeInstruction((cpu) => {
  const data = cpu.readMemory(cpu.readRegisterPair(RegisterPair.HL));

  cpu.beginNextCycle();

  doAdd(cpu, data, cpu.getFlag(Flag.CY));
});

export const addImmediateWithCarry = makeInstructionWithImmediateByte(
  (cpu, data) => {
    doAdd(cpu, data, cpu.getFlag(Flag.CY));
  }
);

function doAdd(cpu: CpuState, value: number, carry = false) {
  const { result, carryFrom3, carryFrom7 } = addBytes(
    cpu.readRegister(Register.A),
    value,
    carry
  );

  cpu.writeRegister(Register.A, result);

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, carryFrom3);
  cpu.setFlag(Flag.CY, carryFrom7);
}

export const subtractRegister = makeInstruction((cpu, reg: Register) => {
  doSubtract(cpu, cpu.readRegister(reg));
});

export const subtractIndirectHL = makeInstruction((cpu) => {
  const data = cpu.readMemory(cpu.readRegisterPair(RegisterPair.HL));

  cpu.beginNextCycle();

  doSubtract(cpu, data);
});

export const subtractImmediate = makeInstructionWithImmediateByte(doSubtract);

export const subtractRegisterWithCarry = makeInstruction(
  (cpu, reg: Register) => {
    doSubtract(cpu, cpu.readRegister(reg), cpu.getFlag(Flag.CY));
  }
);

export const subtractIndirectHLWithCarry = makeInstruction((cpu) => {
  const data = cpu.readMemory(cpu.readRegisterPair(RegisterPair.HL));

  cpu.beginNextCycle();

  doSubtract(cpu, data, cpu.getFlag(Flag.CY));
});

export const subtractImmediateWithCarry = makeInstructionWithImmediateByte(
  (cpu, data) => {
    doSubtract(cpu, data, cpu.getFlag(Flag.CY));
  }
);

function doSubtract(cpu: CpuState, value: number, carry = false) {
  const { result, borrowTo3, borrowTo7 } = subtractBytes(
    cpu.readRegister(Register.A),
    value,
    carry
  );

  cpu.writeRegister(Register.A, result);

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, true);
  cpu.setFlag(Flag.H, borrowTo3);
  cpu.setFlag(Flag.CY, borrowTo7);
}

export const compareRegister = makeInstruction((cpu, reg: Register) => {
  doCompare(cpu, cpu.readRegister(reg));
});

export const compareIndirectHL = makeInstruction((cpu) => {
  const data = cpu.readMemory(cpu.readRegisterPair(RegisterPair.HL));

  cpu.beginNextCycle();

  doCompare(cpu, data);
});

export const compareImmediate = makeInstructionWithImmediateByte(doCompare);

function doCompare(cpu: CpuState, value: number) {
  const { result, borrowTo3, borrowTo7 } = subtractBytes(
    cpu.readRegister(Register.A),
    value
  );

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, true);
  cpu.setFlag(Flag.H, borrowTo3);
  cpu.setFlag(Flag.CY, borrowTo7);
}

export const incrementRegister = makeInstruction((cpu, reg: Register) => {
  cpu.writeRegister(reg, doIncrement(cpu, cpu.readRegister(reg)));
});

export const incrementIndirectHL = makeInstruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readMemory(address);

  cpu.beginNextCycle();

  cpu.writeMemory(address, doIncrement(cpu, data));

  cpu.beginNextCycle();
});

function doIncrement(cpu: CpuState, value: number) {
  const { result, carryFrom3 } = addBytes(value, 1);

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, carryFrom3);

  return result;
}

export const decrementRegister = makeInstruction((cpu, reg: Register) => {
  cpu.writeRegister(reg, doDecrement(cpu, cpu.readRegister(reg)));
});

export const decrementIndirectHL = makeInstruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readMemory(address);

  cpu.beginNextCycle();

  cpu.writeMemory(address, doDecrement(cpu, data));

  cpu.beginNextCycle();
});

function doDecrement(cpu: CpuState, value: number) {
  const { result, borrowTo3 } = subtractBytes(value, 1);

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, true);
  cpu.setFlag(Flag.H, borrowTo3);

  return result;
}

export const andRegister = makeInstruction((cpu, reg: Register) => {
  doAnd(cpu, cpu.readRegister(reg));
});

export const andIndirectHL = makeInstruction((cpu) => {
  const data = cpu.readMemory(cpu.readRegisterPair(RegisterPair.HL));

  cpu.beginNextCycle();

  doAnd(cpu, data);
});

export const andImmediate = makeInstructionWithImmediateByte(doAnd);

function doAnd(cpu: CpuState, value: number) {
  const result = cpu.readRegister(Register.A) & value;

  cpu.writeRegister(Register.A, result);

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, true);
  cpu.setFlag(Flag.CY, false);
}

export const orRegister = makeInstruction((cpu, reg: Register) => {
  doOr(cpu, cpu.readRegister(reg));
});

export const orIndirectHL = makeInstruction((cpu) => {
  const data = cpu.readMemory(cpu.readRegisterPair(RegisterPair.HL));

  cpu.beginNextCycle();

  doOr(cpu, data);
});

export const orImmediate = makeInstructionWithImmediateByte(doOr);

function doOr(cpu: CpuState, value: number) {
  const result = cpu.readRegister(Register.A) | value;

  cpu.writeRegister(Register.A, result);

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, false);
}

export const xorRegister = makeInstruction((cpu, reg: Register) => {
  doXor(cpu, cpu.readRegister(reg));
});

export const xorIndirectHL = makeInstruction((cpu) => {
  const data = cpu.readMemory(cpu.readRegisterPair(RegisterPair.HL));

  cpu.beginNextCycle();

  doXor(cpu, data);
});

export const xorImmediate = makeInstructionWithImmediateByte(doXor);

function doXor(cpu: CpuState, value: number) {
  const result = cpu.readRegister(Register.A) ^ value;

  cpu.writeRegister(Register.A, result);

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, false);
}

export const complementCarryFlag = makeInstruction((cpu) => {
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, !cpu.getFlag(Flag.CY));
});

export const setCarryFlag = makeInstruction((cpu) => {
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, true);
});

export const decimalAdjustAccumulator = makeInstruction((cpu) => {
  let a = cpu.readRegister(Register.A);
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

  cpu.writeRegister(Register.A, a);

  cpu.setFlag(Flag.Z, a === 0);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);
});

export const complementAccumulator = makeInstruction((cpu) => {
  cpu.writeRegister(Register.A, ~cpu.readRegister(Register.A));
  cpu.setFlag(Flag.N, true);
  cpu.setFlag(Flag.H, true);
});
