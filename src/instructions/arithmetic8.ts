import { CpuState } from "../cpu-state";
import { Flag, Register, RegisterPair } from "../regs";
import { addBytes, subtractBytes } from "../utils";
import { instruction, instructionWithImmediateByte } from "./lib";

export const addRegister = instruction((state, reg: Register) => {
  addToAccumulator(state, state.readRegister(reg));
  return 4;
});

export const addIndirectHL = instruction((state) => {
  addToAccumulator(
    state,
    state.readBus(state.readRegisterPair(RegisterPair.HL))
  );
  return 8;
});

export const addImmediate = instructionWithImmediateByte((state, value) => {
  addToAccumulator(state, value);
  return 8;
});

export const addRegisterWithCarry = instruction((state, reg: Register) => {
  addToAccumulator(state, state.readRegister(reg), true);
  return 4;
});

export const addIndirectHLWithCarry = instruction((state) => {
  addToAccumulator(
    state,
    state.readBus(state.readRegisterPair(RegisterPair.HL)),
    true
  );
  return 8;
});

export const addImmediateWithCarry = instructionWithImmediateByte(
  (state, value) => {
    addToAccumulator(state, value, true);
    return 8;
  }
);

function addToAccumulator(state: CpuState, value: number, carry = false) {
  const { result, carryFrom3, carryFrom7 } = addBytes(
    state.readRegister(Register.A),
    value,
    carry && state.isFlagSet(Flag.CY)
  );

  state.writeRegister(Register.A, result);
  state.setFlag(Flag.Z, result === 0);
  state.setFlag(Flag.N, false);
  state.setFlag(Flag.H, carryFrom3);
  state.setFlag(Flag.CY, carryFrom7);
}

export const subtractRegister = instruction((state, reg: Register) => {
  subtractFromAccumulator(state, state.readRegister(reg));
  return 4;
});

export const subtractIndirectHL = instruction((state) => {
  subtractFromAccumulator(
    state,
    state.readBus(state.readRegisterPair(RegisterPair.HL))
  );
  return 8;
});

export const subtractImmediate = instructionWithImmediateByte(
  (state, value) => {
    subtractFromAccumulator(state, value);
    return 8;
  }
);

export const subtractRegisterWithCarry = instruction((state, reg: Register) => {
  subtractFromAccumulator(state, state.readRegister(reg), true);
  return 4;
});

export const subtractIndirectHLWithCarry = instruction((state) => {
  subtractFromAccumulator(
    state,
    state.readBus(state.readRegisterPair(RegisterPair.HL)),
    true
  );
  return 8;
});

export const subtractImmediateWithCarry = instructionWithImmediateByte(
  (state, value) => {
    subtractFromAccumulator(state, value, true);
    return 8;
  }
);

function subtractFromAccumulator(
  state: CpuState,
  value: number,
  carry = false
) {
  const { result, borrowTo3, borrowTo7 } = subtractBytes(
    state.readRegister(Register.A),
    value,
    carry && state.isFlagSet(Flag.CY)
  );

  state.writeRegister(Register.A, result);
  state.setFlag(Flag.Z, result === 0);
  state.setFlag(Flag.N, true);
  state.setFlag(Flag.H, borrowTo3);
  state.setFlag(Flag.CY, borrowTo7);
}

export const compareRegister = instruction((state, reg: Register) => {
  compareWithAccumulator(state, state.readRegister(reg));
  return 4;
});

export const compareIndirectHL = instruction((state) => {
  compareWithAccumulator(
    state,
    state.readBus(state.readRegisterPair(RegisterPair.HL))
  );
  return 8;
});

export const compareImmediate = instructionWithImmediateByte((state, value) => {
  compareWithAccumulator(state, value);
  return 8;
});

function compareWithAccumulator(state: CpuState, value: number) {
  const { result, borrowTo3, borrowTo7 } = subtractBytes(
    state.readRegister(Register.A),
    value
  );

  state.setFlag(Flag.Z, result === 0);
  state.setFlag(Flag.N, true);
  state.setFlag(Flag.H, borrowTo3);
  state.setFlag(Flag.CY, borrowTo7);
}

export const incrementRegister = instruction((state, reg: Register) => {
  state.writeRegister(
    reg,
    incrementAndSetFlags(state, state.readRegister(reg))
  );
  return 4;
});

export const incrementIndirectHL = instruction((state) => {
  const address = state.readRegisterPair(RegisterPair.HL);

  state.writeBus(address, incrementAndSetFlags(state, state.readBus(address)));

  return 12;
});

