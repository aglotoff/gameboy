import { Register, RegisterPair } from "../regs";
import { wrapDecrementWord, wrapIncrementWord } from "../utils";
import {
  instruction,
  instructionWithImmediateByte,
  instructionWithImmediateWord,
} from "./lib";

export const loadRegisterFromRegister = instruction(
  (state, dst: Register, src: Register) => {
    state.writeRegister(dst, state.readRegister(src));
    return 4;
  }
);

export const loadRegisterFromImmediate = instructionWithImmediateByte(
  (state, data, dst: Register) => {
    state.writeRegister(dst, data);
    return 8;
  }
);

export const loadRegisterFromIndirectHL = instruction(
  (state, dst: Register) => {
    const data = state.readBus(state.readRegisterPair(RegisterPair.HL));
    state.writeRegister(dst, data);
    return 8;
  }
);

export const loadIndirectHLFromRegister = instruction(
  (state, src: Register) => {
    state.writeBus(
      state.readRegisterPair(RegisterPair.HL),
      state.readRegister(src)
    );
    return 8;
  }
);

export const loadIndirectHLFromImmediateData = instructionWithImmediateByte(
  (state, data) => {
    state.writeBus(state.readRegisterPair(RegisterPair.HL), data);
    return 12;
  }
);

export const loadAccumulatorFromIndirectBC = instruction((state) => {
  const data = state.readBus(state.readRegisterPair(RegisterPair.BC));
  state.writeRegister(Register.A, data);
  return 8;
});

export const loadAccumulatorFromIndirectDE = instruction((state) => {
  const data = state.readBus(state.readRegisterPair(RegisterPair.DE));
  state.writeRegister(Register.A, data);
  return 8;
});

export const loadIndirectBCFromAccumulator = instruction((state) => {
  state.writeBus(
    state.readRegisterPair(RegisterPair.BC),
    state.readRegister(Register.A)
  );
  return 8;
});

export const loadIndirectDEFromAccumulator = instruction((state) => {
  state.writeBus(
    state.readRegisterPair(RegisterPair.DE),
    state.readRegister(Register.A)
  );
  return 8;
});

export const loadAccumulatorFromDirectWord = instructionWithImmediateWord(
  (state, address) => {
    state.writeRegister(Register.A, state.readBus(address));
    return 16;
  }
);

export const loadDirectWordFromAccumulator = instructionWithImmediateWord(
  (state, address) => {
    state.writeBus(address, state.readRegister(Register.A));
    return 16;
  }
);

export const loadAccumulatorFromIndirectC = instruction((state) => {
  const address = 0xff00 + state.readRegister(Register.C);
  state.writeRegister(Register.A, state.readBus(address));
  return 8;
});

export const loadIndirectCFromAccumulator = instruction((state) => {
  const address = 0xff00 + state.readRegister(Register.C);
  state.writeBus(address, state.readRegister(Register.A));
  return 8;
});

export const loadAccumulatorFromDirectByte = instructionWithImmediateByte(
  (state, offset) => {
    const address = 0xff00 + offset;
    state.writeRegister(Register.A, state.readBus(address));
    return 12;
  }
);

export const loadDirectByteFromAccumulator = instructionWithImmediateByte(
  (state, offset) => {
    const address = 0xff00 + offset;
    state.writeBus(address, state.readRegister(Register.A));
    return 12;
  }
);

export const loadAccumulatorFromIndirectHLDecrement = instruction((state) => {
  const address = state.readRegisterPair(RegisterPair.HL);
  const data = state.readBus(address);
  state.writeRegister(Register.A, data);
  state.writeRegisterPair(RegisterPair.HL, address - 1);
  return 8;
});

export const loadAccumulatorFromIndirectHLIncrement = instruction((state) => {
  const address = state.readRegisterPair(RegisterPair.HL);
  const data = state.readBus(address);
  state.writeRegister(Register.A, data);
  state.writeRegisterPair(RegisterPair.HL, wrapIncrementWord(address));
  return 8;
});

export const loadIndirectHLDecrementFromAccumulator = instruction((state) => {
  const address = state.readRegisterPair(RegisterPair.HL);
  state.writeBus(address, state.readRegister(Register.A));
  state.writeRegisterPair(RegisterPair.HL, wrapDecrementWord(address));
  return 8;
});

export const loadIndirectHLIncrementFromAccumulator = instruction((state) => {
  const address = state.readRegisterPair(RegisterPair.HL);
  state.writeBus(address, state.readRegister(Register.A));
  state.writeRegisterPair(RegisterPair.HL, wrapIncrementWord(address));
  return 8;
});
