import { Flag, Register, RegisterPair } from "../regs";
import { instruction } from "./lib";

export const rotateLeftCircularAccumulator = instruction(({ cpu }) => {
  const { result, carry } = rotateLeftCircular(cpu.regs.read(Register.A));

  cpu.regs.write(Register.A, result);
  cpu.regs.setFlag(Flag.Z, false);
  cpu.regs.setFlag(Flag.N, false);
  cpu.regs.setFlag(Flag.H, false);
  cpu.regs.setFlag(Flag.CY, carry);

  return 4;
});

export const rotateLeftCircularRegister = instruction(
  ({ cpu }, reg: Register) => {
    const { result, carry } = rotateLeftCircular(cpu.regs.read(reg));

    cpu.regs.write(reg, result);
    cpu.regs.setFlag(Flag.Z, result === 0);
    cpu.regs.setFlag(Flag.N, false);
    cpu.regs.setFlag(Flag.H, false);
    cpu.regs.setFlag(Flag.CY, carry);

    return 8;
  }
);

export const rotateLeftCircularIndirectHL = instruction(({ cpu, memory }) => {
  const address = cpu.regs.readPair(RegisterPair.HL);

  const { result, carry } = rotateLeftCircular(memory.read(address));

  memory.write(address, result);
  cpu.regs.setFlag(Flag.Z, result === 0);
  cpu.regs.setFlag(Flag.N, false);
  cpu.regs.setFlag(Flag.H, false);
  cpu.regs.setFlag(Flag.CY, carry);

  return 16;
});

function rotateLeftCircular(value: number) {
  return {
    result: ((value << 1) | (value >> 7)) & 0xff,
    carry: (value & 0x80) != 0,
  };
}

export const rotateRightCircularAccumulator = instruction(({ cpu }) => {
  const { result, carry } = rotateRightCircular(cpu.regs.read(Register.A));

  cpu.regs.write(Register.A, result);
  cpu.regs.setFlag(Flag.Z, false);
  cpu.regs.setFlag(Flag.N, false);
  cpu.regs.setFlag(Flag.H, false);
  cpu.regs.setFlag(Flag.CY, carry);

  return 4;
});

export const rotateRightCircularRegister = instruction(
  ({ cpu }, reg: Register) => {
    const { result, carry } = rotateRightCircular(cpu.regs.read(reg));

    cpu.regs.write(reg, result);
    cpu.regs.setFlag(Flag.Z, result === 0);
    cpu.regs.setFlag(Flag.N, false);
    cpu.regs.setFlag(Flag.H, false);
    cpu.regs.setFlag(Flag.CY, carry);

    return 8;
  }
);

export const rotateRightCircularIndirectHL = instruction(({ cpu, memory }) => {
  const address = cpu.regs.readPair(RegisterPair.HL);

  const { result, carry } = rotateRightCircular(memory.read(address));

  memory.write(address, result);
  cpu.regs.setFlag(Flag.Z, result === 0);
  cpu.regs.setFlag(Flag.N, false);
  cpu.regs.setFlag(Flag.H, false);
  cpu.regs.setFlag(Flag.CY, carry);

  return 16;
});

function rotateRightCircular(value: number) {
  return {
    result: ((value >> 1) | (value << 7)) & 0xff,
    carry: (value & 0x01) != 0,
  };
}

export const rotateLeftAccumulator = instruction(({ cpu }) => {
  const { result, carry } = rotateLeft(
    cpu.regs.read(Register.A),
    cpu.regs.isFlagSet(Flag.CY)
  );

  cpu.regs.write(Register.A, result);
  cpu.regs.setFlag(Flag.Z, false);
  cpu.regs.setFlag(Flag.N, false);
  cpu.regs.setFlag(Flag.H, false);
  cpu.regs.setFlag(Flag.CY, carry);

  return 4;
});

export const rotateLeftRegister = instruction(({ cpu }, reg: Register) => {
  const { result, carry } = rotateLeft(
    cpu.regs.read(reg),
    cpu.regs.isFlagSet(Flag.CY)
  );

  cpu.regs.write(reg, result);
  cpu.regs.setFlag(Flag.Z, result === 0);
  cpu.regs.setFlag(Flag.N, false);
  cpu.regs.setFlag(Flag.H, false);
  cpu.regs.setFlag(Flag.CY, carry);

  return 8;
});