function incrementAndSetFlags(state: CpuState, value: number) {
  const { result, carryFrom3 } = addBytes(value, 1);

  state.setFlag(Flag.Z, result === 0);
  state.setFlag(Flag.N, false);
  state.setFlag(Flag.H, carryFrom3);

  return result;
}

export const decrementRegister = instruction((state, reg: Register) => {
  state.writeRegister(reg, decrement(state, state.readRegister(reg)));
  return 4;
});

export const decrementIndirectHL = instruction((state) => {
  const address = state.readRegisterPair(RegisterPair.HL);
  state.writeBus(address, decrement(state, state.readBus(address)));
  return 12;
});

function decrement(state: CpuState, value: number) {
  const { result, borrowTo3 } = subtractBytes(value, 1);

  state.setFlag(Flag.Z, result === 0);
  state.setFlag(Flag.N, true);
  state.setFlag(Flag.H, borrowTo3);

  return result;
}

export const andRegister = instruction((state, reg: Register) => {
  andAccumulator(state, state.readRegister(reg));
  return 4;
});

export const andIndirectHL = instruction((state) => {
  andAccumulator(state, state.readBus(state.readRegisterPair(RegisterPair.HL)));
  return 8;
});

export const andImmediate = instructionWithImmediateByte((state, value) => {
  andAccumulator(state, value);
  return 8;
});

function andAccumulator(state: CpuState, value: number) {
  const result = state.readRegister(Register.A) & value;

  state.writeRegister(Register.A, result);
  state.setFlag(Flag.Z, result === 0);
  state.setFlag(Flag.N, false);
  state.setFlag(Flag.H, true);
  state.setFlag(Flag.CY, false);
}

export const orRegister = instruction((state, reg: Register) => {
  orAccumulator(state, state.readRegister(reg));
  return 4;
});

export const orIndirectHL = instruction((state) => {
  orAccumulator(state, state.readBus(state.readRegisterPair(RegisterPair.HL)));
  return 8;
});

export const orImmediate = instructionWithImmediateByte((state, value) => {
  orAccumulator(state, value);
  return 8;
});

function orAccumulator(state: CpuState, value: number) {
  const result = state.readRegister(Register.A) | value;

  state.writeRegister(Register.A, result);
  state.setFlag(Flag.Z, result === 0);
  state.setFlag(Flag.N, false);
  state.setFlag(Flag.H, false);
  state.setFlag(Flag.CY, false);
}

export const xorRegister = instruction((state, reg: Register) => {
  xorAccumulator(state, state.readRegister(reg));
  return 4;
});

export const xorIndirectHL = instruction((state) => {
  xorAccumulator(state, state.readBus(state.readRegisterPair(RegisterPair.HL)));
  return 8;
});

export const xorImmediate = instructionWithImmediateByte((state, value) => {
  xorAccumulator(state, value);
  return 8;
});

function xorAccumulator(state: CpuState, value: number) {
  const result = state.readRegister(Register.A) ^ value;

  state.writeRegister(Register.A, result);
  state.setFlag(Flag.Z, result === 0);
  state.setFlag(Flag.N, false);
  state.setFlag(Flag.H, false);
  state.setFlag(Flag.CY, false);
}

export const complementCarryFlag = instruction((state) => {
  state.setFlag(Flag.N, false);
  state.setFlag(Flag.H, false);
  state.setFlag(Flag.CY, !state.isFlagSet(Flag.CY));

  return 4;
});

export const setCarryFlag = instruction((state) => {
  state.setFlag(Flag.N, false);
  state.setFlag(Flag.H, false);
  state.setFlag(Flag.CY, true);

  return 4;
});

export const decimalAdjustAccumulator = instruction((state) => {
  let a = state.readRegister(Register.A);
  const cy = state.isFlagSet(Flag.CY);
  const h = state.isFlagSet(Flag.H);
  const n = state.isFlagSet(Flag.N);

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

  state.writeRegister(Register.A, a);
  state.setFlag(Flag.Z, a === 0);
  state.setFlag(Flag.H, false);
  state.setFlag(Flag.CY, carry);

  return 4;
});

export const complementAccumulator = instruction((state) => {
  state.writeRegister(Register.A, ~state.readRegister(Register.A));
  state.setFlag(Flag.N, true);
  state.setFlag(Flag.H, true);

  return 4;
});
