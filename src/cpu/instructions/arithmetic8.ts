import { InstructionContext, RegisterPair } from "../cpu-state";
import { Flag, Register } from "../register";
import {
  addBytes,
  makeInstruction,
  makeInstructionWithImmediateByte,
  subtractBytes,
} from "./lib";

export const addRegister = makeInstruction((ctx, reg: Register) => {
  doAdd(ctx, ctx.readRegister(reg));
});

export const addIndirectHL = makeInstruction((ctx) => {
  const data = ctx.readMemoryCycle(ctx.readRegisterPair(RegisterPair.HL));

  doAdd(ctx, data);
});

export const addImmediate = makeInstructionWithImmediateByte(doAdd);

export const addRegisterWithCarry = makeInstruction((ctx, reg: Register) => {
  doAdd(ctx, ctx.readRegister(reg), ctx.getFlag(Flag.CY));
});

export const addIndirectHLWithCarry = makeInstruction((ctx) => {
  const data = ctx.readMemoryCycle(ctx.readRegisterPair(RegisterPair.HL));

  doAdd(ctx, data, ctx.getFlag(Flag.CY));
});

export const addImmediateWithCarry = makeInstructionWithImmediateByte(
  (ctx, data) => {
    doAdd(ctx, data, ctx.getFlag(Flag.CY));
  }
);

function doAdd(ctx: InstructionContext, value: number, carry = false) {
  const { result, carryFrom3, carryFrom7 } = addBytes(
    ctx.readRegister(Register.A),
    value,
    carry
  );

  ctx.writeRegister(Register.A, result);

  ctx.setFlag(Flag.Z, result === 0);
  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, carryFrom3);
  ctx.setFlag(Flag.CY, carryFrom7);
}

export const subtractRegister = makeInstruction((ctx, reg: Register) => {
  doSubtract(ctx, ctx.readRegister(reg));
});

export const subtractIndirectHL = makeInstruction((ctx) => {
  const data = ctx.readMemoryCycle(ctx.readRegisterPair(RegisterPair.HL));

  doSubtract(ctx, data);
});

export const subtractImmediate = makeInstructionWithImmediateByte(doSubtract);

export const subtractRegisterWithCarry = makeInstruction(
  (ctx, reg: Register) => {
    doSubtract(ctx, ctx.readRegister(reg), ctx.getFlag(Flag.CY));
  }
);

export const subtractIndirectHLWithCarry = makeInstruction((ctx) => {
  const data = ctx.readMemoryCycle(ctx.readRegisterPair(RegisterPair.HL));
  doSubtract(ctx, data, ctx.getFlag(Flag.CY));
});

export const subtractImmediateWithCarry = makeInstructionWithImmediateByte(
  (ctx, data) => {
    doSubtract(ctx, data, ctx.getFlag(Flag.CY));
  }
);

function doSubtract(ctx: InstructionContext, value: number, carry = false) {
  const { result, borrowTo3, borrowTo7 } = subtractBytes(
    ctx.readRegister(Register.A),
    value,
    carry
  );

  ctx.writeRegister(Register.A, result);

  ctx.setFlag(Flag.Z, result === 0);
  ctx.setFlag(Flag.N, true);
  ctx.setFlag(Flag.H, borrowTo3);
  ctx.setFlag(Flag.CY, borrowTo7);
}

export const compareRegister = makeInstruction((ctx, reg: Register) => {
  doCompare(ctx, ctx.readRegister(reg));
});

export const compareIndirectHL = makeInstruction((ctx) => {
  const data = ctx.readMemoryCycle(ctx.readRegisterPair(RegisterPair.HL));
  doCompare(ctx, data);
});

export const compareImmediate = makeInstructionWithImmediateByte(doCompare);

function doCompare(ctx: InstructionContext, value: number) {
  const { result, borrowTo3, borrowTo7 } = subtractBytes(
    ctx.readRegister(Register.A),
    value
  );

  ctx.setFlag(Flag.Z, result === 0);
  ctx.setFlag(Flag.N, true);
  ctx.setFlag(Flag.H, borrowTo3);
  ctx.setFlag(Flag.CY, borrowTo7);
}

export const incrementRegister = makeInstruction((ctx, reg: Register) => {
  ctx.writeRegister(reg, doIncrement(ctx, ctx.readRegister(reg)));
});

