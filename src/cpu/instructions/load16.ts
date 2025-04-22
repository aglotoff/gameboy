import { Flag, Register, RegisterPair } from "../register";

import {
  addBytes,
  makeInstruction,
  makeInstructionWithImmediateByte,
  makeInstructionWithImmediateWord,
  isNegative,
  popWord,
  pushWord,
} from "./lib";

export const loadRegisterPair = makeInstructionWithImmediateWord(
  (cpu, data, dst: RegisterPair) => {
    cpu.writeRegisterPair(dst, data);
  }
);

export const loadDirectFromStackPointer = makeInstructionWithImmediateWord(
  (cpu, address) => {
    cpu.writeMemory(address, cpu.readRegister(Register.SP_L));

    cpu.beginNextCycle();

    cpu.writeMemory(address + 1, cpu.readRegister(Register.SP_H));

    cpu.beginNextCycle();
  }
);

export const loadStackPointerFromHL = makeInstruction((cpu) => {
  cpu.writeRegisterPair(RegisterPair.SP, cpu.readRegisterPair(RegisterPair.HL));
  cpu.beginNextCycle();
});

export const pushToStack = makeInstruction((cpu, pair: RegisterPair) => {
  pushWord(cpu, cpu.readRegisterPair(pair));
  cpu.beginNextCycle();
});

export const popFromStack = makeInstruction((cpu, pair: RegisterPair) => {
  cpu.writeRegisterPair(pair, popWord(cpu));
});

export const loadHLFromAdjustedStackPointer = makeInstructionWithImmediateByte(
  (cpu, e) => {
    const {
      result: lsb,
      carryFrom3,
      carryFrom7,
    } = addBytes(cpu.readRegister(Register.SP_L), e);

    cpu.writeRegister(Register.L, lsb);

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

    cpu.writeRegister(Register.H, msb);
  }
);
