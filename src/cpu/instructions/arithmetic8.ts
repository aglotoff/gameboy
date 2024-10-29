import { CpuState } from "../cpu-state";
import { Flag, Register, RegisterPair } from "../register";
import {
  addBytes,
  instruction,
  instructionWithImmediateByte,
  subtractBytes,
} from "./lib";

export const addRegister = instruction(function (reg: Register) {
  addToAccumulator.call(this, this.readRegister(reg));
});

export const addIndirectHL = instruction(function () {
  const data = this.readBus(this.readRegisterPair(RegisterPair.HL));
  this.cycle();

  addToAccumulator.call(this, data);
});

export const addImmediate = instructionWithImmediateByte(function (value) {
  addToAccumulator.call(this, value);
});

export const addRegisterWithCarry = instruction(function (reg: Register) {
  addToAccumulator.call(this, this.readRegister(reg), true);
});

export const addIndirectHLWithCarry = instruction(function () {
  const data = this.readBus(this.readRegisterPair(RegisterPair.HL));
  this.cycle();

  addToAccumulator.call(this, data, true);
});

export const addImmediateWithCarry = instructionWithImmediateByte(function (
  value
) {
  addToAccumulator.call(this, value, true);
});

function addToAccumulator(this: CpuState, value: number, carry = false) {
  const { result, carryFrom3, carryFrom7 } = addBytes(
    this.readRegister(Register.A),
    value,
    carry && this.isFlagSet(Flag.CY)
  );

  this.writeRegister(Register.A, result);
  this.setFlag(Flag.Z, result === 0);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, carryFrom3);
  this.setFlag(Flag.CY, carryFrom7);
}

export const subtractRegister = instruction(function (reg: Register) {
  subtractFromAccumulator.call(this, this.readRegister(reg));
});

export const subtractIndirectHL = instruction(function () {
  const data = this.readBus(this.readRegisterPair(RegisterPair.HL));
  this.cycle();

  subtractFromAccumulator.call(this, data);
});

export const subtractImmediate = instructionWithImmediateByte(function (value) {
  subtractFromAccumulator.call(this, value);
});

export const subtractRegisterWithCarry = instruction(function (reg: Register) {
  subtractFromAccumulator.call(this, this.readRegister(reg), true);
});

export const subtractIndirectHLWithCarry = instruction(function () {
  const data = this.readBus(this.readRegisterPair(RegisterPair.HL));
  this.cycle();

  subtractFromAccumulator.call(this, data, true);
});

export const subtractImmediateWithCarry = instructionWithImmediateByte(
  function (value) {
    subtractFromAccumulator.call(this, value, true);
  }
);

function subtractFromAccumulator(this: CpuState, value: number, carry = false) {
  const { result, borrowTo3, borrowTo7 } = subtractBytes(
    this.readRegister(Register.A),
    value,
    carry && this.isFlagSet(Flag.CY)
  );

  this.writeRegister(Register.A, result);
  this.setFlag(Flag.Z, result === 0);
  this.setFlag(Flag.N, true);
  this.setFlag(Flag.H, borrowTo3);
  this.setFlag(Flag.CY, borrowTo7);
}

export const compareRegister = instruction(function (reg: Register) {
  compareWithAccumulator.call(this, this.readRegister(reg));
});

export const compareIndirectHL = instruction(function () {
  const data = this.readBus(this.readRegisterPair(RegisterPair.HL));
  this.cycle();

  compareWithAccumulator.call(this, data);
});

export const compareImmediate = instructionWithImmediateByte(function (value) {
  compareWithAccumulator.call(this, value);
});

function compareWithAccumulator(this: CpuState, value: number) {
  const { result, borrowTo3, borrowTo7 } = subtractBytes(
    this.readRegister(Register.A),
    value
  );

  this.setFlag(Flag.Z, result === 0);
  this.setFlag(Flag.N, true);
  this.setFlag(Flag.H, borrowTo3);
  this.setFlag(Flag.CY, borrowTo7);
}

export const incrementRegister = instruction(function (reg: Register) {
  this.writeRegister(
    reg,
    incrementAndSetFlags.call(this, this.readRegister(reg))
  );
});

