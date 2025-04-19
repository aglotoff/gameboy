import { CpuState } from "../cpu-state";
import { Register, RegisterPair } from "../register";
import { makeWord } from "../../utils";
import {
  addBytes,
  checkCondition,
  Condition,
  instruction,
  instructionWithImmediateByte,
  instructionWithImmediateWord,
  isNegative,
  popWord,
  pushWord,
} from "./lib";

export const jump = instructionWithImmediateWord((cpu, address) => {
  cpu.writeRegisterPair(RegisterPair.PC, address);
  cpu.cycle();
});

export const jumpToHL = instruction((cpu) => {
  cpu.writeRegisterPair(RegisterPair.PC, cpu.readRegisterPair(RegisterPair.HL));
});

export const jumpConditional = instructionWithImmediateWord(
  (cpu, address, condition: Condition) => {
    if (!checkCondition(cpu, condition)) {
      return;
    }

    cpu.writeRegisterPair(RegisterPair.PC, address);
    cpu.cycle();
  }
);

export const relativeJump = instructionWithImmediateByte((cpu, offset) => {
  const { result: lsb, carryFrom7 } = addBytes(
    cpu.readRegister(Register.PC_L),
    offset
  );

  const { result: msb } = addBytes(
    cpu.readRegister(Register.PC_H),
    isNegative(offset) ? 0xff : 0x00,
    carryFrom7
  );

  cpu.writeRegisterPair(RegisterPair.PC, makeWord(msb, lsb));
  cpu.cycle();
});

export const relativeJumpConditional = instructionWithImmediateByte(
  (cpu, offset, condition: Condition) => {
    if (!checkCondition(cpu, condition)) {
      return;
    }

    const { result: lsb, carryFrom7 } = addBytes(
      cpu.readRegister(Register.PC_L),
      offset
    );

    const { result: msb } = addBytes(
      cpu.readRegister(Register.PC_H),
      isNegative(offset) ? 0xff : 0x00,
      carryFrom7
    );

    cpu.writeRegisterPair(RegisterPair.PC, makeWord(msb, lsb));
    cpu.cycle();
  }
);

export const callFunction = instructionWithImmediateWord((cpu, address) => {
  pushProgramCounter(cpu);
  cpu.writeRegisterPair(RegisterPair.PC, address);
});

export const callFunctionConditional = instructionWithImmediateWord(
  (cpu, address, condition: Condition) => {
    if (!checkCondition(cpu, condition)) {
      return;
    }

    pushProgramCounter(cpu);
    cpu.writeRegisterPair(RegisterPair.PC, address);
  }
);

export const returnFromFunction = instruction((cpu) => {
  popProgramCounter(cpu);
});

export const returnFromFunctionConditional = instruction(
  (cpu, condition: Condition) => {
    let result = checkCondition(cpu, condition);
    cpu.cycle();

    if (result) {
      popProgramCounter(cpu);
    }
  }
);

export const returnFromInterruptHandler = instruction((cpu) => {
  popProgramCounter(cpu);
  cpu.setInterruptMasterEnable(true);
});

function popProgramCounter(cpu: CpuState) {
  cpu.writeRegisterPair(RegisterPair.PC, popWord(cpu));
  cpu.cycle();
}

export const restartFunction = instruction((cpu, address: number) => {
  pushProgramCounter(cpu);

  cpu.writeRegisterPair(RegisterPair.PC, makeWord(0x00, address));
});

function pushProgramCounter(cpu: CpuState) {
  pushWord(cpu, cpu.readRegisterPair(RegisterPair.PC));
}
