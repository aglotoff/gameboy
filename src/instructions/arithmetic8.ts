import { Flag, Register, RegisterPair } from "../cpu";
import { addBytes, subtractBytes } from "../utils";
import { fetchImmediateByte, InstructionCtx } from "./lib";

function addToAccumulator(ctx: InstructionCtx, value: number, carry = false) {
  const { result, carryFrom3, carryFrom7 } = addBytes(
    ctx.regs.read(Register.A),
    value,
    carry && ctx.regs.isFlagSet(Flag.CY)
  );

  ctx.regs.write(Register.A, result);
  ctx.regs.setFlag(Flag.Z, result === 0);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, carryFrom3);
  ctx.regs.setFlag(Flag.CY, carryFrom7);
}

export function addRegister(ctx: InstructionCtx, r: Register) {
  addToAccumulator(ctx, ctx.regs.read(r));
  return 4;
}

export function addIndirectHL(ctx: InstructionCtx) {
  addToAccumulator(ctx, ctx.memory.read(ctx.regs.readPair(RegisterPair.HL)));
  return 8;
}

export function addImmediate(ctx: InstructionCtx) {
  addToAccumulator(ctx, fetchImmediateByte(ctx));
  return 8;
}

export function addRegisterWithCarry(ctx: InstructionCtx, r: Register) {
  addToAccumulator(ctx, ctx.regs.read(r), true);
  return 4;
}

export function addIndirectHLWithCarry(ctx: InstructionCtx) {
  addToAccumulator(
    ctx,
    ctx.memory.read(ctx.regs.readPair(RegisterPair.HL)),
    true
  );
  return 8;
}

export function addImmediateWithCarry(ctx: InstructionCtx) {
  addToAccumulator(ctx, fetchImmediateByte(ctx), true);
  return 8;
}

function subtractFromAccumulator(
  ctx: InstructionCtx,
  value: number,
  carry = false
) {
  const { result, borrowTo3, borrowTo7 } = subtractBytes(
    ctx.regs.read(Register.A),
    value,
    carry && ctx.regs.isFlagSet(Flag.CY)
  );

  ctx.regs.write(Register.A, result);
  ctx.regs.setFlag(Flag.Z, result === 0);
  ctx.regs.setFlag(Flag.N, true);
  ctx.regs.setFlag(Flag.H, borrowTo3);
  ctx.regs.setFlag(Flag.CY, borrowTo7);
}

export function subtractRegister(ctx: InstructionCtx, r: Register) {
  subtractFromAccumulator(ctx, ctx.regs.read(r));
  return 4;
}

export function subtractIndirectHL(ctx: InstructionCtx) {
  subtractFromAccumulator(
    ctx,
    ctx.memory.read(ctx.regs.readPair(RegisterPair.HL))
  );
  return 8;
}

export function subtractImmediate(ctx: InstructionCtx) {
  subtractFromAccumulator(ctx, fetchImmediateByte(ctx));
  return 8;
}

export function subtractRegisterWithCarry(ctx: InstructionCtx, r: Register) {
  subtractFromAccumulator(ctx, ctx.regs.read(r), true);
  return 4;
}

export function subtractIndirectHLWithCarry(ctx: InstructionCtx) {
  subtractFromAccumulator(
    ctx,
    ctx.memory.read(ctx.regs.readPair(RegisterPair.HL)),
    true
  );
  return 8;
}

export function subtractImmediateWithCarry(ctx: InstructionCtx) {
  subtractFromAccumulator(ctx, fetchImmediateByte(ctx), true);
  return 8;
}

function compareWithAccumulator(ctx: InstructionCtx, value: number) {
  const { result, borrowTo3, borrowTo7 } = subtractBytes(
    ctx.regs.read(Register.A),
    value
  );

  ctx.regs.setFlag(Flag.Z, result === 0);
  ctx.regs.setFlag(Flag.N, true);
  ctx.regs.setFlag(Flag.H, borrowTo3);
  ctx.regs.setFlag(Flag.CY, borrowTo7);
}

