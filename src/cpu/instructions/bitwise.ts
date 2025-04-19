import { Flag, Register, RegisterPair } from "../register";
import { resetBit, setBit, testBit } from "../../utils";
import { instruction } from "./lib";

export const rotateLeftCircularAccumulator = instruction((cpu) => {
  const { result, carry } = rotateLeftCircular(cpu.readRegister(Register.A));

  cpu.writeRegister(Register.A, result);
  cpu.setFlag(Flag.Z, false);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);
});

export const rotateLeftCircularRegister = instruction((cpu, reg: Register) => {
  const { result, carry } = rotateLeftCircular(cpu.readRegister(reg));

  cpu.writeRegister(reg, result);
  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);
});

export const rotateLeftCircularIndirectHL = instruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);

  const data = cpu.readBus(address);
  cpu.cycle();

  const { result, carry } = rotateLeftCircular(data);

  cpu.writeBus(address, result);
  cpu.cycle();

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);
});

function rotateLeftCircular(value: number) {
  return {
    result: ((value << 1) | (value >> 7)) & 0xff,
    carry: (value & 0x80) != 0,
  };
}

export const rotateRightCircularAccumulator = instruction((cpu) => {
  const { result, carry } = rotateRightCircular(cpu.readRegister(Register.A));

  cpu.writeRegister(Register.A, result);
  cpu.setFlag(Flag.Z, false);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);
});

export const rotateRightCircularRegister = instruction((cpu, reg: Register) => {
  const { result, carry } = rotateRightCircular(cpu.readRegister(reg));

  cpu.writeRegister(reg, result);
  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);
});

export const rotateRightCircularIndirectHL = instruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);
  cpu.cycle();

  const { result, carry } = rotateRightCircular(data);

  cpu.writeBus(address, result);
  cpu.cycle();

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);
});

function rotateRightCircular(value: number) {
  return {
    result: ((value >> 1) | (value << 7)) & 0xff,
    carry: (value & 0x01) != 0,
  };
}

export const rotateLeftAccumulator = instruction((cpu) => {
  const { result, carry } = rotateLeft(
    cpu.readRegister(Register.A),
    cpu.isFlagSet(Flag.CY)
  );

  cpu.writeRegister(Register.A, result);
  cpu.setFlag(Flag.Z, false);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);
});

export const rotateLeftRegister = instruction((cpu, reg: Register) => {
  const { result, carry } = rotateLeft(
    cpu.readRegister(reg),
    cpu.isFlagSet(Flag.CY)
  );

  cpu.writeRegister(reg, result);
  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);
});

export const rotateLeftIndirectHL = instruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);
  cpu.cycle();

  const { result, carry } = rotateLeft(data, cpu.isFlagSet(Flag.CY));

  cpu.writeBus(address, result);
  cpu.cycle();

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);
});

function rotateLeft(value: number, carry: boolean) {
  return {
    result: ((value << 1) & 0xff) | (carry ? 0x01 : 0x00),
    carry: (value & 0x80) != 0,
  };
}

export const rotateRightAccumulator = instruction((cpu) => {
  const { result, carry } = rotateRight(
    cpu.readRegister(Register.A),
    cpu.isFlagSet(Flag.CY)
  );

  cpu.writeRegister(Register.A, result);
  cpu.setFlag(Flag.Z, false);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);
});

export const rotateRightRegister = instruction((cpu, reg: Register) => {
  const { result, carry } = rotateRight(
    cpu.readRegister(reg),
    cpu.isFlagSet(Flag.CY)
  );

  cpu.writeRegister(reg, result);
  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);
});

export const rotateRightIndirectHL = instruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);
  cpu.cycle();

  const { result, carry } = rotateRight(data, cpu.isFlagSet(Flag.CY));

  cpu.writeBus(address, result);
  cpu.cycle();

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);
});

function rotateRight(value: number, carry: boolean) {
  return {
    result: ((value >> 1) & 0xff) | (carry ? 0x80 : 0x00),
    carry: (value & 0x01) != 0,
  };
}

