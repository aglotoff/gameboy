import { Register, RegisterPair } from "../register";
import { wrappingDecrementWord, wrappingIncrementWord } from "../../utils";
import {
  makeInstruction,
  makeInstructionWithImmediateByte,
  makeInstructionWithImmediateWord,
} from "./lib";

export const loadRegisterFromRegister = makeInstruction(
  (ctx, dst: Register, src: Register) => {
    ctx.registers.write(dst, ctx.registers.read(src));
  }
);

export const loadRegisterFromImmediate = makeInstructionWithImmediateByte(
  (ctx, data, dst: Register) => {
    ctx.registers.write(dst, data);
  }
);

export const loadRegisterFromIndirectHL = makeInstruction(
  (ctx, dst: Register) => {
    const data = ctx.memory.read(ctx.registers.readPair(RegisterPair.HL));

    ctx.state.beginNextCycle();

    ctx.registers.write(dst, data);
  }
);

export const loadIndirectHLFromRegister = makeInstruction(
  (ctx, src: Register) => {
    ctx.memory.write(
      ctx.registers.readPair(RegisterPair.HL),
      ctx.registers.read(src)
    );

    ctx.state.beginNextCycle();
  }
);

export const loadIndirectHLFromImmediateData = makeInstructionWithImmediateByte(
  (ctx, data) => {
    ctx.memory.write(ctx.registers.readPair(RegisterPair.HL), data);
    ctx.state.beginNextCycle();
  }
);

export const loadAccumulatorFromIndirectBC = makeInstruction((ctx) => {
  const data = ctx.memory.read(ctx.registers.readPair(RegisterPair.BC));

  ctx.state.beginNextCycle();

  ctx.registers.write(Register.A, data);
});

export const loadAccumulatorFromIndirectDE = makeInstruction((ctx) => {
  const data = ctx.memory.read(ctx.registers.readPair(RegisterPair.DE));

  ctx.state.beginNextCycle();

  ctx.registers.write(Register.A, data);
});

export const loadIndirectBCFromAccumulator = makeInstruction((ctx) => {
  ctx.memory.write(
    ctx.registers.readPair(RegisterPair.BC),
    ctx.registers.read(Register.A)
  );

  ctx.state.beginNextCycle();
});

export const loadIndirectDEFromAccumulator = makeInstruction((ctx) => {
  ctx.memory.write(
    ctx.registers.readPair(RegisterPair.DE),
    ctx.registers.read(Register.A)
  );

  ctx.state.beginNextCycle();
});

export const loadAccumulatorFromDirectWord = makeInstructionWithImmediateWord(
  (ctx, address) => {
    const data = ctx.memory.read(address);

    ctx.state.beginNextCycle();

    ctx.registers.write(Register.A, data);
  }
);

export const loadDirectWordFromAccumulator = makeInstructionWithImmediateWord(
  (ctx, address) => {
    ctx.memory.write(address, ctx.registers.read(Register.A));
    ctx.state.beginNextCycle();
  }
);

export const loadAccumulatorFromIndirectC = makeInstruction((ctx) => {
  const address = makeHighAddress(ctx.registers.read(Register.C));
  const data = ctx.memory.read(address);

  ctx.state.beginNextCycle();

  ctx.registers.write(Register.A, data);
});

export const loadIndirectCFromAccumulator = makeInstruction((ctx) => {
  const address = makeHighAddress(ctx.registers.read(Register.C));
  ctx.memory.write(address, ctx.registers.read(Register.A));

  ctx.state.beginNextCycle();
});

export const loadAccumulatorFromDirectByte = makeInstructionWithImmediateByte(
  (ctx, offset) => {
    const data = ctx.memory.read(makeHighAddress(offset));

    ctx.state.beginNextCycle();

    ctx.registers.write(Register.A, data);
  }
);

export const loadDirectByteFromAccumulator = makeInstructionWithImmediateByte(
  (ctx, offset) => {
    ctx.memory.write(makeHighAddress(offset), ctx.registers.read(Register.A));
    ctx.state.beginNextCycle();
  }
);

function makeHighAddress(offset: number) {
  return 0xff00 + offset;
}

export const loadAccumulatorFromIndirectHLDecrement = makeInstruction((ctx) => {
  const address = ctx.registers.readPair(RegisterPair.HL);

  ctx.registers.writePair(RegisterPair.HL, wrappingDecrementWord(address));
  ctx.memory.triggerReadWrite(address);

  const data = ctx.memory.read(address);

  ctx.state.beginNextCycle();

  ctx.registers.write(Register.A, data);
});

export const loadAccumulatorFromIndirectHLIncrement = makeInstruction((ctx) => {
  const address = ctx.registers.readPair(RegisterPair.HL);

  ctx.registers.writePair(RegisterPair.HL, wrappingIncrementWord(address));
  ctx.memory.triggerReadWrite(address);

  const data = ctx.memory.read(address);

  ctx.state.beginNextCycle();

  ctx.registers.write(Register.A, data);
});

export const loadIndirectHLDecrementFromAccumulator = makeInstruction((ctx) => {
  const address = ctx.registers.readPair(RegisterPair.HL);

  ctx.registers.writePair(RegisterPair.HL, wrappingDecrementWord(address));
  ctx.memory.triggerWrite(address);

  ctx.memory.write(address, ctx.registers.read(Register.A));

  ctx.state.beginNextCycle();
});

export const loadIndirectHLIncrementFromAccumulator = makeInstruction((ctx) => {
  const address = ctx.registers.readPair(RegisterPair.HL);

  ctx.registers.writePair(RegisterPair.HL, wrappingIncrementWord(address));
  ctx.memory.triggerWrite(address);

  ctx.memory.write(address, ctx.registers.read(Register.A));

  ctx.state.beginNextCycle();
});
