import { Register, RegisterPair } from "../cpu";
import { decrementWord, incrementWord } from "../utils";
import { fetchImmediateByte, fetchImmediateWord, InstructionCtx } from "./lib";

export function loadRegisterFromRegister(
  { regs }: InstructionCtx,
  destination: Register,
  source: Register
) {
  regs.write(destination, regs.read(source));
  return 4;
}

export function loadRegisterFromImmediate(
  ctx: InstructionCtx,
  destination: Register
) {
  const data = fetchImmediateByte(ctx);
  ctx.regs.write(destination, data);
  ctx.regs;
  return 8;
}

export function loadRegisterFromIndirectHL(
  ctx: InstructionCtx,
  destination: Register
) {
  const data = ctx.memory.read(ctx.regs.readPair(RegisterPair.HL));
  ctx.regs.write(destination, data);
  return 8;
}

export function loadIndirectHLFromRegister(
  ctx: InstructionCtx,
  source: Register
) {
  ctx.memory.write(ctx.regs.readPair(RegisterPair.HL), ctx.regs.read(source));
  return 8;
}

export const loadIndirectHLFromImmediateData = (ctx: InstructionCtx) => {
  const data = fetchImmediateByte(ctx);
  ctx.memory.write(ctx.regs.readPair(RegisterPair.HL), data);
  return 12;
};

export function loadAccumulatorFromIndirectBC(ctx: InstructionCtx) {
  const data = ctx.memory.read(ctx.regs.readPair(RegisterPair.BC));
  ctx.regs.write(Register.A, data);
  return 8;
}

export function loadAccumulatorFromIndirectDE(ctx: InstructionCtx) {
  const data = ctx.memory.read(ctx.regs.readPair(RegisterPair.DE));
  ctx.regs.write(Register.A, data);
  return 8;
}

export function loadIndirectBCFromAccumulator(ctx: InstructionCtx) {
  ctx.memory.write(
    ctx.regs.readPair(RegisterPair.BC),
    ctx.regs.read(Register.A)
  );
  return 8;
}

export function loadIndirectDEFromAccumulator(ctx: InstructionCtx) {
  ctx.memory.write(
    ctx.regs.readPair(RegisterPair.DE),
    ctx.regs.read(Register.A)
  );
  return 8;
}

export function loadAccumulatorFromDirectWord(ctx: InstructionCtx) {
  const address = fetchImmediateWord(ctx);
  ctx.regs.write(Register.A, ctx.memory.read(address));
  return 16;
}

export function loadDirectWordFromAccumulator(ctx: InstructionCtx) {
  const address = fetchImmediateWord(ctx);
  ctx.memory.write(address, ctx.regs.read(Register.A));
  return 16;
}

export function loadAccumulatorFromIndirectC(ctx: InstructionCtx) {
  const address = 0xff00 + ctx.regs.read(Register.C);
  ctx.regs.write(Register.A, ctx.memory.read(address));
  return 8;
}

export function loadIndirectCFromAccumulator(ctx: InstructionCtx) {
  const address = 0xff00 + ctx.regs.read(Register.C);
  ctx.memory.write(address, ctx.regs.read(Register.A));
  return 8;
}

export function loadAccumulatorFromDirectByte(ctx: InstructionCtx) {
  const address = 0xff00 + fetchImmediateByte(ctx);
  ctx.regs.write(Register.A, ctx.memory.read(address));
  return 12;
}

export function loadDirectByteFromAccumulator(ctx: InstructionCtx) {
  const address = 0xff00 + fetchImmediateByte(ctx);
  ctx.memory.write(address, ctx.regs.read(Register.A));
  return 12;
}

export function loadAccumulatorFromIndirectHLDecrement(ctx: InstructionCtx) {
  const address = ctx.regs.readPair(RegisterPair.HL);
  const data = ctx.memory.read(address);
  ctx.regs.write(Register.A, data);
  ctx.regs.writePair(RegisterPair.HL, address - 1);
  return 8;
}

export function loadAccumulatorFromIndirectHLIncrement(ctx: InstructionCtx) {
  const address = ctx.regs.readPair(RegisterPair.HL);
  const data = ctx.memory.read(address);
  ctx.regs.write(Register.A, data);
  ctx.regs.writePair(RegisterPair.HL, incrementWord(address));
  return 8;
}

export function loadIndirectHLDecrementFromAccumulator(ctx: InstructionCtx) {
  const address = ctx.regs.readPair(RegisterPair.HL);
  ctx.memory.write(address, ctx.regs.read(Register.A));
  ctx.regs.writePair(RegisterPair.HL, decrementWord(address));
  return 8;
}

export function loadIndirectHLIncrementFromAccumulator(ctx: InstructionCtx) {
  const address = ctx.regs.readPair(RegisterPair.HL);
  ctx.memory.write(address, ctx.regs.read(Register.A));
  ctx.regs.writePair(RegisterPair.HL, incrementWord(address));
  return 8;
}
