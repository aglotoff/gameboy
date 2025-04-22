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
  makeInstruction,
  makeInstructionWithImmediateByte,
  makeInstructionWithImmediateWord,
  isNegative,
  popWord,
  pushWord,
} from "./lib";

export const jump = makeInstructionWithImmediateWord((cpu, address) => {
  cpu.writeRegisterPair(RegisterPair.PC, address);
  cpu.beginNextCycle();
});

export const jumpToHL = makeInstruction((cpu) => {
  cpu.writeRegisterPair(RegisterPair.PC, cpu.readRegisterPair(RegisterPair.HL));
});

export const jumpConditional = makeInstructionWithImmediateWord(
  (cpu, address, condition: Condition) => {
    // FIXME: condition check is performed during M3
    if (!checkCondition(cpu, condition)) {
      return;
    }

    cpu.writeRegisterPair(RegisterPair.PC, address);

    cpu.beginNextCycle();
  }
);

export const relativeJump = makeInstructionWithImmediateByte(doRelativeJump);

export const relativeJumpConditional = makeInstructionWithImmediateByte(
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
    cpu.readRegister(Register.PC_L),
    offset
  );

  let msb = cpu.readRegister(Register.PC_H);

  if (carryFrom7 && !isOffsetNegative) {
    msb = wrappingIncrementByte(msb);
  } else if (!carryFrom7 && isOffsetNegative) {
    msb = wrappingDecrementByte(msb);
  }

  cpu.beginNextCycle();

  cpu.writeRegisterPair(RegisterPair.PC, makeWord(msb, lsb));
}

export const callFunction = makeInstructionWithImmediateWord(doCallFunction);

export const callFunctionConditional = makeInstructionWithImmediateWord(
  (cpu, address, condition: Condition) => {
    // FIXME: condition check is performed during M3
    if (checkCondition(cpu, condition)) {
      doCallFunction(cpu, address);
    }
  }
);

export const restartFunction = makeInstruction(
  (cpu, lowAddressByte: number) => {
    doCallFunction(cpu, makeWord(0x00, lowAddressByte));
  }
);

function doCallFunction(cpu: CpuState, address: number) {
  pushWord(cpu, cpu.readRegisterPair(RegisterPair.PC));

  cpu.writeRegisterPair(RegisterPair.PC, address);

  cpu.beginNextCycle();
}

export const returnFromFunction = makeInstruction((cpu) => {
  doReturn(cpu);
});

export const returnFromFunctionConditional = makeInstruction(
  (cpu, condition: Condition) => {
    const result = checkCondition(cpu, condition);

    cpu.beginNextCycle();

    if (result) {
      doReturn(cpu);
    }
  }
);

export const returnFromInterruptHandler = makeInstruction((cpu) => {
  doReturn(cpu);
  cpu.setInterruptMasterEnable(true);
});

function doReturn(cpu: CpuState) {
  cpu.writeRegisterPair(RegisterPair.PC, popWord(cpu));
  cpu.beginNextCycle();
}
