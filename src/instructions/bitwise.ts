import { Flag, Register, RegisterPair } from "../regs";
import { resetBit, setBit, testBit } from "../utils";
import { instruction } from "./lib";

export const rotateLeftCircularAccumulator = instruction((state) => {
  const { result, carry } = rotateLeftCircular(state.readRegister(Register.A));

  state.writeRegister(Register.A, result);
  state.setFlag(Flag.Z, false);
  state.setFlag(Flag.N, false);
  state.setFlag(Flag.H, false);
  state.setFlag(Flag.CY, carry);

  return 4;
});

export const rotateLeftCircularRegister = instruction(
  (state, reg: Register) => {
    const { result, carry } = rotateLeftCircular(state.readRegister(reg));

    state.writeRegister(reg, result);
    state.setFlag(Flag.Z, result === 0);
    state.setFlag(Flag.N, false);
    state.setFlag(Flag.H, false);
    state.setFlag(Flag.CY, carry);

    return 8;
  }
);

export const rotateLeftCircularIndirectHL = instruction((state) => {
  const address = state.readRegisterPair(RegisterPair.HL);

  const { result, carry } = rotateLeftCircular(state.readBus(address));

  state.writeBus(address, result);
  state.setFlag(Flag.Z, result === 0);
  state.setFlag(Flag.N, false);
  state.setFlag(Flag.H, false);
  state.setFlag(Flag.CY, carry);

  return 16;
});

function rotateLeftCircular(value: number) {
  return {
    result: ((value << 1) | (value >> 7)) & 0xff,
    carry: (value & 0x80) != 0,
  };
}

export const rotateRightCircularAccumulator = instruction((state) => {
  const { result, carry } = rotateRightCircular(state.readRegister(Register.A));

  state.writeRegister(Register.A, result);
  state.setFlag(Flag.Z, false);
  state.setFlag(Flag.N, false);
  state.setFlag(Flag.H, false);
  state.setFlag(Flag.CY, carry);

  return 4;
});

export const rotateRightCircularRegister = instruction(
  (state, reg: Register) => {
    const { result, carry } = rotateRightCircular(state.readRegister(reg));

    state.writeRegister(reg, result);
    state.setFlag(Flag.Z, result === 0);
    state.setFlag(Flag.N, false);
    state.setFlag(Flag.H, false);
    state.setFlag(Flag.CY, carry);

    return 8;
  }
);

export const rotateRightCircularIndirectHL = instruction((state) => {
  const address = state.readRegisterPair(RegisterPair.HL);

  const { result, carry } = rotateRightCircular(state.readBus(address));

  state.writeBus(address, result);
  state.setFlag(Flag.Z, result === 0);
  state.setFlag(Flag.N, false);
  state.setFlag(Flag.H, false);
  state.setFlag(Flag.CY, carry);

  return 16;
});

function rotateRightCircular(value: number) {
  return {
    result: ((value >> 1) | (value << 7)) & 0xff,
    carry: (value & 0x01) != 0,
  };
}

export const rotateLeftAccumulator = instruction((state) => {
  const { result, carry } = rotateLeft(
    state.readRegister(Register.A),
    state.isFlagSet(Flag.CY)
  );

  state.writeRegister(Register.A, result);
  state.setFlag(Flag.Z, false);
  state.setFlag(Flag.N, false);
  state.setFlag(Flag.H, false);
  state.setFlag(Flag.CY, carry);

  return 4;
});

export const rotateLeftRegister = instruction((state, reg: Register) => {
  const { result, carry } = rotateLeft(
    state.readRegister(reg),
    state.isFlagSet(Flag.CY)
  );

  state.writeRegister(reg, result);
  state.setFlag(Flag.Z, result === 0);
  state.setFlag(Flag.N, false);
  state.setFlag(Flag.H, false);
  state.setFlag(Flag.CY, carry);

  return 8;
});

export const rotateLeftIndirectHL = instruction((state) => {
  const address = state.readRegisterPair(RegisterPair.HL);

  const { result, carry } = rotateLeft(
    state.readBus(address),
    state.isFlagSet(Flag.CY)
  );

  state.writeBus(address, result);
  state.setFlag(Flag.Z, result === 0);
  state.setFlag(Flag.N, false);
  state.setFlag(Flag.H, false);
  state.setFlag(Flag.CY, carry);

  return 16;
});

function rotateLeft(value: number, carry: boolean) {
  return {
    result: ((value << 1) & 0xff) | (carry ? 0x01 : 0x00),
    carry: (value & 0x80) != 0,
  };
}

export const rotateRightAccumulator = instruction((state) => {
  const { result, carry } = rotateRight(
    state.readRegister(Register.A),
    state.isFlagSet(Flag.CY)
  );

  state.writeRegister(Register.A, result);
  state.setFlag(Flag.Z, false);
  state.setFlag(Flag.N, false);
  state.setFlag(Flag.H, false);
  state.setFlag(Flag.CY, carry);

  return 4;
});

export const rotateRightRegister = instruction((state, reg: Register) => {
  const { result, carry } = rotateRight(
    state.readRegister(reg),
    state.isFlagSet(Flag.CY)
  );

  state.writeRegister(reg, result);
  state.setFlag(Flag.Z, result === 0);
  state.setFlag(Flag.N, false);
  state.setFlag(Flag.H, false);
  state.setFlag(Flag.CY, carry);

  return 8;
});

export const rotateRightIndirectHL = instruction((state) => {
  const address = state.readRegisterPair(RegisterPair.HL);

  const { result, carry } = rotateRight(
    state.readBus(address),
    state.isFlagSet(Flag.CY)
  );

  state.writeBus(address, result);
  state.setFlag(Flag.Z, result === 0);
  state.setFlag(Flag.N, false);
  state.setFlag(Flag.H, false);
  state.setFlag(Flag.CY, carry);

  return 16;
});

