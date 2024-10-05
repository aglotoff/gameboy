import { Register, RegisterPair } from "../regs";
import { wrapDecrementWord, wrapIncrementWord } from "../utils";
import {
  instruction,
  instructionWithImmediateByte,
  instructionWithImmediateWord,
} from "./lib";

export const loadRegisterFromRegister = instruction(
  ({ cpu }, dst: Register, src: Register) => {
    cpu.regs.write(dst, cpu.regs.read(src));
    return 4;
  }
);

export const loadRegisterFromImmediate = instructionWithImmediateByte(
  ({ cpu }, data, dst: Register) => {
    cpu.regs.write(dst, data);
    return 8;
  }
);

export const loadRegisterFromIndirectHL = instruction(
  ({ cpu, memory }, dst: Register) => {
    const data = memory.read(cpu.regs.readPair(RegisterPair.HL));
    cpu.regs.write(dst, data);
    return 8;
  }
);

export const loadIndirectHLFromRegister = instruction(
  ({ cpu, memory }, src: Register) => {
    memory.write(cpu.regs.readPair(RegisterPair.HL), cpu.regs.read(src));
    return 8;
  }
);

export const loadIndirectHLFromImmediateData = instructionWithImmediateByte(
  (ctx, data) => {
    ctx.memory.write(ctx.cpu.regs.readPair(RegisterPair.HL), data);
    return 12;
  }
);

export const loadAccumulatorFromIndirectBC = instruction(({ cpu, memory }) => {
  const data = memory.read(cpu.regs.readPair(RegisterPair.BC));
  cpu.regs.write(Register.A, data);
  return 8;
});

export const loadAccumulatorFromIndirectDE = instruction(({ cpu, memory }) => {
  const data = memory.read(cpu.regs.readPair(RegisterPair.DE));
  cpu.regs.write(Register.A, data);
  return 8;
});

export const loadIndirectBCFromAccumulator = instruction(({ cpu, memory }) => {
  memory.write(cpu.regs.readPair(RegisterPair.BC), cpu.regs.read(Register.A));
  return 8;
});

export const loadIndirectDEFromAccumulator = instruction(({ cpu, memory }) => {
  memory.write(cpu.regs.readPair(RegisterPair.DE), cpu.regs.read(Register.A));
  return 8;
});

export const loadAccumulatorFromDirectWord = instructionWithImmediateWord(
  ({ cpu, memory }, address) => {
    cpu.regs.write(Register.A, memory.read(address));
    return 16;
  }
);

export const loadDirectWordFromAccumulator = instructionWithImmediateWord(
  ({ cpu, memory }, address) => {
    memory.write(address, cpu.regs.read(Register.A));
    return 16;
  }
);

export const loadAccumulatorFromIndirectC = instruction(({ cpu, memory }) => {
  const address = 0xff00 + cpu.regs.read(Register.C);
  cpu.regs.write(Register.A, memory.read(address));
  return 8;
});

export const loadIndirectCFromAccumulator = instruction(({ cpu, memory }) => {
  const address = 0xff00 + cpu.regs.read(Register.C);
  memory.write(address, cpu.regs.read(Register.A));
  return 8;
});

export const loadAccumulatorFromDirectByte = instructionWithImmediateByte(
  ({ cpu, memory }, offset) => {
    const address = 0xff00 + offset;
    cpu.regs.write(Register.A, memory.read(address));
    return 12;
  }
);

export const loadDirectByteFromAccumulator = instructionWithImmediateByte(
  ({ cpu, memory }, offset) => {
    const address = 0xff00 + offset;
    memory.write(address, cpu.regs.read(Register.A));
    return 12;
  }
);

export const loadAccumulatorFromIndirectHLDecrement = instruction(
  ({ cpu, memory }) => {
    const address = cpu.regs.readPair(RegisterPair.HL);
    const data = memory.read(address);
    cpu.regs.write(Register.A, data);
    cpu.regs.writePair(RegisterPair.HL, address - 1);
    return 8;
  }
);

export const loadAccumulatorFromIndirectHLIncrement = instruction(
  ({ cpu, memory }) => {
    const address = cpu.regs.readPair(RegisterPair.HL);
    const data = memory.read(address);
    cpu.regs.write(Register.A, data);
    cpu.regs.writePair(RegisterPair.HL, wrapIncrementWord(address));
    return 8;
  }
);

export const loadIndirectHLDecrementFromAccumulator = instruction(
  ({ cpu, memory }) => {
    const address = cpu.regs.readPair(RegisterPair.HL);
    memory.write(address, cpu.regs.read(Register.A));
    cpu.regs.writePair(RegisterPair.HL, wrapDecrementWord(address));
    return 8;
  }
);

export const loadIndirectHLIncrementFromAccumulator = instruction(
  ({ cpu, memory }) => {
    const address = cpu.regs.readPair(RegisterPair.HL);
    memory.write(address, cpu.regs.read(Register.A));
    cpu.regs.writePair(RegisterPair.HL, wrapIncrementWord(address));
    return 8;
  }
);