export const incrementIndirectHL = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  ctx.writeMemoryCycle(address, doIncrement(ctx, data));
});

function doIncrement(ctx: InstructionContext, value: number) {
  const { result, carryFrom3 } = addBytes(value, 1);

  ctx.setFlag(Flag.Z, result === 0);
  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, carryFrom3);

  return result;
}

export const decrementRegister = makeInstruction((ctx, reg: Register) => {
  ctx.writeRegister(reg, doDecrement(ctx, ctx.readRegister(reg)));
});

export const decrementIndirectHL = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);
  ctx.writeMemoryCycle(address, doDecrement(ctx, data));
});

function doDecrement(ctx: InstructionContext, value: number) {
  const { result, borrowTo3 } = subtractBytes(value, 1);

  ctx.setFlag(Flag.Z, result === 0);
  ctx.setFlag(Flag.N, true);
  ctx.setFlag(Flag.H, borrowTo3);

  return result;
}

export const andRegister = makeInstruction((ctx, reg: Register) => {
  doAnd(ctx, ctx.readRegister(reg));
});

export const andIndirectHL = makeInstruction((ctx) => {
  const data = ctx.readMemoryCycle(ctx.readRegisterPair(RegisterPair.HL));
  doAnd(ctx, data);
});

export const andImmediate = makeInstructionWithImmediateByte(doAnd);

function doAnd(ctx: InstructionContext, value: number) {
  const result = ctx.readRegister(Register.A) & value;

  ctx.writeRegister(Register.A, result);

  ctx.setFlag(Flag.Z, result === 0);
  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, true);
  ctx.setFlag(Flag.CY, false);
}

export const orRegister = makeInstruction((ctx, reg: Register) => {
  doOr(ctx, ctx.readRegister(reg));
});

export const orIndirectHL = makeInstruction((ctx) => {
  const data = ctx.readMemoryCycle(ctx.readRegisterPair(RegisterPair.HL));
  doOr(ctx, data);
});

export const orImmediate = makeInstructionWithImmediateByte(doOr);

function doOr(ctx: InstructionContext, value: number) {
  const result = ctx.readRegister(Register.A) | value;

  ctx.writeRegister(Register.A, result);

  ctx.setFlag(Flag.Z, result === 0);
  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, false);
  ctx.setFlag(Flag.CY, false);
}

export const xorRegister = makeInstruction((ctx, reg: Register) => {
  doXor(ctx, ctx.readRegister(reg));
});

export const xorIndirectHL = makeInstruction((ctx) => {
  const data = ctx.readMemoryCycle(ctx.readRegisterPair(RegisterPair.HL));
  doXor(ctx, data);
});

export const xorImmediate = makeInstructionWithImmediateByte(doXor);

function doXor(ctx: InstructionContext, value: number) {
  const result = ctx.readRegister(Register.A) ^ value;

  ctx.writeRegister(Register.A, result);

  ctx.setFlag(Flag.Z, result === 0);
  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, false);
  ctx.setFlag(Flag.CY, false);
}

export const complementCarryFlag = makeInstruction((ctx) => {
  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, false);
  ctx.setFlag(Flag.CY, !ctx.getFlag(Flag.CY));
});

export const setCarryFlag = makeInstruction((ctx) => {
  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, false);
  ctx.setFlag(Flag.CY, true);
});

export const decimalAdjustAccumulator = makeInstruction((ctx) => {
  let a = ctx.readRegister(Register.A);
  const cy = ctx.getFlag(Flag.CY);
  const h = ctx.getFlag(Flag.H);
  const n = ctx.getFlag(Flag.N);

  let offset = 0;
  let carry = false;

  if ((!n && (a & 0xf) > 0x09) || h) {
    offset |= 0x06;
  }

  if ((!n && a > 0x99) || cy) {
    offset |= 0x60;
    carry = true;
  }

  if (!n) {
    a = (a + offset) & 0xff;
  } else {
    a = (a - offset) & 0xff;
  }

  ctx.writeRegister(Register.A, a);

  ctx.setFlag(Flag.Z, a === 0);
  ctx.setFlag(Flag.H, false);
  ctx.setFlag(Flag.CY, carry);
});

export const complementAccumulator = makeInstruction((ctx) => {
  ctx.writeRegister(Register.A, ~ctx.readRegister(Register.A));
  ctx.setFlag(Flag.N, true);
  ctx.setFlag(Flag.H, true);
});
