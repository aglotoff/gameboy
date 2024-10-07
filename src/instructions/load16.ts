import { popWord, pushWord } from "../cpu-state";
import { Flag, RegisterPair } from "../regs";
import { addSignedByteToWord, getLSB, getMSB } from "../utils";
import {
  instruction,
  instructionWithImmediateByte,
  instructionWithImmediateWord,
} from "./lib";

export const loadRegisterPair = instructionWithImmediateWord(
  (state, data, dst: RegisterPair) => {
    state.writeRegisterPair(dst, data);
    return 12;
  }
);

export const loadDirectFromStackPointer = instructionWithImmediateWord(
  (state, address) => {
    const data = state.readRegisterPair(RegisterPair.SP);
    state.writeBus(address, getLSB(data));
    state.writeBus(address + 1, getMSB(data));
    return 20;
  }
);

export const loadStackPointerFromHL = instruction((state) => {
  state.writeRegisterPair(
    RegisterPair.SP,
    state.readRegisterPair(RegisterPair.HL)
  );
  return 8;
});

export const pushToStack = instruction((state, pair: RegisterPair) => {
  pushWord(state, state.readRegisterPair(pair));
  return 16;
});

export const popFromStack = instruction((state, rr: RegisterPair) => {
  state.writeRegisterPair(rr, popWord(state));
  return 12;
});

export const loadHLFromAdjustedStackPointer = instructionWithImmediateByte(
  (state, e) => {
    const { result, carryFrom3, carryFrom7 } = addSignedByteToWord(
      state.readRegisterPair(RegisterPair.SP),
      e
    );

    state.writeRegisterPair(RegisterPair.HL, result);
    state.setFlag(Flag.Z, false);
    state.setFlag(Flag.N, false);
    state.setFlag(Flag.H, carryFrom3);
    state.setFlag(Flag.CY, carryFrom7);

    return 12;
  }
);
