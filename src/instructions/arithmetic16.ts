import { RegisterPair, Flag } from "../regs";
import { wrapIncrementWord, addWords, addSignedByteToWord } from "../utils";
import { instruction, instructionWithImmediateByte } from "./lib";

export const incrementRegisterPair = instruction(
  (state, pair: RegisterPair) => {
    state.writeRegisterPair(
      pair,
      wrapIncrementWord(state.readRegisterPair(pair))
    );
    return 8;
  }
);

export const decrementRegisterPair = instruction(
  (state, pair: RegisterPair) => {
    state.writeRegisterPair(pair, state.readRegisterPair(pair) - 1);
    return 8;
  }
);

export const addRegisterPair = instruction((state, pair: RegisterPair) => {
  const { result, carryFrom11, carryFrom15 } = addWords(
    state.readRegisterPair(RegisterPair.HL),
    state.readRegisterPair(pair)
  );

  state.writeRegisterPair(RegisterPair.HL, result);
  state.setFlag(Flag.N, false);
  state.setFlag(Flag.H, carryFrom11);
  state.setFlag(Flag.CY, carryFrom15);

  return 8;
});

export const addToStackPointer = instructionWithImmediateByte((state, e) => {
  const { result, carryFrom3, carryFrom7 } = addSignedByteToWord(
    state.readRegisterPair(RegisterPair.SP),
    e
  );

  state.writeRegisterPair(RegisterPair.SP, result);
  state.setFlag(Flag.Z, false);
  state.setFlag(Flag.N, false);
  state.setFlag(Flag.H, carryFrom3);
  state.setFlag(Flag.CY, carryFrom7);

  return 16;
});