export function compareRegister(ctx: InstructionCtx, r: Register) {
  compareWithAccumulator(ctx, ctx.regs.read(r));
  return 4;
}

export function compareIndirectHL(ctx: InstructionCtx) {
  compareWithAccumulator(
    ctx,
    ctx.memory.read(ctx.regs.readPair(RegisterPair.HL))
  );
  return 8;
}

export function compareImmediate(ctx: InstructionCtx) {
  compareWithAccumulator(ctx, fetchImmediateByte(ctx));
  return 8;
}

function incrementAndSetFlags(ctx: InstructionCtx, value: number) {
  const { result, carryFrom3 } = addBytes(value, 1);

  ctx.regs.setFlag(Flag.Z, result === 0);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, carryFrom3);

  return result;
}

export function incrementRegister(ctx: InstructionCtx, r: Register) {
  ctx.regs.write(r, incrementAndSetFlags(ctx, ctx.regs.read(r)));
  return 4;
}

export function incrementIndirectHL(ctx: InstructionCtx) {
  const address = ctx.regs.readPair(RegisterPair.HL);
  ctx.memory.write(
    address,
    incrementAndSetFlags(ctx, ctx.memory.read(address))
  );
  return 12;
}

function decrement(ctx: InstructionCtx, value: number) {
  const { result, borrowTo3 } = subtractBytes(value, 1);

  ctx.regs.setFlag(Flag.Z, result === 0);
  ctx.regs.setFlag(Flag.N, true);
  ctx.regs.setFlag(Flag.H, borrowTo3);

  return result;
}

export function decrementRegister(ctx: InstructionCtx, r: Register) {
  ctx.regs.write(r, decrement(ctx, ctx.regs.read(r)));
  return 4;
}

export function decrementIndirectHL(ctx: InstructionCtx) {
  const address = ctx.regs.readPair(RegisterPair.HL);
  ctx.memory.write(address, decrement(ctx, ctx.memory.read(address)));
  return 12;
}

function andAccumulator(ctx: InstructionCtx, value: number) {
  const result = ctx.regs.read(Register.A) & value;

  ctx.regs.write(Register.A, result);
  ctx.regs.setFlag(Flag.Z, result === 0);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, true);
  ctx.regs.setFlag(Flag.CY, false);
}

export function andRegister(ctx: InstructionCtx, r: Register) {
  andAccumulator(ctx, ctx.regs.read(r));
  return 4;
}

export function andIndirectHL(ctx: InstructionCtx) {
  andAccumulator(ctx, ctx.memory.read(ctx.regs.readPair(RegisterPair.HL)));
  return 8;
}

export function andImmediate(ctx: InstructionCtx) {
  andAccumulator(ctx, fetchImmediateByte(ctx));
  return 8;
}

function orAccumulator(ctx: InstructionCtx, value: number) {
  const result = ctx.regs.read(Register.A) | value;

  ctx.regs.write(Register.A, result);
  ctx.regs.setFlag(Flag.Z, result === 0);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, false);
}

export function orRegister(ctx: InstructionCtx, r: Register) {
  orAccumulator(ctx, ctx.regs.read(r));
  return 4;
}

export function orIndirectHL(ctx: InstructionCtx) {
  orAccumulator(ctx, ctx.memory.read(ctx.regs.readPair(RegisterPair.HL)));
  return 8;
}

export function orImmediate(ctx: InstructionCtx) {
  orAccumulator(ctx, fetchImmediateByte(ctx));
  return 8;
}

function xorAccumulator(ctx: InstructionCtx, value: number) {
  const result = ctx.regs.read(Register.A) ^ value;

  ctx.regs.write(Register.A, result);
  ctx.regs.setFlag(Flag.Z, result === 0);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, false);
}

export function xorRegister(ctx: InstructionCtx, r: Register) {
  xorAccumulator(ctx, ctx.regs.read(r));
  return 4;
}

