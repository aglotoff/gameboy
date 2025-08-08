import { Register } from "../register";
import { wrappingDecrementWord, wrappingIncrementWord } from "../../utils";
import {
  makeInstruction,
  makeInstructionWithImmediateByte,
  makeInstructionWithImmediateWord,
} from "./lib";
import { RegisterPair } from "../cpu-state";

export const loadRegisterFromRegister = makeInstruction(
  (ctx, dst: Register, src: Register) => {
    ctx.writeRegister(dst, ctx.readRegister(src));
  }
);

export const loadRegisterFromImmediate = makeInstructionWithImmediateByte(
  (ctx, data, dst: Register) => {
    ctx.writeRegister(dst, data);
  }
);

export const loadRegisterFromIndirectHL = makeInstruction(
  (ctx, dst: Register) => {
    const data = ctx.readMemoryCycle(ctx.readRegisterPair(RegisterPair.HL));
    ctx.writeRegister(dst, data);
  }
);

export const loadIndirectHLFromRegister = makeInstruction(
  (ctx, src: Register) => {
    ctx.writeMemoryCycle(
      ctx.readRegisterPair(RegisterPair.HL),
      ctx.readRegister(src)
    );
  }
);

export const loadIndirectHLFromImmediateData = makeInstructionWithImmediateByte(
  (ctx, data) => {
    ctx.writeMemoryCycle(ctx.readRegisterPair(RegisterPair.HL), data);
  }
);

export const loadAccumulatorFromIndirectBC = makeInstruction((ctx) => {
  const data = ctx.readMemoryCycle(ctx.readRegisterPair(RegisterPair.BC));
  ctx.writeRegister(Register.A, data);
});

export const loadAccumulatorFromIndirectDE = makeInstruction((ctx) => {
  const data = ctx.readMemoryCycle(ctx.readRegisterPair(RegisterPair.DE));
  ctx.writeRegister(Register.A, data);
});

export const loadIndirectBCFromAccumulator = makeInstruction((ctx) => {
  ctx.writeMemoryCycle(
    ctx.readRegisterPair(RegisterPair.BC),
    ctx.readRegister(Register.A)
  );
});

export const loadIndirectDEFromAccumulator = makeInstruction((ctx) => {
  ctx.writeMemoryCycle(
    ctx.readRegisterPair(RegisterPair.DE),
    ctx.readRegister(Register.A)
  );
});

export const loadAccumulatorFromDirectWord = makeInstructionWithImmediateWord(
  (ctx, address) => {
    const data = ctx.readMemoryCycle(address);
    ctx.writeRegister(Register.A, data);
  }
);

export const loadDirectWordFromAccumulator = makeInstructionWithImmediateWord(
  (ctx, address) => {
    ctx.writeMemoryCycle(address, ctx.readRegister(Register.A));
  }
);

export const loadAccumulatorFromIndirectC = makeInstruction((ctx) => {
  const address = 0xff00 + ctx.readRegister(Register.C);
  const data = ctx.readMemoryCycle(address);

  ctx.writeRegister(Register.A, data);
});

export const loadIndirectCFromAccumulator = makeInstruction((ctx) => {
  const address = 0xff00 + ctx.readRegister(Register.C);
  ctx.writeMemoryCycle(address, ctx.readRegister(Register.A));
});

export const loadAccumulatorFromDirectByte = makeInstructionWithImmediateByte(
  (ctx, offset) => {
    const address = 0xff00 + offset;
    const data = ctx.readMemoryCycle(address);

    ctx.writeRegister(Register.A, data);
  }
);

export const loadDirectByteFromAccumulator = makeInstructionWithImmediateByte(
  (ctx, offset) => {
    const address = 0xff00 + offset;
    ctx.writeMemoryCycle(address, ctx.readRegister(Register.A));
  }
);

export const loadAccumulatorFromIndirectHLDecrement = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemory(address);

  ctx.triggerMemoryIncrementRead(address);
  ctx.writeRegisterPair(RegisterPair.HL, wrappingDecrementWord(address));

  ctx.beginNextCycle();

  ctx.writeRegister(Register.A, data);
});

export const loadAccumulatorFromIndirectHLIncrement = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemory(address);

  ctx.triggerMemoryIncrementRead(address);
  ctx.writeRegisterPair(RegisterPair.HL, wrappingIncrementWord(address));

  ctx.beginNextCycle();

  ctx.writeRegister(Register.A, data);
});

export const loadIndirectHLDecrementFromAccumulator = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  ctx.writeMemory(address, ctx.readRegister(Register.A));

  ctx.triggerMemoryWrite(address);
  ctx.writeRegisterPair(RegisterPair.HL, wrappingDecrementWord(address));

  ctx.beginNextCycle();
});

export const loadIndirectHLIncrementFromAccumulator = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  ctx.writeMemory(address, ctx.readRegister(Register.A));

  ctx.triggerMemoryWrite(address);
  ctx.writeRegisterPair(RegisterPair.HL, wrappingIncrementWord(address));

  ctx.beginNextCycle();
});
