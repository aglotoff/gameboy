import { RegisterPair, Flag, Register } from "../register";
import {
  getLSB,
  getMSB,
  makeWord,
  wrappingDecrementWord,
  wrappingIncrementWord,
} from "../../utils";
import {
  addBytes,
  instruction,
  instructionWithImmediateByte,
  isNegative,
} from "./lib";

export const incrementRegisterPair = instruction((cpu, pair: RegisterPair) => {
  cpu.writeRegisterPair(
    pair,
    wrappingIncrementWord(cpu.readRegisterPair(pair))
  );

  cpu.beginNextCycle();
});

export const decrementRegisterPair = instruction((cpu, pair: RegisterPair) => {
  cpu.writeRegisterPair(
    pair,
    wrappingDecrementWord(cpu.readRegisterPair(pair))
  );

  cpu.beginNextCycle();
});

export const addRegisterPair = instruction((cpu, pair: RegisterPair) => {
  const dataWord = cpu.readRegisterPair(pair);

  const {
    result: lsb,
    carryFrom3,
    carryFrom7,
  } = addBytes(cpu.readRegister(Register.L), getLSB(dataWord));

  cpu.writeRegister(Register.L, lsb);

  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, carryFrom3);
  cpu.setFlag(Flag.CY, carryFrom7);

  cpu.beginNextCycle();

  const {
    result: msb,
    carryFrom3: carryFrom11,
    carryFrom7: carryFrom15,
  } = addBytes(cpu.readRegister(Register.H), getMSB(dataWord), carryFrom7);

  cpu.writeRegister(Register.H, msb);

  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, carryFrom11);
  cpu.setFlag(Flag.CY, carryFrom15);
});

export const addToStackPointer = instructionWithImmediateByte((cpu, e) => {
  const {
    result: lsb,
    carryFrom3,
    carryFrom7,
  } = addBytes(cpu.readRegister(Register.SP_L), e);

  cpu.setFlag(Flag.Z, false);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, carryFrom3);
  cpu.setFlag(Flag.CY, carryFrom7);

  cpu.beginNextCycle();

  const { result: msb } = addBytes(
    cpu.readRegister(Register.SP_H),
    isNegative(e) ? 0xff : 0x00,
    carryFrom7
  );

  cpu.beginNextCycle();

  cpu.writeRegisterPair(RegisterPair.SP, makeWord(msb, lsb));
});
