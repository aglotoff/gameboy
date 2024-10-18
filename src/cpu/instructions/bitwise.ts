import { Flag, Register, RegisterPair } from "../register";
import { resetBit, setBit, testBit } from "../../utils";
import { instruction } from "./lib";

export const rotateLeftCircularAccumulator = instruction(function () {
  const { result, carry } = rotateLeftCircular(this.readRegister(Register.A));

  this.writeRegister(Register.A, result);
  this.setFlag(Flag.Z, false);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, false);
  this.setFlag(Flag.CY, carry);

  return 0;
});

export const rotateLeftCircularRegister = instruction(function (reg: Register) {
  const { result, carry } = rotateLeftCircular(this.readRegister(reg));

  this.writeRegister(reg, result);
  this.setFlag(Flag.Z, result === 0);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, false);
  this.setFlag(Flag.CY, carry);

  return 0;
});

export const rotateLeftCircularIndirectHL = instruction(function () {
  const address = this.readRegisterPair(RegisterPair.HL);

  const data = this.readBus(address);
  this.cycle();

  const { result, carry } = rotateLeftCircular(data);

  this.writeBus(address, result);
  this.cycle();

  this.setFlag(Flag.Z, result === 0);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, false);
  this.setFlag(Flag.CY, carry);

  return 0;
});

function rotateLeftCircular(value: number) {
  return {
    result: ((value << 1) | (value >> 7)) & 0xff,
    carry: (value & 0x80) != 0,
  };
}

export const rotateRightCircularAccumulator = instruction(function () {
  const { result, carry } = rotateRightCircular(this.readRegister(Register.A));

  this.writeRegister(Register.A, result);
  this.setFlag(Flag.Z, false);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, false);
  this.setFlag(Flag.CY, carry);

  return 0;
});

export const rotateRightCircularRegister = instruction(function (
  reg: Register
) {
  const { result, carry } = rotateRightCircular(this.readRegister(reg));

  this.writeRegister(reg, result);
  this.setFlag(Flag.Z, result === 0);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, false);
  this.setFlag(Flag.CY, carry);

  return 0;
});

export const rotateRightCircularIndirectHL = instruction(function () {
  const address = this.readRegisterPair(RegisterPair.HL);
  const data = this.readBus(address);
  this.cycle();

  const { result, carry } = rotateRightCircular(data);

  this.writeBus(address, result);
  this.cycle();

  this.setFlag(Flag.Z, result === 0);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, false);
  this.setFlag(Flag.CY, carry);

  return 0;
});

function rotateRightCircular(value: number) {
  return {
    result: ((value >> 1) | (value << 7)) & 0xff,
    carry: (value & 0x01) != 0,
  };
}

export const rotateLeftAccumulator = instruction(function () {
  const { result, carry } = rotateLeft(
    this.readRegister(Register.A),
    this.isFlagSet(Flag.CY)
  );

  this.writeRegister(Register.A, result);
  this.setFlag(Flag.Z, false);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, false);
  this.setFlag(Flag.CY, carry);

  return 0;
});

export const rotateLeftRegister = instruction(function (reg: Register) {
  const { result, carry } = rotateLeft(
    this.readRegister(reg),
    this.isFlagSet(Flag.CY)
  );

  this.writeRegister(reg, result);
  this.setFlag(Flag.Z, result === 0);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, false);
  this.setFlag(Flag.CY, carry);

  return 0;
});

export const rotateLeftIndirectHL = instruction(function () {
  const address = this.readRegisterPair(RegisterPair.HL);
  const data = this.readBus(address);
  this.cycle();

  const { result, carry } = rotateLeft(data, this.isFlagSet(Flag.CY));

  this.writeBus(address, result);
  this.cycle();

  this.setFlag(Flag.Z, result === 0);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, false);
  this.setFlag(Flag.CY, carry);

  return 0;
});

function rotateLeft(value: number, carry: boolean) {
  return {
    result: ((value << 1) & 0xff) | (carry ? 0x01 : 0x00),
    carry: (value & 0x80) != 0,
  };
}

export const rotateRightAccumulator = instruction(function () {
  const { result, carry } = rotateRight(
    this.readRegister(Register.A),
    this.isFlagSet(Flag.CY)
  );

  this.writeRegister(Register.A, result);
  this.setFlag(Flag.Z, false);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, false);
  this.setFlag(Flag.CY, carry);

  return 0;
});

export const rotateRightRegister = instruction(function (reg: Register) {
  const { result, carry } = rotateRight(
    this.readRegister(reg),
    this.isFlagSet(Flag.CY)
  );

  this.writeRegister(reg, result);
  this.setFlag(Flag.Z, result === 0);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, false);
  this.setFlag(Flag.CY, carry);

  return 0;
});

export const rotateRightIndirectHL = instruction(function () {
  const address = this.readRegisterPair(RegisterPair.HL);
  const data = this.readBus(address);
  this.cycle();

  const { result, carry } = rotateRight(data, this.isFlagSet(Flag.CY));

  this.writeBus(address, result);
  this.cycle();

  this.setFlag(Flag.Z, result === 0);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, false);
  this.setFlag(Flag.CY, carry);

  return 0;
});

