import { Register, RegisterPair } from "../register";
import { wrappingDecrementWord, wrappingIncrementWord } from "../../utils";
import {
  instruction,
  instructionWithImmediateByte,
  instructionWithImmediateWord,
} from "./lib";

export const loadRegisterFromRegister = instruction(
  (cpu, dst: Register, src: Register) => {
    cpu.writeRegister(dst, cpu.readRegister(src));
  }
);

export const loadRegisterFromImmediate = instructionWithImmediateByte(
  (cpu, data, dst: Register) => {
    cpu.writeRegister(dst, data);
  }
);

export const loadRegisterFromIndirectHL = instruction((cpu, dst: Register) => {
  const data = cpu.readBus(cpu.readRegisterPair(RegisterPair.HL));
  cpu.cycle();
  cpu.writeRegister(dst, data);
});

export const loadIndirectHLFromRegister = instruction((cpu, src: Register) => {
  cpu.writeBus(cpu.readRegisterPair(RegisterPair.HL), cpu.readRegister(src));
  cpu.cycle();
});

export const loadIndirectHLFromImmediateData = instructionWithImmediateByte(
  (cpu, data) => {
    cpu.writeBus(cpu.readRegisterPair(RegisterPair.HL), data);
    cpu.cycle();
  }
);

export const loadAccumulatorFromIndirectBC = instruction((cpu) => {
  const data = cpu.readBus(cpu.readRegisterPair(RegisterPair.BC));
  cpu.cycle();
  cpu.writeRegister(Register.A, data);
});

export const loadAccumulatorFromIndirectDE = instruction((cpu) => {
  const data = cpu.readBus(cpu.readRegisterPair(RegisterPair.DE));
  cpu.cycle();
  cpu.writeRegister(Register.A, data);
});

export const loadIndirectBCFromAccumulator = instruction((cpu) => {
  cpu.writeBus(
    cpu.readRegisterPair(RegisterPair.BC),
    cpu.readRegister(Register.A)
  );
  cpu.cycle();
});

export const loadIndirectDEFromAccumulator = instruction((cpu) => {
  cpu.writeBus(
    cpu.readRegisterPair(RegisterPair.DE),
    cpu.readRegister(Register.A)
  );
  cpu.cycle();
});

export const loadAccumulatorFromDirectWord = instructionWithImmediateWord(
  (cpu, address) => {
    const data = cpu.readBus(address);
    cpu.cycle();
    cpu.writeRegister(Register.A, data);
  }
);

export const loadDirectWordFromAccumulator = instructionWithImmediateWord(
  (cpu, address) => {
    cpu.writeBus(address, cpu.readRegister(Register.A));
    cpu.cycle();
  }
);

export const loadAccumulatorFromIndirectC = instruction((cpu) => {
  const address = 0xff00 + cpu.readRegister(Register.C);
  const data = cpu.readBus(address);
  cpu.writeRegister(Register.A, data);
  cpu.cycle();
});

export const loadIndirectCFromAccumulator = instruction((cpu) => {
  const address = 0xff00 + cpu.readRegister(Register.C);
  cpu.writeBus(address, cpu.readRegister(Register.A));
  cpu.cycle();
});

export const loadAccumulatorFromDirectByte = instructionWithImmediateByte(
  (cpu, offset) => {
    const address = 0xff00 + offset;
    const data = cpu.readBus(address);
    cpu.cycle();
    cpu.writeRegister(Register.A, data);
  }
);

export const loadDirectByteFromAccumulator = instructionWithImmediateByte(
  (cpu, offset) => {
    const address = 0xff00 + offset;
    cpu.writeBus(address, cpu.readRegister(Register.A));
    cpu.cycle();
  }
);

export const loadAccumulatorFromIndirectHLDecrement = instruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);

  cpu.writeRegisterPair(RegisterPair.HL, wrappingDecrementWord(address));
  cpu.cycle();

  cpu.writeRegister(Register.A, data);
});

export const loadAccumulatorFromIndirectHLIncrement = instruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);
  cpu.writeRegisterPair(RegisterPair.HL, wrappingIncrementWord(address));
  cpu.cycle();

  cpu.writeRegister(Register.A, data);
});

export const loadIndirectHLDecrementFromAccumulator = instruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  cpu.writeBus(address, cpu.readRegister(Register.A));
  cpu.writeRegisterPair(RegisterPair.HL, wrappingDecrementWord(address));
  cpu.cycle();
});

export const loadIndirectHLIncrementFromAccumulator = instruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  cpu.writeBus(address, cpu.readRegister(Register.A));
  cpu.writeRegisterPair(RegisterPair.HL, wrappingIncrementWord(address));
  cpu.cycle();
});
