import { Flag, Register, RegisterPair } from "../register";

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
    cpu.writeBus(address, cpu.getRegister(Register.SP_L));

    cpu.beginNextCycle();

    cpu.writeBus(address + 1, cpu.getRegister(Register.SP_H));

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

export const popFromStack = instruction((cpu, pair: RegisterPair) => {
  cpu.setRegisterPair(pair, popWord(cpu));
});

export const loadHLFromAdjustedStackPointer = instructionWithImmediateByte(
  (cpu, e) => {
    const {
      result: lsb,
      carryFrom3,
      carryFrom7,
    } = addBytes(cpu.getRegister(Register.SP_L), e);

    cpu.setRegister(Register.L, lsb);

    cpu.setFlag(Flag.Z, false);
    cpu.setFlag(Flag.N, false);
    cpu.setFlag(Flag.H, carryFrom3);
    cpu.setFlag(Flag.CY, carryFrom7);

    cpu.beginNextCycle();

    const { result: msb } = addBytes(
      cpu.getRegister(Register.SP_H),
      isNegative(e) ? 0xff : 0x00,
      carryFrom7
    );

    cpu.setRegister(Register.H, msb);
  }
);