function rotateRight(value: number, carry: boolean) {
  return {
    result: ((value >> 1) & 0xff) | (carry ? 0x80 : 0x00),
    carry: (value & 0x01) != 0,
  };
}

export const shiftLeftArithmeticRegister = instruction(function (
  reg: Register
) {
  const { result, carry } = shiftLeftArithmetic(this.readRegister(reg));

  this.writeRegister(reg, result);
  this.setFlag(Flag.Z, result === 0);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, false);
  this.setFlag(Flag.CY, carry);

  return 0;
});

export const shiftLeftArithmeticIndirectHL = instruction(function () {
  const address = this.readRegisterPair(RegisterPair.HL);
  const data = this.readBus(address);
  this.cycle();

  const { result, carry } = shiftLeftArithmetic(data);

  this.writeBus(address, result);
  this.cycle();

  this.setFlag(Flag.Z, result === 0);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, false);
  this.setFlag(Flag.CY, carry);

  return 0;
});

function shiftLeftArithmetic(value: number) {
  return {
    result: (value << 1) & 0xff,
    carry: (value & 0x80) !== 0,
  };
}

export const shiftRightArithmeticRegister = instruction(function (
  reg: Register
) {
  const { result, carry } = shiftRightArithmetic(this.readRegister(reg));

  this.writeRegister(reg, result);
  this.setFlag(Flag.Z, result === 0);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, false);
  this.setFlag(Flag.CY, carry);

  return 0;
});

export const shiftRightArithmeticIndirectHL = instruction(function () {
  const address = this.readRegisterPair(RegisterPair.HL);
  const data = this.readBus(address);
  this.cycle();

  const { result, carry } = shiftRightArithmetic(data);

  this.writeBus(address, result);
  this.cycle();

  this.setFlag(Flag.Z, result === 0);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, false);
  this.setFlag(Flag.CY, carry);

  return 0;
});

function shiftRightArithmetic(value: number) {
  return {
    result: ((value >> 1) & 0xff) | (value & 0x80),
    carry: (value & 0x01) !== 0,
  };
}

export const shiftRightLogicalRegister = instruction(function (reg: Register) {
  const { result, carry } = shiftRightLogical(this.readRegister(reg));

  this.writeRegister(reg, result);
  this.setFlag(Flag.Z, result === 0);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, false);
  this.setFlag(Flag.CY, carry);

  return 0;
});

export const shiftRightLogicalIndirectHL = instruction(function () {
  const address = this.readRegisterPair(RegisterPair.HL);
  const data = this.readBus(address);
  this.cycle();

  const { result, carry } = shiftRightLogical(data);

  this.writeBus(address, result);
  this.cycle();

  this.setFlag(Flag.Z, result === 0);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, false);
  this.setFlag(Flag.CY, carry);

  return 0;
});

function shiftRightLogical(value: number) {
  return {
    result: (value >> 1) & 0xff,
    carry: (value & 0x01) !== 0,
  };
}

export const swapNibblesRegister = instruction(function (reg: Register) {
  const result = swapNibbles(this.readRegister(reg));

  this.writeRegister(reg, result);
  this.setFlag(Flag.Z, result === 0);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, false);
  this.setFlag(Flag.CY, false);

  return 0;
});

export const swapNibblesIndirectHL = instruction(function () {
  const address = this.readRegisterPair(RegisterPair.HL);
  const data = this.readBus(address);
  this.cycle();

  const result = swapNibbles(data);

  this.writeBus(address, result);
  this.cycle();

  this.setFlag(Flag.Z, result === 0);
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, false);
  this.setFlag(Flag.CY, false);

  return 0;
});

function swapNibbles(value: number) {
  return ((value & 0xf) << 4) | ((value >> 4) & 0xf);
}

export const testBitRegister = instruction(function (
  bit: number,
  reg: Register
) {
  this.setFlag(Flag.Z, !testBit(this.readRegister(reg), bit));
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, true);

  return 0;
});

export const testBitIndirectHL = instruction(function (bit: number) {
  const address = this.readRegisterPair(RegisterPair.HL);
  const data = this.readBus(address);
  this.cycle();

  this.setFlag(Flag.Z, !testBit(data, bit));
  this.setFlag(Flag.N, false);
  this.setFlag(Flag.H, true);

  return 0;
});

export const resetBitRegister = instruction(function (
  bit: number,
  reg: Register
) {
  this.writeRegister(reg, resetBit(this.readRegister(reg), bit));
  return 0;
});

export const resetBitIndirectHL = instruction(function (bit: number) {
  const address = this.readRegisterPair(RegisterPair.HL);
  const data = this.readBus(address);
  this.cycle();

  this.writeBus(address, resetBit(data, bit));
  this.cycle();

  return 0;
});

export const setBitRegister = instruction(function (
  bit: number,
  reg: Register
) {
  this.writeRegister(reg, setBit(this.readRegister(reg), bit));
  return 0;
});

export const setBitIndirectHL = instruction(function (bit: number) {
  const address = this.readRegisterPair(RegisterPair.HL);
  const data = this.readBus(address);
  this.cycle();

  this.writeBus(address, setBit(data, bit));
  this.cycle();

  return 0;
});
