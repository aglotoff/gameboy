import { Register, RegisterPair } from "../register";
import { wrapDecrementWord, wrapIncrementWord } from "../../utils";
import {
  instruction,
  instructionWithImmediateByte,
  instructionWithImmediateWord,
} from "./lib";

export const loadRegisterFromRegister = instruction(function (
  dst: Register,
  src: Register
) {
  this.writeRegister(dst, this.readRegister(src));
  return 0;
});

export const loadRegisterFromImmediate = instructionWithImmediateByte(function (
  data,
  dst: Register
) {
  this.writeRegister(dst, data);
  return 0;
});

export const loadRegisterFromIndirectHL = instruction(function (dst: Register) {
  const data = this.readBus(this.readRegisterPair(RegisterPair.HL));
  this.writeRegister(dst, data);
  return 4;
});

export const loadIndirectHLFromRegister = instruction(function (src: Register) {
  this.writeBus(this.readRegisterPair(RegisterPair.HL), this.readRegister(src));
  return 4;
});

export const loadIndirectHLFromImmediateData = instructionWithImmediateByte(
  function (data) {
    this.writeBus(this.readRegisterPair(RegisterPair.HL), data);
    return 4;
  }
);

export const loadAccumulatorFromIndirectBC = instruction(function () {
  const data = this.readBus(this.readRegisterPair(RegisterPair.BC));
  this.writeRegister(Register.A, data);
  return 4;
});

export const loadAccumulatorFromIndirectDE = instruction(function () {
  const data = this.readBus(this.readRegisterPair(RegisterPair.DE));
  this.writeRegister(Register.A, data);
  return 4;
});

export const loadIndirectBCFromAccumulator = instruction(function () {
  this.writeBus(
    this.readRegisterPair(RegisterPair.BC),
    this.readRegister(Register.A)
  );
  return 4;
});

export const loadIndirectDEFromAccumulator = instruction(function () {
  this.writeBus(
    this.readRegisterPair(RegisterPair.DE),
    this.readRegister(Register.A)
  );
  return 4;
});

export const loadAccumulatorFromDirectWord = instructionWithImmediateWord(
  function (address) {
    this.writeRegister(Register.A, this.readBus(address));
    return 4;
  }
);

export const loadDirectWordFromAccumulator = instructionWithImmediateWord(
  function (address) {
    this.writeBus(address, this.readRegister(Register.A));
    return 4;
  }
);

export const loadAccumulatorFromIndirectC = instruction(function () {
  const address = 0xff00 + this.readRegister(Register.C);
  this.writeRegister(Register.A, this.readBus(address));
  return 4;
});

export const loadIndirectCFromAccumulator = instruction(function () {
  const address = 0xff00 + this.readRegister(Register.C);
  this.writeBus(address, this.readRegister(Register.A));
  return 4;
});

export const loadAccumulatorFromDirectByte = instructionWithImmediateByte(
  function (offset) {
    const address = 0xff00 + offset;
    this.writeRegister(Register.A, this.readBus(address));
    return 4;
  }
);

export const loadDirectByteFromAccumulator = instructionWithImmediateByte(
  function (offset) {
    const address = 0xff00 + offset;
    this.writeBus(address, this.readRegister(Register.A));
    return 4;
  }
);

export const loadAccumulatorFromIndirectHLDecrement = instruction(function () {
  const address = this.readRegisterPair(RegisterPair.HL);
  const data = this.readBus(address);
  this.writeRegister(Register.A, data);
  this.writeRegisterPair(RegisterPair.HL, address - 1);
  return 4;
});

export const loadAccumulatorFromIndirectHLIncrement = instruction(function () {
  const address = this.readRegisterPair(RegisterPair.HL);
  const data = this.readBus(address);
  this.writeRegister(Register.A, data);
  this.writeRegisterPair(RegisterPair.HL, wrapIncrementWord(address));
  return 4;
});

export const loadIndirectHLDecrementFromAccumulator = instruction(function () {
  const address = this.readRegisterPair(RegisterPair.HL);
  this.writeBus(address, this.readRegister(Register.A));
  this.writeRegisterPair(RegisterPair.HL, wrapDecrementWord(address));
  return 4;
});

export const loadIndirectHLIncrementFromAccumulator = instruction(function () {
  const address = this.readRegisterPair(RegisterPair.HL);
  this.writeBus(address, this.readRegister(Register.A));
  this.writeRegisterPair(RegisterPair.HL, wrapIncrementWord(address));
  return 4;
});