function rotateRight(value: number, carry: boolean) {
  return {
    result: ((value >> 1) & 0xff) | (carry ? 0x80 : 0x00),
    carry: (value & 0x01) != 0,
  };
}

export const shiftLeftArithmeticRegister = instruction(
  (state, reg: Register) => {
    const { result, carry } = shiftLeftArithmetic(state.readRegister(reg));

    state.writeRegister(reg, result);
    state.setFlag(Flag.Z, result === 0);
    state.setFlag(Flag.N, false);
    state.setFlag(Flag.H, false);
    state.setFlag(Flag.CY, carry);

    return 8;
  }
);

export const shiftLeftArithmeticIndirectHL = instruction((state) => {
  const address = state.readRegisterPair(RegisterPair.HL);

  const { result, carry } = shiftLeftArithmetic(state.readBus(address));

  state.writeBus(address, result);
  state.setFlag(Flag.Z, result === 0);
  state.setFlag(Flag.N, false);
  state.setFlag(Flag.H, false);
  state.setFlag(Flag.CY, carry);

  return 16;
});

function shiftLeftArithmetic(value: number) {
  return {
    result: (value << 1) & 0xff,
    carry: (value & 0x80) !== 0,
  };
}

export const shiftRightArithmeticRegister = instruction(
  (state, reg: Register) => {
    const { result, carry } = shiftRightArithmetic(state.readRegister(reg));

    state.writeRegister(reg, result);
    state.setFlag(Flag.Z, result === 0);
    state.setFlag(Flag.N, false);
    state.setFlag(Flag.H, false);
    state.setFlag(Flag.CY, carry);

    return 8;
  }
);

export const shiftRightArithmeticIndirectHL = instruction((state) => {
  const address = state.readRegisterPair(RegisterPair.HL);

  const { result, carry } = shiftRightArithmetic(state.readBus(address));

  state.writeBus(address, result);
  state.setFlag(Flag.Z, result === 0);
  state.setFlag(Flag.N, false);
  state.setFlag(Flag.H, false);
  state.setFlag(Flag.CY, carry);

  return 16;
});

function shiftRightArithmetic(value: number) {
  return {
    result: ((value >> 1) & 0xff) | (value & 0x80),
    carry: (value & 0x01) !== 0,
  };
}

export const shiftRightLogicalRegister = instruction((state, reg: Register) => {
  const { result, carry } = shiftRightLogical(state.readRegister(reg));

  state.writeRegister(reg, result);
  state.setFlag(Flag.Z, result === 0);
  state.setFlag(Flag.N, false);
  state.setFlag(Flag.H, false);
  state.setFlag(Flag.CY, carry);

  return 8;
});

export const shiftRightLogicalIndirectHL = instruction((state) => {
  const address = state.readRegisterPair(RegisterPair.HL);

  const { result, carry } = shiftRightLogical(state.readBus(address));

  state.writeBus(address, result);
  state.setFlag(Flag.Z, result === 0);
  state.setFlag(Flag.N, false);
  state.setFlag(Flag.H, false);
  state.setFlag(Flag.CY, carry);

  return 16;
});

function shiftRightLogical(value: number) {
  return {
    result: (value >> 1) & 0xff,
    carry: (value & 0x01) !== 0,
  };
}

export const swapNibblesRegister = instruction((state, reg: Register) => {
  const result = swapNibbles(state.readRegister(reg));

  state.writeRegister(reg, result);
  state.setFlag(Flag.Z, result === 0);
  state.setFlag(Flag.N, false);
  state.setFlag(Flag.H, false);
  state.setFlag(Flag.CY, false);

  return 8;
});

export const swapNibblesIndirectHL = instruction((state) => {
  const address = state.readRegisterPair(RegisterPair.HL);

  const result = swapNibbles(state.readBus(address));

  state.writeBus(address, result);
  state.setFlag(Flag.Z, result === 0);
  state.setFlag(Flag.N, false);
  state.setFlag(Flag.H, false);
  state.setFlag(Flag.CY, false);

  return 16;
});

function swapNibbles(value: number) {
  return ((value & 0xf) << 4) | ((value >> 4) & 0xf);
}

export const testBitRegister = instruction(
  (state, bit: number, reg: Register) => {
    state.setFlag(Flag.Z, !testBit(state.readRegister(reg), bit));
    state.setFlag(Flag.N, false);
    state.setFlag(Flag.H, true);

    return 8;
  }
);

export const testBitIndirectHL = instruction((state, bit: number) => {
  const address = state.readRegisterPair(RegisterPair.HL);

  state.setFlag(Flag.Z, !testBit(state.readBus(address), bit));
  state.setFlag(Flag.N, false);
  state.setFlag(Flag.H, true);

  return 12;
});

export const resetBitRegister = instruction(
  (state, bit: number, reg: Register) => {
    state.writeRegister(reg, resetBit(state.readRegister(reg), bit));
    return 8;
  }
);

export const resetBitIndirectHL = instruction((state, bit: number) => {
  const address = state.readRegisterPair(RegisterPair.HL);
  state.writeBus(address, resetBit(state.readBus(address), bit));
  return 16;
});

export const setBitRegister = instruction(
  (state, bit: number, reg: Register) => {
    state.writeRegister(reg, setBit(state.readRegister(reg), bit));
    return 8;
  }
);

export const setBitIndirectHL = instruction((state, bit: number) => {
  const address = state.readRegisterPair(RegisterPair.HL);
  state.writeBus(address, setBit(state.readBus(address), bit));
  return 16;
});
