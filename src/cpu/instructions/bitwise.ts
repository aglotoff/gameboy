import { Flag, Register } from "../register";
import { resetBit, setBit } from "../../utils";
import { makeInstruction } from "./lib";
import { InstructionContext, RegisterPair } from "../cpu-state";

export const rotateLeftCircularAccumulator = makeInstruction((ctx) => {
  const result = rotateLeftCircular(ctx, ctx.readRegister(Register.A));

  ctx.writeRegister(Register.A, result);
  ctx.setFlag(Flag.Z, false);
});

export const rotateLeftCircularRegister = makeInstruction(
  (ctx, reg: Register) => {
    const result = rotateLeftCircular(ctx, ctx.readRegister(reg));

    ctx.writeRegister(reg, result);
    ctx.setFlag(Flag.Z, result === 0);
  }
);

export const rotateLeftCircularIndirectHL = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  const result = rotateLeftCircular(ctx, data);

  ctx.setFlag(Flag.Z, result === 0);
  ctx.writeMemoryCycle(address, result);
});

function rotateLeftCircular(ctx: InstructionContext, value: number) {
  const result = ((value << 1) | (value >> 7)) & 0xff;
  const carry = (value & 0x80) != 0;

  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, false);
  ctx.setFlag(Flag.CY, carry);

  return result;
}

export const rotateRightCircularAccumulator = makeInstruction((ctx) => {
  const result = rotateRightCircular(ctx, ctx.readRegister(Register.A));

  ctx.writeRegister(Register.A, result);
  ctx.setFlag(Flag.Z, false);
});

export const rotateRightCircularRegister = makeInstruction(
  (ctx, reg: Register) => {
    const result = rotateRightCircular(ctx, ctx.readRegister(reg));

    ctx.writeRegister(reg, result);
    ctx.setFlag(Flag.Z, result === 0);
  }
);

export const rotateRightCircularIndirectHL = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  const result = rotateRightCircular(ctx, data);

  ctx.setFlag(Flag.Z, result === 0);
  ctx.writeMemoryCycle(address, result);
});

function rotateRightCircular(ctx: InstructionContext, value: number) {
  const result = ((value >> 1) | (value << 7)) & 0xff;
  const carry = (value & 0x01) != 0;

  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, false);
  ctx.setFlag(Flag.CY, carry);

  return result;
}

export const rotateLeftAccumulator = makeInstruction((ctx) => {
  const result = rotateLeft(ctx, ctx.readRegister(Register.A));

  ctx.writeRegister(Register.A, result);
  ctx.setFlag(Flag.Z, false);
});

export const rotateLeftRegister = makeInstruction((ctx, reg: Register) => {
  const result = rotateLeft(ctx, ctx.readRegister(reg));

  ctx.writeRegister(reg, result);
  ctx.setFlag(Flag.Z, result === 0);
});

export const rotateLeftIndirectHL = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  const result = rotateLeft(ctx, data);

  ctx.setFlag(Flag.Z, result === 0);
  ctx.writeMemoryCycle(address, result);
});

function rotateLeft(ctx: InstructionContext, value: number) {
  const result = ((value << 1) & 0xff) | (ctx.getFlag(Flag.CY) ? 0x01 : 0x00);
  const carry = (value & 0x80) != 0;

  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, false);
  ctx.setFlag(Flag.CY, carry);

  return result;
}

export const rotateRightAccumulator = makeInstruction((ctx) => {
  const result = rotateRight(ctx, ctx.readRegister(Register.A));

  ctx.writeRegister(Register.A, result);
  ctx.setFlag(Flag.Z, false);
});

export const rotateRightRegister = makeInstruction((ctx, reg: Register) => {
  const result = rotateRight(ctx, ctx.readRegister(reg));

  ctx.writeRegister(reg, result);
  ctx.setFlag(Flag.Z, result === 0);
});

export const rotateRightIndirectHL = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  const result = rotateRight(ctx, data);

  ctx.setFlag(Flag.Z, result === 0);
  ctx.writeMemoryCycle(address, result);
});

function rotateRight(ctx: InstructionContext, value: number) {
  const result = ((value >> 1) & 0xff) | (ctx.getFlag(Flag.CY) ? 0x80 : 0x00);
  const carry = (value & 0x01) != 0;

  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, false);
  ctx.setFlag(Flag.CY, carry);

  return result;
}