export const rotateLeftIndirectHL = instruction(({ cpu, memory }) => {
  const address = cpu.regs.readPair(RegisterPair.HL);

  const { result, carry } = rotateLeft(
    memory.read(address),
    cpu.regs.isFlagSet(Flag.CY)
  );

  memory.write(address, result);
  cpu.regs.setFlag(Flag.Z, result === 0);
  cpu.regs.setFlag(Flag.N, false);
  cpu.regs.setFlag(Flag.H, false);
  cpu.regs.setFlag(Flag.CY, carry);

  return 16;
});

function rotateLeft(value: number, carry: boolean) {
  return {
    result: ((value << 1) & 0xff) | (carry ? 0x01 : 0x00),
    carry: (value & 0x80) != 0,
  };
}

export const rotateRightAccumulator = instruction(({ cpu }) => {
  const { result, carry } = rotateRight(
    cpu.regs.read(Register.A),
    cpu.regs.isFlagSet(Flag.CY)
  );

  cpu.regs.write(Register.A, result);
  cpu.regs.setFlag(Flag.Z, false);
  cpu.regs.setFlag(Flag.N, false);
  cpu.regs.setFlag(Flag.H, false);
  cpu.regs.setFlag(Flag.CY, carry);

  return 4;
});

export const rotateRightRegister = instruction(({ cpu }, reg: Register) => {
  const { result, carry } = rotateRight(
    cpu.regs.read(reg),
    cpu.regs.isFlagSet(Flag.CY)
  );

  cpu.regs.write(reg, result);
  cpu.regs.setFlag(Flag.Z, result === 0);
  cpu.regs.setFlag(Flag.N, false);
  cpu.regs.setFlag(Flag.H, false);
  cpu.regs.setFlag(Flag.CY, carry);

  return 8;
});

export const rotateRightIndirectHL = instruction(({ cpu, memory }) => {
  const address = cpu.regs.readPair(RegisterPair.HL);

  const { result, carry } = rotateRight(
    memory.read(address),
    cpu.regs.isFlagSet(Flag.CY)
  );

  memory.write(address, result);
  cpu.regs.setFlag(Flag.Z, result === 0);
  cpu.regs.setFlag(Flag.N, false);
  cpu.regs.setFlag(Flag.H, false);
  cpu.regs.setFlag(Flag.CY, carry);

  return 16;
});

function rotateRight(value: number, carry: boolean) {
  return {
    result: ((value >> 1) & 0xff) | (carry ? 0x80 : 0x00),
    carry: (value & 0x01) != 0,
  };
}

export const shiftLeftArithmeticRegister = instruction(
  ({ cpu }, reg: Register) => {
    const { result, carry } = shiftLeftArithmetic(cpu.regs.read(reg));

    cpu.regs.write(reg, result);
    cpu.regs.setFlag(Flag.Z, result === 0);
    cpu.regs.setFlag(Flag.N, false);
    cpu.regs.setFlag(Flag.H, false);
    cpu.regs.setFlag(Flag.CY, carry);

    return 8;
  }
);

export const shiftLeftArithmeticIndirectHL = instruction(({ cpu, memory }) => {
  const address = cpu.regs.readPair(RegisterPair.HL);

  const { result, carry } = shiftLeftArithmetic(memory.read(address));

  memory.write(address, result);
  cpu.regs.setFlag(Flag.Z, result === 0);
  cpu.regs.setFlag(Flag.N, false);
  cpu.regs.setFlag(Flag.H, false);
  cpu.regs.setFlag(Flag.CY, carry);

  return 16;
});

function shiftLeftArithmetic(value: number) {
  return {
    result: (value << 1) & 0xff,
    carry: (value & 0x80) !== 0,
  };
}

export const shiftRightArithmeticRegister = instruction(
  ({ cpu }, reg: Register) => {
    const { result, carry } = shiftRightArithmetic(cpu.regs.read(reg));

    cpu.regs.write(reg, result);
    cpu.regs.setFlag(Flag.Z, result === 0);
    cpu.regs.setFlag(Flag.N, false);
    cpu.regs.setFlag(Flag.H, false);
    cpu.regs.setFlag(Flag.CY, carry);

    return 8;
  }
);

export const shiftRightArithmeticIndirectHL = instruction(({ cpu, memory }) => {
  const address = cpu.regs.readPair(RegisterPair.HL);

  const { result, carry } = shiftRightArithmetic(memory.read(address));

  memory.write(address, result);
  cpu.regs.setFlag(Flag.Z, result === 0);
  cpu.regs.setFlag(Flag.N, false);
  cpu.regs.setFlag(Flag.H, false);
  cpu.regs.setFlag(Flag.CY, carry);

  return 16;
});