export const shiftLeftArithmeticRegister = instruction((cpu, reg: Register) => {
  const { result, carry } = shiftLeftArithmetic(cpu.readRegister(reg));

  cpu.writeRegister(reg, result);
  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);
});

export const shiftLeftArithmeticIndirectHL = instruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);
  cpu.cycle();

  const { result, carry } = shiftLeftArithmetic(data);

  cpu.writeBus(address, result);
  cpu.cycle();

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);
});

function shiftLeftArithmetic(value: number) {
  return {
    result: (value << 1) & 0xff,
    carry: (value & 0x80) !== 0,
  };
}

export const shiftRightArithmeticRegister = instruction(
  (cpu, reg: Register) => {
    const { result, carry } = shiftRightArithmetic(cpu.readRegister(reg));

    cpu.writeRegister(reg, result);
    cpu.setFlag(Flag.Z, result === 0);
    cpu.setFlag(Flag.N, false);
    cpu.setFlag(Flag.H, false);
    cpu.setFlag(Flag.CY, carry);
  }
);

export const shiftRightArithmeticIndirectHL = instruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);
  cpu.cycle();

  const { result, carry } = shiftRightArithmetic(data);

  cpu.writeBus(address, result);
  cpu.cycle();

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);
});

function shiftRightArithmetic(value: number) {
  return {
    result: ((value >> 1) & 0xff) | (value & 0x80),
    carry: (value & 0x01) !== 0,
  };
}

export const shiftRightLogicalRegister = instruction((cpu, reg: Register) => {
  const { result, carry } = shiftRightLogical(cpu.readRegister(reg));

  cpu.writeRegister(reg, result);
  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);
});

export const shiftRightLogicalIndirectHL = instruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);
  cpu.cycle();

  const { result, carry } = shiftRightLogical(data);

  cpu.writeBus(address, result);
  cpu.cycle();

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, carry);
});

function shiftRightLogical(value: number) {
  return {
    result: (value >> 1) & 0xff,
    carry: (value & 0x01) !== 0,
  };
}

export const swapNibblesRegister = instruction((cpu, reg: Register) => {
  const result = swapNibbles(cpu.readRegister(reg));

  cpu.writeRegister(reg, result);
  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, false);
});

export const swapNibblesIndirectHL = instruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);
  cpu.cycle();

  const result = swapNibbles(data);

  cpu.writeBus(address, result);
  cpu.cycle();

  cpu.setFlag(Flag.Z, result === 0);
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, false);
  cpu.setFlag(Flag.CY, false);
});

function swapNibbles(value: number) {
  return ((value & 0xf) << 4) | ((value >> 4) & 0xf);
}

export const testBitRegister = instruction(
  (cpu, bit: number, reg: Register) => {
    cpu.setFlag(Flag.Z, !testBit(cpu.readRegister(reg), bit));
    cpu.setFlag(Flag.N, false);
    cpu.setFlag(Flag.H, true);
  }
);

export const testBitIndirectHL = instruction((cpu, bit: number) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);
  cpu.cycle();

  cpu.setFlag(Flag.Z, !testBit(data, bit));
  cpu.setFlag(Flag.N, false);
  cpu.setFlag(Flag.H, true);
});

export const resetBitRegister = instruction(
  (cpu, bit: number, reg: Register) => {
    cpu.writeRegister(reg, resetBit(cpu.readRegister(reg), bit));
  }
);

export const resetBitIndirectHL = instruction((cpu, bit: number) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);
  cpu.cycle();

  cpu.writeBus(address, resetBit(data, bit));
  cpu.cycle();
});

export const setBitRegister = instruction((cpu, bit: number, reg: Register) => {
  cpu.writeRegister(reg, setBit(cpu.readRegister(reg), bit));
});

export const setBitIndirectHL = instruction((cpu, bit: number) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);
  cpu.cycle();

  cpu.writeBus(address, setBit(data, bit));
  cpu.cycle();
});
