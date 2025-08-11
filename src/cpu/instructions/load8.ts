import { Register } from "../register";
import { RegisterPair } from "../cpu-state";

import {
  makeInstruction,
  makeInstructionWithImmediateByte,
  makeInstructionWithImmediateWord,
} from "./lib";

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#LD_r8,r8
export const loadRegisterFromRegister = makeInstruction(
  (ctx, dst: Register, src: Register) => {
    ctx.writeRegister(dst, ctx.readRegister(src));
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#LD_r8,n8
export const loadRegisterFromImmediate = makeInstructionWithImmediateByte(
  (ctx, data, dst: Register) => {
    ctx.writeRegister(dst, data);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#LD_r8,_HL_
export const loadRegisterFromPointerInHL = makeInstruction(
  (ctx, dst: Register) => {
    const address = ctx.readRegisterPair(RegisterPair.HL);
    const data = ctx.readMemoryCycle(address);

    ctx.writeRegister(dst, data);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#LD__HL_,n8
export const loadPointerInHLFromRegister = makeInstruction(
  (ctx, src: Register) => {
    const address = ctx.readRegisterPair(RegisterPair.HL);
    const data = ctx.readRegister(src);

    ctx.writeMemoryCycle(address, data);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#LD__HL_,n8
export const loadPointerInHLFromImmediateData =
  makeInstructionWithImmediateByte((ctx, data) => {
    const address = ctx.readRegisterPair(RegisterPair.HL);
    ctx.writeMemoryCycle(address, data);
  });

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#LD_A,_r16_
export const loadAccumulatorFromPointerInBC = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.BC);
  const data = ctx.readMemoryCycle(address);

  ctx.writeRegister(Register.A, data);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#LD_A,_r16_
export const loadAccumulatorFromPointerInDE = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.DE);
  const data = ctx.readMemoryCycle(address);

  ctx.writeRegister(Register.A, data);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#LD__r16_,A
export const loadPointerInBCFromAccumulator = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.BC);
  const data = ctx.readRegister(Register.A);

  ctx.writeMemoryCycle(address, data);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#LD__r16_,A
export const loadPointerInDEFromAccumulator = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.DE);
  const data = ctx.readRegister(Register.A);

  ctx.writeMemoryCycle(address, data);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#LD_A,_n16_
export const loadAccumulatorFromDirectWord = makeInstructionWithImmediateWord(
  (ctx, address) => {
    const data = ctx.readMemoryCycle(address);
    ctx.writeRegister(Register.A, data);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#LD__n16_,A
export const loadDirectWordFromAccumulator = makeInstructionWithImmediateWord(
  (ctx, address) => {
    const data = ctx.readRegister(Register.A);
    ctx.writeMemoryCycle(address, data);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#LDH_A,_C_
export const loadAccumulatorFromPointerInC = makeInstruction((ctx) => {
  const address = makeHighAddress(ctx.readRegister(Register.C));
  const data = ctx.readMemoryCycle(address);

  ctx.writeRegister(Register.A, data);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#LDH__C_,A
export const loadPointerInCFromAccumulator = makeInstruction((ctx) => {
  const address = makeHighAddress(ctx.readRegister(Register.C));
  const data = ctx.readRegister(Register.A);

  ctx.writeMemoryCycle(address, data);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#LDH_A,_n16_
export const loadAccumulatorFromDirectByte = makeInstructionWithImmediateByte(
  (ctx, offset) => {
    const address = makeHighAddress(offset);
    const data = ctx.readMemoryCycle(address);

    ctx.writeRegister(Register.A, data);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#LDH__n16_,A
export const loadDirectByteFromAccumulator = makeInstructionWithImmediateByte(
  (ctx, offset) => {
    const address = makeHighAddress(offset);
    const data = ctx.readRegister(Register.A);

    ctx.writeMemoryCycle(address, data);
  }
);

function makeHighAddress(offset: number) {
  return 0xff00 + offset;
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#LD_A,_HLD_
export const loadAccumulatorFromPointerInHLAndDecrement = makeInstruction(
  (ctx) => {
    const address = ctx.readRegisterPair(RegisterPair.HL);

    ctx.writeRegisterPair(
      RegisterPair.HL,
      ctx.decrementAndTriggerReadWrite(address)
    );

    const data = ctx.readMemoryCycle(address);

    ctx.writeRegister(Register.A, data);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#LD_A,_HLI_
export const loadAccumulatorFromPointerInHLAndIncrement = makeInstruction(
  (ctx) => {
    const address = ctx.readRegisterPair(RegisterPair.HL);

    ctx.writeRegisterPair(
      RegisterPair.HL,
      ctx.incrementAndTriggerReadWrite(address)
    );

    const data = ctx.readMemoryCycle(address);

    ctx.writeRegister(Register.A, data);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#LD__HLD_,A
export const loadPointerInHLFromAccumulatorAndDecrement = makeInstruction(
  (ctx) => {
    const address = ctx.readRegisterPair(RegisterPair.HL);

    ctx.writeRegisterPair(
      RegisterPair.HL,
      ctx.decrementAndTriggerWrite(address)
    );

    ctx.writeMemoryCycle(address, ctx.readRegister(Register.A));
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#LD__HLI_,A
export const loadPointerInHLFromAccumulatorAndIncrement = makeInstruction(
  (ctx) => {
    const address = ctx.readRegisterPair(RegisterPair.HL);

    ctx.writeRegisterPair(
      RegisterPair.HL,
      ctx.incrementAndTriggerWrite(address)
    );

    ctx.writeMemoryCycle(address, ctx.readRegister(Register.A));
  }
);