export const shiftLeftArithmeticRegister = makeInstruction(
  (ctx, reg: Register) => {
    const result = shiftLeftArithmetic(ctx, ctx.readRegister(reg));

    ctx.writeRegister(reg, result);
    ctx.setFlag(Flag.Z, result === 0);
  }
);

export const shiftLeftArithmeticIndirectHL = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  const result = shiftLeftArithmetic(ctx, data);

  ctx.setFlag(Flag.Z, result === 0);
  ctx.writeMemoryCycle(address, result);
});

function shiftLeftArithmetic(ctx: InstructionContext, value: number) {
  const result = (value << 1) & 0xff;
  const carry = (value & 0x80) !== 0;

  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, false);
  ctx.setFlag(Flag.CY, carry);

  return result;
}

export const shiftRightArithmeticRegister = makeInstruction(
  (ctx, reg: Register) => {
    const result = shiftRightArithmetic(ctx, ctx.readRegister(reg));

    ctx.writeRegister(reg, result);
    ctx.setFlag(Flag.Z, result === 0);
  }
);

export const shiftRightArithmeticIndirectHL = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  const result = shiftRightArithmetic(ctx, data);

  ctx.setFlag(Flag.Z, result === 0);
  ctx.writeMemoryCycle(address, result);
});

function shiftRightArithmetic(ctx: InstructionContext, value: number) {
  const result = ((value >> 1) & 0xff) | (value & 0x80);
  const carry = (value & 0x01) !== 0;

  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, false);
  ctx.setFlag(Flag.CY, carry);

  return result;
}

export const shiftRightLogicalRegister = makeInstruction(
  (ctx, reg: Register) => {
    const result = shiftRightLogical(ctx, ctx.readRegister(reg));

    ctx.writeRegister(reg, result);
    ctx.setFlag(Flag.Z, result === 0);
  }
);

export const shiftRightLogicalIndirectHL = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  const result = shiftRightLogical(ctx, data);

  ctx.setFlag(Flag.Z, result === 0);
  ctx.writeMemoryCycle(address, result);
});

function shiftRightLogical(ctx: InstructionContext, value: number) {
  const result = (value >> 1) & 0xff;
  const carry = (value & 0x01) !== 0;

  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, false);
  ctx.setFlag(Flag.CY, carry);

  return result;
}

export const swapNibblesRegister = makeInstruction((ctx, reg: Register) => {
  const result = swapNibbles(ctx, ctx.readRegister(reg));
  ctx.writeRegister(reg, result);
});

export const swapNibblesIndirectHL = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  const result = swapNibbles(ctx, data);
  ctx.writeMemoryCycle(address, result);
});

function swapNibbles(ctx: InstructionContext, value: number) {
  const result = ((value & 0xf) << 4) | ((value >> 4) & 0xf);

  ctx.setFlag(Flag.Z, result === 0);
  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, false);
  ctx.setFlag(Flag.CY, false);

  return result;
}

export const testBitRegister = makeInstruction(
  (ctx, bit: number, reg: Register) => {
    testBit(ctx, ctx.readRegister(reg), bit);
  }
);

export const testBitIndirectHL = makeInstruction((ctx, bit: number) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  testBit(ctx, data, bit);
});

function testBit(ctx: InstructionContext, value: number, bit: number) {
  ctx.setFlag(Flag.Z, !(value & (1 << bit)));
  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, true);
}

export const resetBitRegister = makeInstruction(
  (ctx, bit: number, reg: Register) => {
    ctx.writeRegister(reg, resetBit(ctx.readRegister(reg), bit));
  }
);

export const resetBitIndirectHL = makeInstruction((ctx, bit: number) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  ctx.writeMemoryCycle(address, resetBit(data, bit));
});

export const setBitRegister = makeInstruction(
  (ctx, bit: number, reg: Register) => {
    ctx.writeRegister(reg, setBit(ctx.readRegister(reg), bit));
  }
);

export const setBitIndirectHL = makeInstruction((ctx, bit: number) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  ctx.writeMemoryCycle(address, setBit(data, bit));
});
