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
    cpu.setRegisterPair(dst, data);
  }
);

export const loadDirectFromStackPointer = instructionWithImmediateWord(
  (cpu, address) => {
    const data = cpu.getRegisterPair(RegisterPair.SP);
    cpu.writeBus(address, getLSB(data));
    cpu.beginNextCycle();
    cpu.writeBus(address + 1, getMSB(data));
    cpu.beginNextCycle();
  }
);

export const loadStackPointerFromHL = instruction((cpu) => {
  cpu.setRegisterPair(RegisterPair.SP, cpu.getRegisterPair(RegisterPair.HL));
  cpu.beginNextCycle();
});

export const pushToStack = instruction((cpu, pair: RegisterPair) => {
  pushWord(cpu, cpu.getRegisterPair(pair));
  cpu.beginNextCycle();
});

export const popFromStack = instruction((cpu, rr: RegisterPair) => {
  cpu.setRegisterPair(rr, popWord(cpu));
});

export const loadHLFromAdjustedStackPointer = instructionWithImmediateByte(
  (cpu, e) => {
    const {
      result: lsb,
      carryFrom3,
      carryFrom7,
    } = addBytes(cpu.getRegister(Register.SP_L), e);

    const { result: msb } = addBytes(
      cpu.getRegister(Register.SP_H),
      isNegative(e) ? 0xff : 0x00,
      carryFrom7
    );

    cpu.setRegisterPair(RegisterPair.HL, makeWord(msb, lsb));
    // Loading L on first cycle, H on second
    cpu.beginNextCycle();

    cpu.setFlag(Flag.Z, false);
    cpu.setFlag(Flag.N, false);
    cpu.setFlag(Flag.H, carryFrom3);
    cpu.setFlag(Flag.CY, carryFrom7);
  }
);