export function xorIndirectHL(ctx: InstructionCtx) {
  xorAccumulator(ctx, ctx.memory.read(ctx.regs.readPair(RegisterPair.HL)));
  return 8;
}

export function xorImmediate(ctx: InstructionCtx) {
  xorAccumulator(ctx, fetchImmediateByte(ctx));
  return 8;
}

export function complementCarryFlag(ctx: InstructionCtx) {
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, !ctx.regs.isFlagSet(Flag.CY));
  return 4;
}

export function setCarryFlag(ctx: InstructionCtx) {
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, true);
  return 4;
}

export function decimalAdjustAccumulator(ctx: InstructionCtx) {
  const a = ctx.regs.read(Register.A);
  const cy = ctx.regs.isFlagSet(Flag.CY);
  const h = ctx.regs.isFlagSet(Flag.H);

  const high = (a >> 4) & 0xf;
  const low = a & 0xf;

  if (!ctx.regs.isFlagSet(Flag.N)) {
    if (!cy && high <= 0x9 && !h && low <= 0x9) {
      ctx.regs.write(Register.A, a + 0x00);
      ctx.regs.setFlag(Flag.CY, false);
    } else if (!cy && high <= 0x8 && !h && low >= 0xa) {
      ctx.regs.write(Register.A, a + 0x06);
      ctx.regs.setFlag(Flag.CY, false);
    } else if (!cy && high <= 0x9 && h && low <= 0x3) {
      ctx.regs.write(Register.A, a + 0x06);
      ctx.regs.setFlag(Flag.CY, false);
    } else if (!cy && high >= 0xa && !h && low <= 0x9) {
      ctx.regs.write(Register.A, a + 0x60);
      ctx.regs.setFlag(Flag.CY, true);
    } else if (!cy && high >= 0x9 && !h && low >= 0xa) {
      ctx.regs.write(Register.A, a + 0x66);
      ctx.regs.setFlag(Flag.CY, true);
    } else if (!cy && high >= 0xa && h && low <= 0x3) {
      ctx.regs.write(Register.A, a + 0x66);
      ctx.regs.setFlag(Flag.CY, true);
    } else if (cy && high <= 0x2 && !h && low <= 0x9) {
      ctx.regs.write(Register.A, a + 0x60);
      ctx.regs.setFlag(Flag.CY, true);
    } else if (cy && high <= 0x2 && !h && low >= 0xa) {
      ctx.regs.write(Register.A, a + 0x66);
      ctx.regs.setFlag(Flag.CY, true);
    } else if (cy && high <= 0x3 && h && low <= 0x3) {
      ctx.regs.write(Register.A, a + 0x66);
      ctx.regs.setFlag(Flag.CY, true);
    }
  } else {
    if (!cy && high <= 0x9 && !h && low <= 0x9) {
      ctx.regs.write(Register.A, a + 0x00);
      ctx.regs.setFlag(Flag.CY, false);
    } else if (!cy && high <= 0x8 && h && low >= 0x6) {
      ctx.regs.write(Register.A, a + 0xfa);
      ctx.regs.setFlag(Flag.CY, false);
    } else if (cy && high >= 0x7 && !h && low <= 0x9) {
      ctx.regs.write(Register.A, a + 0xa0);
      ctx.regs.setFlag(Flag.CY, false);
    } else if (cy && high >= 0x6 && h && low >= 0x6) {
      ctx.regs.write(Register.A, a + 0x9a);
      ctx.regs.setFlag(Flag.CY, false);
    }
  }

  ctx.regs.setFlag(Flag.H, false);

  return 4;
}

export function complementAccumulator(ctx: InstructionCtx) {
  ctx.regs.write(Register.A, ~ctx.regs.read(Register.A));
  ctx.regs.setFlag(Flag.N, true);
  ctx.regs.setFlag(Flag.H, true);
  return 4;
}
