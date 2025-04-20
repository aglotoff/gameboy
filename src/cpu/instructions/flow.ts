import { CpuState } from "../cpu-state";
import { Register, RegisterPair } from "../register";
import {
  makeWord,
  wrappingDecrementByte,
  wrappingIncrementByte,
} from "../../utils";
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
    // FIXME: condition check is performed during M3
    if (!checkCondition(cpu, condition)) {
      return;
    }

    cpu.setRegisterPair(RegisterPair.PC, address);

    cpu.beginNextCycle();
  }
);

export const relativeJump = instructionWithImmediateByte(doRelativeJump);

export const relativeJumpConditional = instructionWithImmediateByte(
  (cpu, offset, condition: Condition) => {
    // FIXME: condition check is performed during M2
    if (checkCondition(cpu, condition)) {
      doRelativeJump(cpu, offset);
    }
  }
);

function doRelativeJump(cpu: CpuState, offset: number) {
  const isOffsetNegative = isNegative(offset);

  const { result: lsb, carryFrom7 } = addBytes(
    cpu.getRegister(Register.PC_L),
    offset
  );

  let msb = cpu.getRegister(Register.PC_H);

  if (carryFrom7 && !isOffsetNegative) {
    msb = wrappingIncrementByte(msb);
  } else if (!carryFrom7 && isOffsetNegative) {
    msb = wrappingDecrementByte(msb);
  }

  cpu.beginNextCycle();

  cpu.setRegisterPair(RegisterPair.PC, makeWord(msb, lsb));
}

export const callFunction = instructionWithImmediateWord(doCallFunction);

export const callFunctionConditional = instructionWithImmediateWord(
  (cpu, address, condition: Condition) => {
    // FIXME: condition check is performed during M3
    if (checkCondition(cpu, condition)) {
      doCallFunction(cpu, address);
    }
  }
);

export const restartFunction = instruction((cpu, lowAddressByte: number) => {
  doCallFunction(cpu, makeWord(0x00, lowAddressByte));
});

function doCallFunction(cpu: CpuState, address: number) {
  pushWord(cpu, cpu.getRegisterPair(RegisterPair.PC));

  cpu.setRegisterPair(RegisterPair.PC, address);

  cpu.beginNextCycle();
}

export const returnFromFunction = instruction((cpu) => {
  doReturn(cpu);
});

export const returnFromFunctionConditional = instruction(
  (cpu, condition: Condition) => {
    const result = checkCondition(cpu, condition);

    cpu.beginNextCycle();

    if (result) {
      doReturn(cpu);
    }
  }
);

export const returnFromInterruptHandler = instruction((cpu) => {
  doReturn(cpu);
  cpu.setInterruptMasterEnable(true);
});

function doReturn(cpu: CpuState) {
  cpu.setRegisterPair(RegisterPair.PC, popWord(cpu));
  cpu.beginNextCycle();
}
