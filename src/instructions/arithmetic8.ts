import { Flag, Register, RegisterPair } from "../regs";
import { addBytes, subtractBytes } from "../utils";
import { CpuState, instruction, instructionWithImmediateByte } from "./lib";

export const addRegister = instruction(({ cpu }, reg: Register) => {
  addToAccumulator(cpu, cpu.regs.read(reg));
  return 4;
});

export const addIndirectHL = instruction(({ cpu, memory }) => {
  addToAccumulator(cpu, memory.read(cpu.regs.readPair(RegisterPair.HL)));
  return 8;
});

export const addImmediate = instructionWithImmediateByte(({ cpu }, value) => {
  addToAccumulator(cpu, value);
  return 8;
});

export const addRegisterWithCarry = instruction(({ cpu }, reg: Register) => {
  addToAccumulator(cpu, cpu.regs.read(reg), true);
  return 4;
});

export const addIndirectHLWithCarry = instruction(({ cpu, memory }) => {
  addToAccumulator(cpu, memory.read(cpu.regs.readPair(RegisterPair.HL)), true);
  return 8;
});

export const addImmediateWithCarry = instructionWithImmediateByte(
  ({ cpu }, value) => {
    addToAccumulator(cpu, value, true);
    return 8;
  }
);

function addToAccumulator(cpu: CpuState, value: number, carry = false) {
  const { result, carryFrom3, carryFrom7 } = addBytes(
    cpu.regs.read(Register.A),
    value,
    carry && cpu.regs.isFlagSet(Flag.CY)
  );

  cpu.regs.write(Register.A, result);
  cpu.regs.setFlag(Flag.Z, result === 0);
  cpu.regs.setFlag(Flag.N, false);
  cpu.regs.setFlag(Flag.H, carryFrom3);
  cpu.regs.setFlag(Flag.CY, carryFrom7);
}

export const subtractRegister = instruction(({ cpu }, reg: Register) => {
  subtractFromAccumulator(cpu, cpu.regs.read(reg));
  return 4;
});

export const subtractIndirectHL = instruction(({ cpu, memory }) => {
  subtractFromAccumulator(cpu, memory.read(cpu.regs.readPair(RegisterPair.HL)));
  return 8;
});

export const subtractImmediate = instructionWithImmediateByte(
  ({ cpu }, value) => {
    subtractFromAccumulator(cpu, value);
    return 8;
  }
);

export const subtractRegisterWithCarry = instruction(
  ({ cpu }, reg: Register) => {
    subtractFromAccumulator(cpu, cpu.regs.read(reg), true);
    return 4;
  }
);

export const subtractIndirectHLWithCarry = instruction(({ cpu, memory }) => {
  subtractFromAccumulator(
    cpu,
    memory.read(cpu.regs.readPair(RegisterPair.HL)),
    true
  );
  return 8;
});

export const subtractImmediateWithCarry = instructionWithImmediateByte(
  ({ cpu }, value) => {
    subtractFromAccumulator(cpu, value, true);
    return 8;
  }
);

function subtractFromAccumulator(cpu: CpuState, value: number, carry = false) {
  const { result, borrowTo3, borrowTo7 } = subtractBytes(
    cpu.regs.read(Register.A),
    value,
    carry && cpu.regs.isFlagSet(Flag.CY)
  );

  cpu.regs.write(Register.A, result);
  cpu.regs.setFlag(Flag.Z, result === 0);
  cpu.regs.setFlag(Flag.N, true);
  cpu.regs.setFlag(Flag.H, borrowTo3);
  cpu.regs.setFlag(Flag.CY, borrowTo7);
}

export const compareRegister = instruction(({ cpu }, reg: Register) => {
  compareWithAccumulator(cpu, cpu.regs.read(reg));
  return 4;
});

export const compareIndirectHL = instruction(({ cpu, memory }) => {
  compareWithAccumulator(cpu, memory.read(cpu.regs.readPair(RegisterPair.HL)));
  return 8;
});

export const compareImmediate = instructionWithImmediateByte(
  ({ cpu }, value) => {
    compareWithAccumulator(cpu, value);
    return 8;
  }
);

function compareWithAccumulator(cpu: CpuState, value: number) {
  const { result, borrowTo3, borrowTo7 } = subtractBytes(
    cpu.regs.read(Register.A),
    value
  );

  cpu.regs.setFlag(Flag.Z, result === 0);
  cpu.regs.setFlag(Flag.N, true);
  cpu.regs.setFlag(Flag.H, borrowTo3);
  cpu.regs.setFlag(Flag.CY, borrowTo7);
}

export const incrementRegister = instruction(({ cpu }, reg: Register) => {
  cpu.regs.write(reg, incrementAndSetFlags(cpu, cpu.regs.read(reg)));
  return 4;
});

export const incrementIndirectHL = instruction(({ cpu, memory }) => {
  const address = cpu.regs.readPair(RegisterPair.HL);

  memory.write(address, incrementAndSetFlags(cpu, memory.read(address)));

  return 12;
});

