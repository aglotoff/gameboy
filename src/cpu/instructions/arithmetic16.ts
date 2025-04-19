import { RegisterPair, Flag, Register } from "../register";
import { getLSB, getMSB, makeWord, wrappingIncrementWord } from "../../utils";
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
  cpu.cycle();
});

export const decrementRegisterPair = instruction((cpu, pair: RegisterPair) => {
  cpu.writeRegisterPair(pair, cpu.readRegisterPair(pair) - 1);
  cpu.cycle();
});

export const addRegisterPair = instruction((cpu, pair: RegisterPair) => {
  const a = cpu.readRegisterPair(RegisterPair.HL);
  const b = cpu.readRegisterPair(pair);

  const { result: lsb, carryFrom7 } = addBytes(getLSB(a), getLSB(b));

  const {
    result: msb,
    carryFrom3: carryFrom11,
    carryFrom7: carryFrom15,
  } = addBytes(getMSB(a), getMSB(b), carryFrom7);

  cpu.writeRegisterPair(RegisterPair.HL, makeWord(msb, lsb));
  // TODO: L on the first cycle, H on the second
  cpu.cycle();

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

  const { result: msb } = addBytes(
    cpu.readRegister(Register.SP_H),
    isNegative(e) ? 0xff : 0x00,
    carryFrom7
  );

  // TODO: addition split in two steps
  cpu.cycle();
  cpu.cycle();

  cpu.writeRegisterPair(RegisterPair.SP, makeWord(msb, lsb));
  cpu.setFlag(Flag.Z, false);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, carryFrom3);
  cpu.setFlag(Flag.CY, carryFrom7);
});
