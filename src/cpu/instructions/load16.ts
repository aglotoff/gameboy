import { Flag, Register, RegisterPair } from "../register";
import { getLSB, getMSB, makeWord } from "../../utils";
import {
  addBytes,
  instruction,
  instructionWithImmediateByte,
  instructionWithImmediateWord,
  isNegative,
  popWord,
  pushWord,
} from "./lib";

export const loadRegisterPair = instructionWithImmediateWord(
  (cpu, data, dst: RegisterPair) => {
    cpu.writeRegisterPair(dst, data);
  }
);

export const loadDirectFromStackPointer = instructionWithImmediateWord(
  (cpu, address) => {
    const data = cpu.readRegisterPair(RegisterPair.SP);
    cpu.writeBus(address, getLSB(data));
    cpu.beginNextCycle();
    cpu.writeBus(address + 1, getMSB(data));
    cpu.beginNextCycle();
  }
);

export const loadStackPointerFromHL = instruction((cpu) => {
  cpu.writeRegisterPair(RegisterPair.SP, cpu.readRegisterPair(RegisterPair.HL));
  cpu.beginNextCycle();
});

export const pushToStack = instruction((cpu, pair: RegisterPair) => {
  pushWord(cpu, cpu.readRegisterPair(pair));
  cpu.beginNextCycle();
});

export const popFromStack = instruction((cpu, rr: RegisterPair) => {
  cpu.writeRegisterPair(rr, popWord(cpu));
});

export const loadHLFromAdjustedStackPointer = instructionWithImmediateByte(
  (cpu, e) => {
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

    cpu.writeRegisterPair(RegisterPair.HL, makeWord(msb, lsb));
    // Loading L on first cycle, H on second
    cpu.beginNextCycle();

    cpu.setFlag(Flag.Z, false);
    cpu.setFlag(Flag.N, false);
    cpu.setFlag(Flag.H, carryFrom3);
    cpu.setFlag(Flag.CY, carryFrom7);
  }
);