function incrementAndSetFlags(cpu: CpuState, value: number) {
  const { result, carryFrom3 } = addBytes(value, 1);

  cpu.regs.setFlag(Flag.Z, result === 0);
  cpu.regs.setFlag(Flag.N, false);
  cpu.regs.setFlag(Flag.H, carryFrom3);

  return result;
}

export const decrementRegister = instruction(({ cpu }, reg: Register) => {
  cpu.regs.write(reg, decrement(cpu, cpu.regs.read(reg)));

  return 4;
});

export const decrementIndirectHL = instruction(({ cpu, memory }) => {
  const address = cpu.regs.readPair(RegisterPair.HL);

  memory.write(address, decrement(cpu, memory.read(address)));

  return 12;
});

function decrement(cpu: CpuState, value: number) {
  const { result, borrowTo3 } = subtractBytes(value, 1);

  cpu.regs.setFlag(Flag.Z, result === 0);
  cpu.regs.setFlag(Flag.N, true);
  cpu.regs.setFlag(Flag.H, borrowTo3);

  return result;
}

export const andRegister = instruction(({ cpu }, reg: Register) => {
  andAccumulator(cpu, cpu.regs.read(reg));
  return 4;
});

export const andIndirectHL = instruction(({ cpu, memory }) => {
  andAccumulator(cpu, memory.read(cpu.regs.readPair(RegisterPair.HL)));
  return 8;
});

export const andImmediate = instructionWithImmediateByte(({ cpu }, value) => {
  andAccumulator(cpu, value);
  return 8;
});

function andAccumulator(cpu: CpuState, value: number) {
  const result = cpu.regs.read(Register.A) & value;

  cpu.regs.write(Register.A, result);
  cpu.regs.setFlag(Flag.Z, result === 0);
  cpu.regs.setFlag(Flag.N, false);
  cpu.regs.setFlag(Flag.H, true);
  cpu.regs.setFlag(Flag.CY, false);
}

export const orRegister = instruction(({ cpu }, reg: Register) => {
  orAccumulator(cpu, cpu.regs.read(reg));
  return 4;
});

export const orIndirectHL = instruction(({ cpu, memory }) => {
  orAccumulator(cpu, memory.read(cpu.regs.readPair(RegisterPair.HL)));
  return 8;
});

export const orImmediate = instructionWithImmediateByte(({ cpu }, value) => {
  orAccumulator(cpu, value);
  return 8;
});

function orAccumulator(cpu: CpuState, value: number) {
  const result = cpu.regs.read(Register.A) | value;

  cpu.regs.write(Register.A, result);
  cpu.regs.setFlag(Flag.Z, result === 0);
  cpu.regs.setFlag(Flag.N, false);
  cpu.regs.setFlag(Flag.H, false);
  cpu.regs.setFlag(Flag.CY, false);
}

export const xorRegister = instruction(({ cpu }, reg: Register) => {
  xorAccumulator(cpu, cpu.regs.read(reg));
  return 4;
});

export const xorIndirectHL = instruction(({ cpu, memory }) => {
  xorAccumulator(cpu, memory.read(cpu.regs.readPair(RegisterPair.HL)));
  return 8;
});

export const xorImmediate = instructionWithImmediateByte(({ cpu }, value) => {
  xorAccumulator(cpu, value);
  return 8;
});

function xorAccumulator(cpu: CpuState, value: number) {
  const result = cpu.regs.read(Register.A) ^ value;

  cpu.regs.write(Register.A, result);
  cpu.regs.setFlag(Flag.Z, result === 0);
  cpu.regs.setFlag(Flag.N, false);
  cpu.regs.setFlag(Flag.H, false);
  cpu.regs.setFlag(Flag.CY, false);
}

export const complementCarryFlag = instruction(({ cpu }) => {
  cpu.regs.setFlag(Flag.N, false);
  cpu.regs.setFlag(Flag.H, false);
  cpu.regs.setFlag(Flag.CY, !cpu.regs.isFlagSet(Flag.CY));

  return 4;
});

export const setCarryFlag = instruction(({ cpu }) => {
  cpu.regs.setFlag(Flag.N, false);
  cpu.regs.setFlag(Flag.H, false);
  cpu.regs.setFlag(Flag.CY, true);

  return 4;
});

export const decimalAdjustAccumulator = instruction(({ cpu }) => {
  let a = cpu.regs.read(Register.A);
  const cy = cpu.regs.isFlagSet(Flag.CY);
  const h = cpu.regs.isFlagSet(Flag.H);
  const n = cpu.regs.isFlagSet(Flag.N);

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

  cpu.regs.write(Register.A, a);
  cpu.regs.setFlag(Flag.Z, a === 0);
  cpu.regs.setFlag(Flag.H, false);
  cpu.regs.setFlag(Flag.CY, carry);

  return 4;
});

export const complementAccumulator = instruction(({ cpu }) => {
  cpu.regs.write(Register.A, ~cpu.regs.read(Register.A));
  cpu.regs.setFlag(Flag.N, true);
  cpu.regs.setFlag(Flag.H, true);

  return 4;
});