function shiftRightArithmetic(value: number) {
  return {
    result: ((value >> 1) & 0xff) | (value & 0x80),
    carry: (value & 0x01) !== 0,
  };
}

export const shiftRightLogicalRegister = instruction(
  ({ cpu }, reg: Register) => {
    const { result, carry } = shiftRightLogical(cpu.regs.read(reg));

    cpu.regs.write(reg, result);
    cpu.regs.setFlag(Flag.Z, result === 0);
    cpu.regs.setFlag(Flag.N, false);
    cpu.regs.setFlag(Flag.H, false);
    cpu.regs.setFlag(Flag.CY, carry);

    return 8;
  }
);

export const shiftRightLogicalIndirectHL = instruction(({ cpu, memory }) => {
  const address = cpu.regs.readPair(RegisterPair.HL);

  const { result, carry } = shiftRightLogical(memory.read(address));

  memory.write(address, result);
  cpu.regs.setFlag(Flag.Z, result === 0);
  cpu.regs.setFlag(Flag.N, false);
  cpu.regs.setFlag(Flag.H, false);
  cpu.regs.setFlag(Flag.CY, carry);

  return 16;
});

function shiftRightLogical(value: number) {
  return {
    result: (value >> 1) & 0xff,
    carry: (value & 0x01) !== 0,
  };
}

export const swapNibblesRegister = instruction(({ cpu }, reg: Register) => {
  const result = swapNibbles(cpu.regs.read(reg));

  cpu.regs.write(reg, result);
  cpu.regs.setFlag(Flag.Z, result === 0);
  cpu.regs.setFlag(Flag.N, false);
  cpu.regs.setFlag(Flag.H, false);
  cpu.regs.setFlag(Flag.CY, false);

  return 8;
});

export const swapNibblesIndirectHL = instruction(({ cpu, memory }) => {
  const address = cpu.regs.readPair(RegisterPair.HL);

  const result = swapNibbles(memory.read(address));

  memory.write(address, result);
  cpu.regs.setFlag(Flag.Z, result === 0);
  cpu.regs.setFlag(Flag.N, false);
  cpu.regs.setFlag(Flag.H, false);
  cpu.regs.setFlag(Flag.CY, false);

  return 16;
});

function swapNibbles(value: number) {
  return ((value & 0xf) << 4) | ((value >> 4) & 0xf);
}

export const testBitRegister = instruction(
  ({ cpu }, bit: number, reg: Register) => {
    cpu.regs.setFlag(Flag.Z, testBit(cpu.regs.read(reg), bit));
    cpu.regs.setFlag(Flag.N, false);
    cpu.regs.setFlag(Flag.H, true);

    return 8;
  }
);

export const testBitIndirectHL = instruction(({ cpu, memory }, bit: number) => {
  const address = cpu.regs.readPair(RegisterPair.HL);

  cpu.regs.setFlag(Flag.Z, testBit(memory.read(address), bit));
  cpu.regs.setFlag(Flag.N, false);
  cpu.regs.setFlag(Flag.H, true);

  return 12;
});

function testBit(value: number, bit: number) {
  return !(value & (1 << bit));
}

export const resetBitRegister = instruction(
  ({ cpu }, bit: number, reg: Register) => {
    cpu.regs.write(reg, resetBit(cpu.regs.read(reg), bit));
    return 8;
  }
);

export const resetBitIndirectHL = instruction(
  ({ cpu, memory }, bit: number) => {
    const address = cpu.regs.readPair(RegisterPair.HL);
    memory.write(address, resetBit(memory.read(address), bit));
    return 16;
  }
);

function resetBit(value: number, bit: number) {
  return value & ~(1 << bit);
}

export const setBitRegister = instruction(
  ({ cpu }, bit: number, reg: Register) => {
    cpu.regs.write(reg, setBit(cpu.regs.read(reg), bit));
    return 8;
  }
);

export const setBitIndirectHL = instruction(({ cpu, memory }, bit: number) => {
  const address = cpu.regs.readPair(RegisterPair.HL);
  memory.write(address, setBit(memory.read(address), bit));
  return 16;
});

function setBit(value: number, bit: number) {
  return value | (1 << bit);
}
