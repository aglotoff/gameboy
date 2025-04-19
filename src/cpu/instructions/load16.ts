import { Flag, RegisterPair } from "../register";
import { getLSB, getMSB } from "../../utils";
import {
  addSignedByteToWord,
  instruction,
  instructionWithImmediateByte,
  instructionWithImmediateWord,
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
    cpu.cycle();
    cpu.writeBus(address + 1, getMSB(data));
    cpu.cycle();
  }
);

export const loadStackPointerFromHL = instruction((cpu) => {
  cpu.writeRegisterPair(RegisterPair.SP, cpu.readRegisterPair(RegisterPair.HL));
  cpu.cycle();
});

export const pushToStack = instruction((cpu, pair: RegisterPair) => {
  pushWord(cpu, cpu.readRegisterPair(pair));
});

export const popFromStack = instruction((cpu, rr: RegisterPair) => {
  cpu.writeRegisterPair(rr, popWord(cpu));
});

export const loadHLFromAdjustedStackPointer = instructionWithImmediateByte(
  (cpu, e) => {
    const { result, carryFrom3, carryFrom7 } = addSignedByteToWord(
      cpu.readRegisterPair(RegisterPair.SP),
      e
    );

    cpu.writeRegisterPair(RegisterPair.HL, result);
    // Loading L on first cycle, H on second
    cpu.cycle();

    cpu.setFlag(Flag.Z, false);
    cpu.setFlag(Flag.N, false);
    cpu.setFlag(Flag.H, carryFrom3);
    cpu.setFlag(Flag.CY, carryFrom7);
  }
);
