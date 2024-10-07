import { Condition, CpuState, popWord, pushWord } from "../cpu-state";
import { RegisterPair } from "../regs";
import { addSignedByteToWord, makeWord } from "../utils";
import {
  instruction,
  instructionWithImmediateByte,
  instructionWithImmediateWord,
} from "./lib";

export const jump = instructionWithImmediateWord((state, address) => {
  state.writeRegisterPair(RegisterPair.PC, address);
  return 16;
});

export const jumpToHL = instruction((state) => {
  state.writeRegisterPair(
    RegisterPair.PC,
    state.readRegisterPair(RegisterPair.HL)
  );
  return 4;
});

export const jumpConditional = instructionWithImmediateWord(
  (state, address, condition: Condition) => {
    if (!state.checkCondition(condition)) {
      return 12;
    }

    state.writeRegisterPair(RegisterPair.PC, address);

    return 16;
  }
);

export const relativeJump = instructionWithImmediateByte((state, offset) => {
  const { result } = addSignedByteToWord(
    state.readRegisterPair(RegisterPair.PC),
    offset
  );

  state.writeRegisterPair(RegisterPair.PC, result);

  return 12;
});

export const relativeJumpConditional = instructionWithImmediateByte(
  (state, offset, condition: Condition) => {
    if (!state.checkCondition(condition)) {
      return 8;
    }

    const { result } = addSignedByteToWord(
      state.readRegisterPair(RegisterPair.PC),
      offset
    );

    state.writeRegisterPair(RegisterPair.PC, result);

    return 12;
  }
);

export const callFunction = instructionWithImmediateWord((state, address) => {
  pushProgramCounter(state);
  state.writeRegisterPair(RegisterPair.PC, address);
  return 24;
});

export const callFunctionConditional = instructionWithImmediateWord(
  (state, address, condition: Condition) => {
    if (!state.checkCondition(condition)) {
      return 12;
    }

    pushProgramCounter(state);
    state.writeRegisterPair(RegisterPair.PC, address);

    return 24;
  }
);

export const returnFromFunction = instruction((state) => {
  popProgramCounter(state);
  return 16;
});

export const returnFromFunctionConditional = instruction(
  (state, condition: Condition) => {
    if (!state.checkCondition(condition)) {
      return 8;
    }

    popProgramCounter(state);

    return 20;
  }
);

export const returnFromInterruptHandler = instruction((state) => {
  popProgramCounter(state);
  state.setIME(true);
  return 16;
});

function popProgramCounter(state: CpuState) {
  state.writeRegisterPair(RegisterPair.PC, popWord(state));
}

export const restartFunction = instruction((state, address: number) => {
  pushProgramCounter(state);

  state.writeRegisterPair(RegisterPair.PC, makeWord(0x00, address));

  return 16;
});

function pushProgramCounter(state: CpuState) {
  pushWord(state, state.readRegisterPair(RegisterPair.PC));
}
