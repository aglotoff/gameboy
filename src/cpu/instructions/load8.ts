import { Register, RegisterPair } from "../register";
import { wrappingDecrementWord, wrappingIncrementWord } from "../../utils";
import {
  makeInstruction,
  makeInstructionWithImmediateByte,
  makeInstructionWithImmediateWord,
} from "./lib";

export const loadRegisterFromRegister = makeInstruction(
  (cpu, dst: Register, src: Register) => {
    cpu.writeRegister(dst, cpu.readRegister(src));
  }
);

export const loadRegisterFromImmediate = makeInstructionWithImmediateByte(
  (cpu, data, dst: Register) => {
    cpu.writeRegister(dst, data);
  }
);

export const loadRegisterFromIndirectHL = makeInstruction(
  (cpu, dst: Register) => {
    const data = cpu.readMemory(cpu.readRegisterPair(RegisterPair.HL));
    cpu.beginNextCycle();
    cpu.writeRegister(dst, data);
  }
);

export const loadIndirectHLFromRegister = makeInstruction(
  (cpu, src: Register) => {
    cpu.writeMemory(
      cpu.readRegisterPair(RegisterPair.HL),
      cpu.readRegister(src)
    );
    cpu.beginNextCycle();
  }
);

export const loadIndirectHLFromImmediateData = makeInstructionWithImmediateByte(
  (cpu, data) => {
    cpu.writeMemory(cpu.readRegisterPair(RegisterPair.HL), data);
    cpu.beginNextCycle();
  }
);

export const loadAccumulatorFromIndirectBC = makeInstruction((cpu) => {
  const data = cpu.readMemory(cpu.readRegisterPair(RegisterPair.BC));
  cpu.beginNextCycle();
  cpu.writeRegister(Register.A, data);
});

export const loadAccumulatorFromIndirectDE = makeInstruction((cpu) => {
  const data = cpu.readMemory(cpu.readRegisterPair(RegisterPair.DE));
  cpu.beginNextCycle();
  cpu.writeRegister(Register.A, data);
});

export const loadIndirectBCFromAccumulator = makeInstruction((cpu) => {
  cpu.writeMemory(
    cpu.readRegisterPair(RegisterPair.BC),
    cpu.readRegister(Register.A)
  );
  cpu.beginNextCycle();
});

export const loadIndirectDEFromAccumulator = makeInstruction((cpu) => {
  cpu.writeMemory(
    cpu.readRegisterPair(RegisterPair.DE),
    cpu.readRegister(Register.A)
  );
  cpu.beginNextCycle();
});

export const loadAccumulatorFromDirectWord = makeInstructionWithImmediateWord(
  (cpu, address) => {
    const data = cpu.readMemory(address);
    cpu.beginNextCycle();
    cpu.writeRegister(Register.A, data);
  }
);

export const loadDirectWordFromAccumulator = makeInstructionWithImmediateWord(
  (cpu, address) => {
    cpu.writeMemory(address, cpu.readRegister(Register.A));
    cpu.beginNextCycle();
  }
);

export const loadAccumulatorFromIndirectC = makeInstruction((cpu) => {
  const address = 0xff00 + cpu.readRegister(Register.C);
  const data = cpu.readMemory(address);

  cpu.beginNextCycle();

  cpu.writeRegister(Register.A, data);
});

export const loadIndirectCFromAccumulator = makeInstruction((cpu) => {
  const address = 0xff00 + cpu.readRegister(Register.C);
  cpu.writeMemory(address, cpu.readRegister(Register.A));

  cpu.beginNextCycle();
});

export const loadAccumulatorFromDirectByte = makeInstructionWithImmediateByte(
  (cpu, offset) => {
    const address = 0xff00 + offset;
    const data = cpu.readMemory(address);

    cpu.beginNextCycle();

    cpu.writeRegister(Register.A, data);
  }
);

export const loadDirectByteFromAccumulator = makeInstructionWithImmediateByte(
  (cpu, offset) => {
    const address = 0xff00 + offset;
    cpu.writeMemory(address, cpu.readRegister(Register.A));

    cpu.beginNextCycle();
  }
);

export const loadAccumulatorFromIndirectHLDecrement = makeInstruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readMemory(address);

  cpu.triggerMemoryIncrementRead(address);
  cpu.writeRegisterPair(RegisterPair.HL, wrappingDecrementWord(address));

  cpu.beginNextCycle();

  cpu.writeRegister(Register.A, data);
});

export const loadAccumulatorFromIndirectHLIncrement = makeInstruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  const data = cpu.readMemory(address);

  cpu.triggerMemoryIncrementRead(address);
  cpu.writeRegisterPair(RegisterPair.HL, wrappingIncrementWord(address));

  cpu.beginNextCycle();

  cpu.writeRegister(Register.A, data);
});

export const loadIndirectHLDecrementFromAccumulator = makeInstruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  cpu.writeMemory(address, cpu.readRegister(Register.A));

  cpu.triggerMemoryWrite(address);
  cpu.writeRegisterPair(RegisterPair.HL, wrappingDecrementWord(address));

  cpu.beginNextCycle();
});

export const loadIndirectHLIncrementFromAccumulator = makeInstruction((cpu) => {
  const address = cpu.readRegisterPair(RegisterPair.HL);
  cpu.writeMemory(address, cpu.readRegister(Register.A));

  cpu.triggerMemoryWrite(address);
  cpu.writeRegisterPair(RegisterPair.HL, wrappingIncrementWord(address));

  cpu.beginNextCycle();
});
