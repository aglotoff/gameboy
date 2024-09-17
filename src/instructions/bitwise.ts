import { Flag, Register } from "../cpu";
import { InstructionCtx } from "./lib";

export function rotateLeftCircularAccumulator(ctx: InstructionCtx) {
  const value = ctx.regs.read(Register.A);
  ctx.regs.write(Register.A, ((value << 1) | (value >> 7)) & 0xff);
  ctx.regs.setFlag(Flag.Z, false);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, (value & 0x80) != 0);
  return 4;
}

export function rotateRightCircularAccumulator(ctx: InstructionCtx) {
  const value = ctx.regs.read(Register.A);
  ctx.regs.write(Register.A, ((value >> 1) | (value << 7)) & 0xff);
  ctx.regs.setFlag(Flag.Z, false);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, (value & 0x01) != 0);
  return 4;
}

export function rotateLeftAccumulator(ctx: InstructionCtx) {
  const value = ctx.regs.read(Register.A);
  ctx.regs.write(
    Register.A,
    ((value << 1) & 0xff) | (ctx.regs.isFlagSet(Flag.CY) ? 1 : 0)
  );
  ctx.regs.setFlag(Flag.Z, false);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, (value & 0x80) != 0);
  return 4;
}

export function rotateRightAccumulator(ctx: InstructionCtx) {
  const value = ctx.regs.read(Register.A);
  ctx.regs.write(
    Register.A,
    ((value >> 1) & 0xff) | (ctx.regs.isFlagSet(Flag.CY) ? 0x80 : 0)
  );
  ctx.regs.setFlag(Flag.Z, false);
  ctx.regs.setFlag(Flag.N, false);
  ctx.regs.setFlag(Flag.H, false);
  ctx.regs.setFlag(Flag.CY, (value & 0x1) != 0);
  return 4;
}
