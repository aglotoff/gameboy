import { Register, RegisterPair } from "../register";
import { wrappingDecrementWord, wrappingIncrementWord } from "../../utils";
import {
  makeInstruction,
  makeInstructionWithImmediateByte,
  makeInstructionWithImmediateWord,
} from "./lib";

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
    const data = ctx.readMemory(ctx.readRegisterPair(RegisterPair.HL));

    ctx.beginNextCycle();

    ctx.writeRegister(dst, data);
  }
);

export const loadIndirectHLFromRegister = makeInstruction(
  (ctx, src: Register) => {
    ctx.writeMemory(
      ctx.readRegisterPair(RegisterPair.HL),
      ctx.readRegister(src)
    );

    ctx.beginNextCycle();
  }
);

export const loadIndirectHLFromImmediateData = makeInstructionWithImmediateByte(
  (ctx, data) => {
    ctx.writeMemory(ctx.readRegisterPair(RegisterPair.HL), data);
    ctx.beginNextCycle();
  }
);

export const loadAccumulatorFromIndirectBC = makeInstruction((ctx) => {
  const data = ctx.readMemory(ctx.readRegisterPair(RegisterPair.BC));

  ctx.beginNextCycle();

  ctx.writeRegister(Register.A, data);
});

export const loadAccumulatorFromIndirectDE = makeInstruction((ctx) => {
  const data = ctx.readMemory(ctx.readRegisterPair(RegisterPair.DE));

  ctx.beginNextCycle();

  ctx.writeRegister(Register.A, data);
});

export const loadIndirectBCFromAccumulator = makeInstruction((ctx) => {
  ctx.writeMemory(
    ctx.readRegisterPair(RegisterPair.BC),
    ctx.readRegister(Register.A)
  );

  ctx.beginNextCycle();
});

export const loadIndirectDEFromAccumulator = makeInstruction((ctx) => {
  ctx.writeMemory(
    ctx.readRegisterPair(RegisterPair.DE),
    ctx.readRegister(Register.A)
  );

  ctx.beginNextCycle();
});

export const loadAccumulatorFromDirectWord = makeInstructionWithImmediateWord(
  (ctx, address) => {
    const data = ctx.readMemory(address);

    ctx.beginNextCycle();

    ctx.writeRegister(Register.A, data);
  }
);

export const loadDirectWordFromAccumulator = makeInstructionWithImmediateWord(
  (ctx, address) => {
    ctx.writeMemory(address, ctx.readRegister(Register.A));
    ctx.beginNextCycle();
  }
);

export const loadAccumulatorFromIndirectC = makeInstruction((ctx) => {
  const address = makeHighAddress(ctx.readRegister(Register.C));
  const data = ctx.readMemory(address);

  ctx.beginNextCycle();

  ctx.writeRegister(Register.A, data);
});

export const loadIndirectCFromAccumulator = makeInstruction((ctx) => {
  const address = makeHighAddress(ctx.readRegister(Register.C));
  ctx.writeMemory(address, ctx.readRegister(Register.A));

  ctx.beginNextCycle();
});

export const loadAccumulatorFromDirectByte = makeInstructionWithImmediateByte(
  (ctx, offset) => {
    const data = ctx.readMemory(makeHighAddress(offset));

    ctx.beginNextCycle();

    ctx.writeRegister(Register.A, data);
  }
);

export const loadDirectByteFromAccumulator = makeInstructionWithImmediateByte(
  (ctx, offset) => {
    ctx.writeMemory(makeHighAddress(offset), ctx.readRegister(Register.A));
    ctx.beginNextCycle();
  }
);

function makeHighAddress(offset: number) {
  return 0xff00 + offset;
}

export const loadAccumulatorFromIndirectHLDecrement = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);

  ctx.writeRegisterPair(RegisterPair.HL, wrappingDecrementWord(address));
  ctx.triggerMemoryReadWrite(address);

  const data = ctx.readMemory(address);

  ctx.beginNextCycle();

  ctx.writeRegister(Register.A, data);
});

export const loadAccumulatorFromIndirectHLIncrement = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);

  ctx.writeRegisterPair(RegisterPair.HL, wrappingIncrementWord(address));
  ctx.triggerMemoryReadWrite(address);

  const data = ctx.readMemory(address);

  ctx.beginNextCycle();

  ctx.writeRegister(Register.A, data);
});

export const loadIndirectHLDecrementFromAccumulator = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);

  ctx.writeRegisterPair(RegisterPair.HL, wrappingDecrementWord(address));
  ctx.triggerMemoryWrite(address);

  ctx.writeMemory(address, ctx.readRegister(Register.A));

  ctx.beginNextCycle();
});

export const loadIndirectHLIncrementFromAccumulator = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);

  ctx.writeRegisterPair(RegisterPair.HL, wrappingIncrementWord(address));
  ctx.triggerMemoryWrite(address);

  ctx.writeMemory(address, ctx.readRegister(Register.A));

  ctx.beginNextCycle();
});
