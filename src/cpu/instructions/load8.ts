import { Register, RegisterPair } from "../register";
import { wrappingDecrementWord, wrappingIncrementWord } from "../../utils";
import {
  instruction,
  instructionWithImmediateByte,
  instructionWithImmediateWord,
} from "./lib";

export const loadRegisterFromRegister = instruction(
  (cpu, dst: Register, src: Register) => {
    cpu.setRegister(dst, cpu.getRegister(src));
  }
);

export const loadRegisterFromImmediate = instructionWithImmediateByte(
  (cpu, data, dst: Register) => {
    cpu.setRegister(dst, data);
  }
);

export const loadRegisterFromIndirectHL = instruction((cpu, dst: Register) => {
  const data = cpu.readBus(cpu.getRegisterPair(RegisterPair.HL));
  cpu.beginNextCycle();
  cpu.setRegister(dst, data);
});

export const loadIndirectHLFromRegister = instruction((cpu, src: Register) => {
  cpu.writeBus(cpu.getRegisterPair(RegisterPair.HL), cpu.getRegister(src));
  cpu.beginNextCycle();
});

export const loadIndirectHLFromImmediateData = instructionWithImmediateByte(
  (cpu, data) => {
    cpu.writeBus(cpu.getRegisterPair(RegisterPair.HL), data);
    cpu.beginNextCycle();
  }
);

export const loadAccumulatorFromIndirectBC = instruction((cpu) => {
  const data = cpu.readBus(cpu.getRegisterPair(RegisterPair.BC));
  cpu.beginNextCycle();
  cpu.setRegister(Register.A, data);
});

export const loadAccumulatorFromIndirectDE = instruction((cpu) => {
  const data = cpu.readBus(cpu.getRegisterPair(RegisterPair.DE));
  cpu.beginNextCycle();
  cpu.setRegister(Register.A, data);
});

export const loadIndirectBCFromAccumulator = instruction((cpu) => {
  cpu.writeBus(
    cpu.getRegisterPair(RegisterPair.BC),
    cpu.getRegister(Register.A)
  );
  cpu.beginNextCycle();
});

export const loadIndirectDEFromAccumulator = instruction((cpu) => {
  cpu.writeBus(
    cpu.getRegisterPair(RegisterPair.DE),
    cpu.getRegister(Register.A)
  );
  cpu.beginNextCycle();
});

export const loadAccumulatorFromDirectWord = instructionWithImmediateWord(
  (cpu, address) => {
    const data = cpu.readBus(address);
    cpu.beginNextCycle();
    cpu.setRegister(Register.A, data);
  }
);

export const loadDirectWordFromAccumulator = instructionWithImmediateWord(
  (cpu, address) => {
    cpu.writeBus(address, cpu.getRegister(Register.A));
    cpu.beginNextCycle();
  }
);

export const loadAccumulatorFromIndirectC = instruction((cpu) => {
  const address = 0xff00 + cpu.getRegister(Register.C);
  const data = cpu.readBus(address);

  cpu.beginNextCycle();

  cpu.setRegister(Register.A, data);
});

export const loadIndirectCFromAccumulator = instruction((cpu) => {
  const address = 0xff00 + cpu.getRegister(Register.C);
  cpu.writeBus(address, cpu.getRegister(Register.A));

  cpu.beginNextCycle();
});

export const loadAccumulatorFromDirectByte = instructionWithImmediateByte(
  (cpu, offset) => {
    const address = 0xff00 + offset;
    const data = cpu.readBus(address);

    cpu.beginNextCycle();

    cpu.setRegister(Register.A, data);
  }
);

export const loadDirectByteFromAccumulator = instructionWithImmediateByte(
  (cpu, offset) => {
    const address = 0xff00 + offset;
    cpu.writeBus(address, cpu.getRegister(Register.A));

    cpu.beginNextCycle();
  }
);

export const loadAccumulatorFromIndirectHLDecrement = instruction((cpu) => {
  const address = cpu.getRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);

  cpu.setRegisterPair(RegisterPair.HL, wrappingDecrementWord(address));

  cpu.beginNextCycle();

  cpu.setRegister(Register.A, data);
});

export const loadAccumulatorFromIndirectHLIncrement = instruction((cpu) => {
  const address = cpu.getRegisterPair(RegisterPair.HL);
  const data = cpu.readBus(address);

  cpu.setRegisterPair(RegisterPair.HL, wrappingIncrementWord(address));

  cpu.beginNextCycle();

  cpu.setRegister(Register.A, data);
});

export const loadIndirectHLDecrementFromAccumulator = instruction((cpu) => {
  const address = cpu.getRegisterPair(RegisterPair.HL);
  cpu.writeBus(address, cpu.getRegister(Register.A));

  cpu.setRegisterPair(RegisterPair.HL, wrappingDecrementWord(address));

  cpu.beginNextCycle();
});

export const loadIndirectHLIncrementFromAccumulator = instruction((cpu) => {
  const address = cpu.getRegisterPair(RegisterPair.HL);
  cpu.writeBus(address, cpu.getRegister(Register.A));

  cpu.setRegisterPair(RegisterPair.HL, wrappingIncrementWord(address));

  cpu.beginNextCycle();
});
