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
  cpu.setRegisterPair(RegisterPair.PC, address);
  cpu.beginNextCycle();
});

export const jumpToHL = instruction((cpu) => {
  cpu.setRegisterPair(RegisterPair.PC, cpu.getRegisterPair(RegisterPair.HL));
});

export const jumpConditional = instructionWithImmediateWord(
  (cpu, address, condition: Condition) => {
    if (!checkCondition(cpu, condition)) {
      return;
    }

    cpu.setRegisterPair(RegisterPair.PC, address);

    cpu.beginNextCycle();
  }
);

export const relativeJump = instructionWithImmediateByte((cpu, offset) => {
  // TODO: check timing

  const { result: lsb, carryFrom7 } = addBytes(
    cpu.getRegister(Register.PC_L),
    offset
  );

  const { result: msb } = addBytes(
    cpu.getRegister(Register.PC_H),
    isNegative(offset) ? 0xff : 0x00,
    carryFrom7
  );

  cpu.beginNextCycle();

  cpu.setRegisterPair(RegisterPair.PC, makeWord(msb, lsb));
});

export const relativeJumpConditional = instructionWithImmediateByte(
  (cpu, offset, condition: Condition) => {
    if (!checkCondition(cpu, condition)) {
      return;
    }

    const { result: lsb, carryFrom7 } = addBytes(
      cpu.getRegister(Register.PC_L),
      offset
    );

    const { result: msb } = addBytes(
      cpu.getRegister(Register.PC_H),
      isNegative(offset) ? 0xff : 0x00,
      carryFrom7
    );

    cpu.beginNextCycle();

    cpu.setRegisterPair(RegisterPair.PC, makeWord(msb, lsb));
  }
);

export const callFunction = instructionWithImmediateWord((cpu, address) => {
  pushProgramCounter(cpu);
  cpu.setRegisterPair(RegisterPair.PC, address);

  cpu.beginNextCycle();
});

export const callFunctionConditional = instructionWithImmediateWord(
  (cpu, address, condition: Condition) => {
    if (!checkCondition(cpu, condition)) {
      return;
    }

    pushProgramCounter(cpu);
    cpu.setRegisterPair(RegisterPair.PC, address);

    cpu.beginNextCycle();
  }
);

export const returnFromFunction = instruction((cpu) => {
  popProgramCounter(cpu);
});

export const returnFromFunctionConditional = instruction(
  (cpu, condition: Condition) => {
    let result = checkCondition(cpu, condition);
    cpu.beginNextCycle();

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
  cpu.setRegisterPair(RegisterPair.PC, popWord(cpu));
  cpu.beginNextCycle();
}

export const restartFunction = instruction((cpu, address: number) => {
  pushProgramCounter(cpu);

  cpu.setRegisterPair(RegisterPair.PC, makeWord(0x00, address));

  cpu.beginNextCycle();
});

function pushProgramCounter(cpu: CpuState) {
  pushWord(cpu, cpu.getRegisterPair(RegisterPair.PC));
}
