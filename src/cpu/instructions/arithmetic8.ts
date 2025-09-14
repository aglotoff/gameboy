import { InstructionContext } from "../cpu-state";
import { Flag, Register, RegisterPair } from "../register";
import {
  addBytes,
  makeInstruction,
  makeInstructionWithImmediateByte,
  subtractBytes,
} from "./lib";

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#ADD_A,r8
export const addRegisterToAccumulator = makeInstruction(
  (ctx, reg: Register) => {
    addToAccumulator(ctx, ctx.readRegister(reg));
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#ADD_A,_HL_
export const addIndirectHLToAccumulator = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  addToAccumulator(ctx, data);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#ADD_A,n8
export const addImmediateToAccumulator =
  makeInstructionWithImmediateByte(addToAccumulator);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#ADC_A,r8
export const addRegisterToAccumulatorWithCarry = makeInstruction(
  (ctx, reg: Register) => {
    const data = ctx.readRegister(reg);
    const carry = ctx.getFlag(Flag.CY);

    addToAccumulator(ctx, data, carry);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#ADC_A,_HL_
export const addIndirectHLToAccumulatorWithCarry = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);
  const carry = ctx.getFlag(Flag.CY);

  addToAccumulator(ctx, data, carry);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#ADC_A,n8
export const addImmediateToAccumulatorWithCarry =
  makeInstructionWithImmediateByte((ctx, data) => {
    const carry = ctx.getFlag(Flag.CY);
    addToAccumulator(ctx, data, carry);
  });

function addToAccumulator(
  ctx: InstructionContext,
  data: number,
  carry = false
) {
  const accumulatorData = ctx.readRegister(Register.A);

  const { result, carryFrom3, carryFrom7 } = addBytes(
    accumulatorData,
    data,
    carry
  );

  ctx.writeRegister(Register.A, result);
  ctx.setFlag(Flag.Z, result === 0);
  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, carryFrom3);
  ctx.setFlag(Flag.CY, carryFrom7);
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SUB_A,r8
export const subtractRegisterFromAccumualtor = makeInstruction(
  (ctx, reg: Register) => {
    subtractFromAccumulator(ctx, ctx.readRegister(reg));
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SUB_A,_HL_
export const subtractIndirectHLFromAccumualtor = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  subtractFromAccumulator(ctx, data);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SUB_A,n8
export const subtractImmediateFromAccumualtor =
  makeInstructionWithImmediateByte(subtractFromAccumulator);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SBC_A,r8
export const subtractRegisterFromAccumualtorWithCarry = makeInstruction(
  (ctx, reg: Register) => {
    const data = ctx.readRegister(reg);
    const carry = ctx.getFlag(Flag.CY);

    subtractFromAccumulator(ctx, data, carry);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SBC_A,_HL_
export const subtractIndirectHLFromAccumualtorWithCarry = makeInstruction(
  (ctx) => {
    const address = ctx.readRegisterPair(RegisterPair.HL);
    const data = ctx.readMemoryCycle(address);
    const carry = ctx.getFlag(Flag.CY);

    subtractFromAccumulator(ctx, data, carry);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SBC_A,n8
export const subtractImmediateFromAccumualtorWithCarry =
  makeInstructionWithImmediateByte((ctx, data) => {
    const carry = ctx.getFlag(Flag.CY);
    subtractFromAccumulator(ctx, data, carry);
  });

function subtractFromAccumulator(
  ctx: InstructionContext,
  data: number,
  carry = false
) {
  const accumulatorData = ctx.readRegister(Register.A);

  const { result, borrowTo3, borrowTo7 } = subtractBytes(
    accumulatorData,
    data,
    carry
  );

  ctx.writeRegister(Register.A, result);
  ctx.setFlag(Flag.Z, result === 0);
  ctx.setFlag(Flag.N, true);
  ctx.setFlag(Flag.H, borrowTo3);
  ctx.setFlag(Flag.CY, borrowTo7);
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#CP_A,r8
export const compareAccumulatorToRegister = makeInstruction(
  (ctx, reg: Register) => {
    const data = ctx.readRegister(reg);
    compareAccumulatorTo(ctx, data);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#CP_A,_HL_
export const compareAccumulatorToIndirectHL = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  compareAccumulatorTo(ctx, data);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#CP_A,n8
export const compareAccumulatorToImmediate =
  makeInstructionWithImmediateByte(compareAccumulatorTo);

function compareAccumulatorTo(ctx: InstructionContext, data: number) {
  const accumulatorData = ctx.readRegister(Register.A);

  const { result, borrowTo3, borrowTo7 } = subtractBytes(accumulatorData, data);

  ctx.setFlag(Flag.Z, result === 0);
  ctx.setFlag(Flag.N, true);
  ctx.setFlag(Flag.H, borrowTo3);
  ctx.setFlag(Flag.CY, borrowTo7);
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#INC_r8
export const incrementRegister = makeInstruction((ctx, reg: Register) => {
  const data = ctx.readRegister(reg);
  ctx.writeRegister(reg, increment(ctx, data));
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#INC__HL_
export const incrementIndirectHL = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  ctx.writeMemoryCycle(address, increment(ctx, data));
});

function increment(ctx: InstructionContext, data: number) {
  const { result, carryFrom3 } = addBytes(data, 1);

  ctx.setFlag(Flag.Z, result === 0);
  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, carryFrom3);

  return result;
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#DEC_r8
export const decrementRegister = makeInstruction((ctx, reg: Register) => {
  const data = ctx.readRegister(reg);
  ctx.writeRegister(reg, decrement(ctx, data));
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#DEC__HL_
export const decrementIndirectHL = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  ctx.writeMemoryCycle(address, decrement(ctx, data));
});

function decrement(ctx: InstructionContext, data: number) {
  const { result, borrowTo3 } = subtractBytes(data, 1);

  ctx.setFlag(Flag.Z, result === 0);
  ctx.setFlag(Flag.N, true);
  ctx.setFlag(Flag.H, borrowTo3);

  return result;
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#AND_A,r8
export const andAccumulatorWithRegister = makeInstruction(
  (ctx, reg: Register) => {
    const data = ctx.readRegister(reg);
    andAccumulatorWith(ctx, data);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#AND_A,_HL_
export const andAccumulatorWithIndirectHL = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  andAccumulatorWith(ctx, data);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#AND_A,n8
export const andAccumulatorWithImmediate =
  makeInstructionWithImmediateByte(andAccumulatorWith);

function andAccumulatorWith(ctx: InstructionContext, value: number) {
  const accumulatorData = ctx.readRegister(Register.A);
  const result = accumulatorData & value;

  ctx.writeRegister(Register.A, result);
  ctx.setFlag(Flag.Z, result === 0);
  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, true);
  ctx.setFlag(Flag.CY, false);
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#OR_A,r8
export const orAccumulatorWithRegister = makeInstruction(
  (ctx, reg: Register) => {
    const data = ctx.readRegister(reg);
    orAccumulatorWith(ctx, data);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#OR_A,_HL_
export const orAccumulatorWithIndirectHL = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  orAccumulatorWith(ctx, data);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#OR_A,n8
export const orAccumulatorWithImmediate =
  makeInstructionWithImmediateByte(orAccumulatorWith);

function orAccumulatorWith(ctx: InstructionContext, value: number) {
  const accumulatorData = ctx.readRegister(Register.A);
  const result = accumulatorData | value;

  ctx.writeRegister(Register.A, result);
  ctx.setFlag(Flag.Z, result === 0);
  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, false);
  ctx.setFlag(Flag.CY, false);
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#XOR_A,r8
export const xorAccumulatorWithRegister = makeInstruction(
  (ctx, reg: Register) => {
    const data = ctx.readRegister(reg);
    xorAccumulatorWith(ctx, data);
  }
);

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#XOR_A,_HL_
export const xorAccumulatorWithIndirectHL = makeInstruction((ctx) => {
  const address = ctx.readRegisterPair(RegisterPair.HL);
  const data = ctx.readMemoryCycle(address);

  xorAccumulatorWith(ctx, data);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#XOR_A,n8
export const xorAccumulatorWithImmediate =
  makeInstructionWithImmediateByte(xorAccumulatorWith);

function xorAccumulatorWith(ctx: InstructionContext, data: number) {
  const accumulatorData = ctx.readRegister(Register.A);
  const result = accumulatorData ^ data;

  ctx.writeRegister(Register.A, result);
  ctx.setFlag(Flag.Z, result === 0);
  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, false);
  ctx.setFlag(Flag.CY, false);
}

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#CCF
export const complementCarryFlag = makeInstruction((ctx) => {
  const carry = ctx.getFlag(Flag.CY);

  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, false);
  ctx.setFlag(Flag.CY, !carry);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#SCF
export const setCarryFlag = makeInstruction((ctx) => {
  ctx.setFlag(Flag.N, false);
  ctx.setFlag(Flag.H, false);
  ctx.setFlag(Flag.CY, true);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#DAA
export const decimalAdjustAccumulator = makeInstruction((ctx) => {
  const accumulatorData = ctx.readRegister(Register.A);
  const carry = ctx.getFlag(Flag.CY);
  const halfCarry = ctx.getFlag(Flag.H);
  const subtraction = ctx.getFlag(Flag.N);

  let resultOffset = 0;
  let resultCarry = false;

  if ((!subtraction && (accumulatorData & 0xf) > 0x09) || halfCarry) {
    resultOffset |= 0x06;
  }

  if ((!subtraction && accumulatorData > 0x99) || carry) {
    resultOffset |= 0x60;
    resultCarry = true;
  }

  const result = subtraction
    ? (accumulatorData - resultOffset) & 0xff
    : (accumulatorData + resultOffset) & 0xff;

  ctx.writeRegister(Register.A, result);
  ctx.setFlag(Flag.Z, result === 0);
  ctx.setFlag(Flag.H, false);
  ctx.setFlag(Flag.CY, resultCarry);
});

// https://rgbds.gbdev.io/docs/v0.9.4/gbz80.7#CPL
export const complementAccumulator = makeInstruction((ctx) => {
  const accumulatorData = ctx.readRegister(Register.A);

  ctx.writeRegister(Register.A, ~accumulatorData);
  ctx.setFlag(Flag.N, true);
  ctx.setFlag(Flag.H, true);
});