export const incrementIndirectHL = instruction(function () {
  const address = this.readRegisterPair(RegisterPair.HL);
  const data = this.readBus(address);
  this.cycle();

  this.writeBus(address, incrementAndSetFlags.call(this, data));
  this.cycle();
});

function incrementAndSetFlags(this: CpuState, value: number) {
  const { result, carryFrom3 } = addBytes(value, 1);

  this.setFlag(Flag.Z, result === 0);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, carryFrom3);

  return result;
}

export const decrementRegister = instruction(function (reg: Register) {
  this.writeRegister(reg, decrement.call(this, this.readRegister(reg)));
});

export const decrementIndirectHL = instruction(function () {
  const address = this.readRegisterPair(RegisterPair.HL);
  const data = this.readBus(address);
  this.cycle();

  this.writeBus(address, decrement.call(this, data));
  this.cycle();
});

function decrement(this: CpuState, value: number) {
  const { result, borrowTo3 } = subtractBytes(value, 1);

  this.setFlag(Flag.Z, result === 0);
  this.setFlag(Flag.N, true);
  this.setFlag(Flag.H, borrowTo3);

  return result;
}

export const andRegister = instruction(function (reg: Register) {
  andAccumulator.call(this, this.readRegister(reg));
});

export const andIndirectHL = instruction(function () {
  const data = this.readBus(this.readRegisterPair(RegisterPair.HL));
  this.cycle();

  andAccumulator.call(this, data);
});

export const andImmediate = instructionWithImmediateByte(function (value) {
  andAccumulator.call(this, value);
});

function andAccumulator(this: CpuState, value: number) {
  const result = this.readRegister(Register.A) & value;

  this.writeRegister(Register.A, result);
  this.setFlag(Flag.Z, result === 0);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, true);
  this.setFlag(Flag.CY, false);
}

export const orRegister = instruction(function (reg: Register) {
  orAccumulator.call(this, this.readRegister(reg));
});

export const orIndirectHL = instruction(function () {
  const data = this.readBus(this.readRegisterPair(RegisterPair.HL));
  this.cycle();

  orAccumulator.call(this, data);
});

export const orImmediate = instructionWithImmediateByte(function (value) {
  orAccumulator.call(this, value);
});

function orAccumulator(this: CpuState, value: number) {
  const result = this.readRegister(Register.A) | value;

  this.writeRegister(Register.A, result);
  this.setFlag(Flag.Z, result === 0);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, false);
  this.setFlag(Flag.CY, false);
}

export const xorRegister = instruction(function (reg: Register) {
  xorAccumulator.call(this, this.readRegister(reg));
});

export const xorIndirectHL = instruction(function () {
  const data = this.readBus(this.readRegisterPair(RegisterPair.HL));
  this.cycle();

  xorAccumulator.call(this, data);
});

export const xorImmediate = instructionWithImmediateByte(function (value) {
  xorAccumulator.call(this, value);
});

function xorAccumulator(this: CpuState, value: number) {
  const result = this.readRegister(Register.A) ^ value;

  this.writeRegister(Register.A, result);
  this.setFlag(Flag.Z, result === 0);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, false);
  this.setFlag(Flag.CY, false);
}

export const complementCarryFlag = instruction(function () {
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, false);
  this.setFlag(Flag.CY, !this.isFlagSet(Flag.CY));
});

export const setCarryFlag = instruction(function () {
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, false);
  this.setFlag(Flag.CY, true);
});

export const decimalAdjustAccumulator = instruction(function () {
  let a = this.readRegister(Register.A);
  const cy = this.isFlagSet(Flag.CY);
  const h = this.isFlagSet(Flag.H);
  const n = this.isFlagSet(Flag.N);

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

  this.writeRegister(Register.A, a);
  this.setFlag(Flag.Z, a === 0);
  this.setFlag(Flag.H, false);
  this.setFlag(Flag.CY, carry);
});

export const complementAccumulator = instruction(function () {
  this.writeRegister(Register.A, ~this.readRegister(Register.A));
  this.setFlag(Flag.N, true);
  this.setFlag(Flag.H, true);
});
