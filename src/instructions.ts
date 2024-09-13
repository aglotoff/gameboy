import {
  checkCondition,
  Condition,
  decrementWord,
  fetchImmediateByte,
  fetchImmediateWord,
  getHighByte,
  getLowByte,
  incrementWord,
  makeWord,
  readRegister8,
  readRegister16,
  readRegisterPair,
  Register8,
  RegisterPair,
  setIME,
  writeRegister8,
  writeRegister16,
  writeRegisterPair,
  xor,
  clearFlag,
  getSignedByte,
  setFlag,
} from "./cpu";
import * as Memory from "./memory";

type Instruction = [string, () => number];

// Perform no operation
const nop = () => {
  return 4;
};

export function loadRegisterFromRegister(
  destination: Register8,
  source: Register8
) {
  writeRegister8(destination, readRegister8(source));
  return 4;
}

export function loadRegisterFromImmediate(destination: Register8) {
  const data = fetchImmediateByte();
  writeRegister8(destination, data);
  return 8;
}

export function loadRegisterFromIndirectHL(destination: Register8) {
  const data = Memory.read(readRegisterPair("HL"));
  writeRegister8(destination, data);
  return 8;
}

export function loadIndirectHLFromRegister(source: Register8) {
  Memory.write(readRegisterPair("HL"), readRegister8(source));
  return 8;
}

export const loadIndirectHLFromImmediateData = () => {
  const data = fetchImmediateByte();
  Memory.write(readRegisterPair("HL"), data);
  return 12;
};

export function loadAccumulatorFromIndirectBC() {
  const data = Memory.read(readRegisterPair("BC"));
  writeRegister8("A", data);
  return 8;
}

export function loadAccumulatorFromIndirectDE() {
  const data = Memory.read(readRegisterPair("DE"));
  writeRegister8("A", data);
  return 8;
}

export function loadIndirectBCFromAccumulator() {
  Memory.write(readRegisterPair("BC"), readRegister8("A"));
  return 8;
}

export function loadIndirectDEFromAccumulator() {
  Memory.write(readRegisterPair("DE"), readRegister8("A"));
  return 8;
}

export function loadAccumulatorFromDirectWord() {
  const address = fetchImmediateWord();
  writeRegister8("A", Memory.read(address));
  return 16;
}

export function loadDirectWordFromAccumulator() {
  const address = fetchImmediateWord();
  Memory.write(address, readRegister8("A"));
  return 16;
}

export function loadAccumulatorFromIndirectC() {
  const address = 0xff00 + readRegister8("C");
  writeRegister8("A", Memory.read(address));
  return 8;
}

export function loadIndirectCFromAccumulator() {
  const address = 0xff00 + readRegister8("C");
  Memory.write(address, readRegister8("A"));
  return 8;
}

export function loadAccumulatorFromDirectByte() {
  const address = 0xff00 + fetchImmediateByte();
  writeRegister8("A", Memory.read(address));
  return 12;
}

export function loadDirectByteFromAccumulator() {
  const address = 0xff00 + fetchImmediateByte();
  Memory.write(address, readRegister8("A"));
  return 12;
}

export function loadAccumulatorFromIndirectHLDecrement() {
  const address = readRegisterPair("HL");
  const data = Memory.read(address);
  writeRegister8("A", data);
  writeRegisterPair("HL", decrementWord(address));
  return 8;
}

export function loadAccumulatorFromIndirectHLIncrement() {
  const address = readRegisterPair("HL");
  const data = Memory.read(address);
  writeRegister8("A", data);
  writeRegisterPair("HL", incrementWord(address));
  return 8;
}

export function loadIndirectHLDecrementFromAccumulator() {
  const address = readRegisterPair("HL");
  Memory.write(address, readRegister8("A"));
  writeRegisterPair("HL", decrementWord(address));
  return 8;
}

export function loadIndirectHLIncrementFromAccumulator() {
  const address = readRegisterPair("HL");
  Memory.write(address, readRegister8("A"));
  writeRegisterPair("HL", incrementWord(address));
  return 8;
}

export function loadRegisterPair(destination: RegisterPair | "SP") {
  const data = fetchImmediateWord();
  if (destination === "SP") {
    writeRegister16("SP", data);
  } else {
    writeRegisterPair(destination, data);
  }
  return 12;
}

export function loadDirectFromStackPointer() {
  const address = fetchImmediateWord();
  const data = readRegister16("SP");
  Memory.write(address, getLowByte(data));
  Memory.write(address + 1, getHighByte(data));
  return 20;
}

export function loadStackPointerFromHL() {
  writeRegister16("SP", readRegisterPair("HL"));
  return 8;
}

export function pushToStack(rr: RegisterPair) {
  const data = readRegisterPair(rr);
  let sp = readRegister16("SP");
  sp = decrementWord(sp);
  Memory.write(sp, getHighByte(data));
  sp = decrementWord(sp);
  Memory.write(sp, getLowByte(data));
  writeRegister16("SP", sp);
  return 16;
}

export function popFromStack(rr: RegisterPair) {
  let sp = readRegister16("SP");
  const lsb = Memory.read(sp);
  sp = incrementWord(sp);
  const msb = Memory.read(sp);
  sp = incrementWord(sp);
  writeRegisterPair(rr, makeWord(msb, lsb));
  writeRegister16("SP", sp);
  return 12;
}

function add(a: number, b: number) {
  const result = (a + b) & 0xffff;

  const halfCarry = ((a ^ b ^ result) & 0x10) != 0;
  const carry = ((a ^ b ^ result) & 0x100) != 0;

  return { result, carry, halfCarry };
}

export function loadHLFromAdjustedStackPointer() {
  const e = getSignedByte(fetchImmediateByte());
  const { result, carry, halfCarry } = add(readRegister16("SP"), e);
  writeRegisterPair("HL", result);
  clearFlag("Z");
  clearFlag("N");
  if (halfCarry) {
    setFlag("H");
  } else {
    clearFlag("H");
  }
  if (carry) {
    setFlag("CY");
  } else {
    clearFlag("CY");
  }
  return 12;
}

// -----------------

// Load the operand to the program counter
const jumpToAddress = () => {
  const address = fetchImmediateWord();
  writeRegister16("PC", address);
  return 16;
};

// Load the operand in the PC if the condition and the flag status match
const jumpToAddressIf = (condition: Condition) => {
  const address = fetchImmediateWord();

  if (checkCondition(condition)) {
    writeRegister16("PC", address);
    return 16;
  }

  return 12;
};

// Load the contents of register pair HL in program counter PC
const jumpToHLAddress = () => {
  writeRegister16("PC", readRegisterPair("HL"));
  return 4;
};

// Take the logical exclusive-OR for each bit of the contents of the specified
// value and register A and store the results in register A
const xorA = (value: number) => {
  writeRegister8("A", xor(readRegister8("A"), value));
};

const xorAWithRegister = (register: Register8) => () => {
  xorA(readRegister8(register));
  return 4;
};

const xorAWithHLPointerData = () => {
  xorA(Memory.read(readRegisterPair("HL")));
  return 8;
};

const xorAWithImmediateByte = () => {
  xorA(fetchImmediateByte());
  return 8;
};

// Reset the interrupt master enable flag and prohibit maskable interrupts
const disableInterrupts = () => {
  setIME(false);
  return 4;
};

// Set the interrupt master enable flag and enable maskable interrupts
const enableInterrupts = () => {
  setIME(true);
  return 4;
};

const instructions: Partial<Record<number, Instruction>> = {
  0x00: ["NOP", nop],
  0x01: ["LD BC,d16", () => loadRegisterPair("BC")],
  0x02: ["LD (BC),A", loadIndirectBCFromAccumulator],
  0x06: ["LD B,d8", () => loadRegisterFromImmediate("B")],
  0x08: ["LD (a16),SP", loadDirectFromStackPointer],
  0x0a: ["LD A,(BC)", loadAccumulatorFromIndirectBC],
  0x0e: ["LD C,d8", () => loadRegisterFromImmediate("C")],

  0x11: ["LD DE,d16", () => loadRegisterPair("DE")],
  0x12: ["LD (DE),A", loadIndirectDEFromAccumulator],
  0x16: ["LD D,d8", () => loadRegisterFromImmediate("D")],
  0x1a: ["LD A,(DE)", loadAccumulatorFromIndirectDE],
  0x1e: ["LD E,d8", () => loadRegisterFromImmediate("E")],

  0x21: ["LD HL,d16", () => loadRegisterPair("HL")],
  0x22: ["LD (HL+),A", loadIndirectHLIncrementFromAccumulator],
  0x26: ["LD H,d8", () => loadRegisterFromImmediate("H")],
  0x2a: ["LD A,(HL+)", loadAccumulatorFromIndirectHLIncrement],
  0x2e: ["LD L,d8", () => loadRegisterFromImmediate("L")],

  0x31: ["LD SP,d16", () => loadRegisterPair("SP")],
  0x32: ["LD (HL-),A", loadIndirectHLDecrementFromAccumulator],
  0x36: ["LD (HL),d8", loadIndirectHLFromImmediateData],
  0x3a: ["LD A,(HL-)", loadAccumulatorFromIndirectHLDecrement],
  0x3e: ["LD A,d8", () => loadRegisterFromImmediate("A")],

  0x40: ["LD B,B", () => loadRegisterFromRegister("B", "B")],
  0x41: ["LD B,C", () => loadRegisterFromRegister("B", "C")],
  0x42: ["LD B,D", () => loadRegisterFromRegister("B", "D")],
  0x43: ["LD B,E", () => loadRegisterFromRegister("B", "E")],
  0x44: ["LD B,H", () => loadRegisterFromRegister("B", "H")],
  0x45: ["LD B,L", () => loadRegisterFromRegister("B", "L")],
  0x46: ["LD B,(HL)", () => loadRegisterFromIndirectHL("B")],
  0x47: ["LD B,A", () => loadRegisterFromRegister("B", "A")],
  0x48: ["LD C,B", () => loadRegisterFromRegister("C", "B")],
  0x49: ["LD C,C", () => loadRegisterFromRegister("C", "C")],
  0x4a: ["LD C,D", () => loadRegisterFromRegister("C", "D")],
  0x4b: ["LD C,E", () => loadRegisterFromRegister("C", "E")],
  0x4c: ["LD C,H", () => loadRegisterFromRegister("C", "H")],
  0x4d: ["LD C,L", () => loadRegisterFromRegister("C", "L")],
  0x4e: ["LD C,(HL)", () => loadRegisterFromIndirectHL("C")],
  0x4f: ["LD C,A", () => loadRegisterFromRegister("C", "A")],

  0x50: ["LD D,B", () => loadRegisterFromRegister("D", "B")],
  0x51: ["LD D,C", () => loadRegisterFromRegister("D", "C")],
  0x52: ["LD D,D", () => loadRegisterFromRegister("D", "D")],
  0x53: ["LD D,E", () => loadRegisterFromRegister("D", "E")],
  0x54: ["LD D,H", () => loadRegisterFromRegister("D", "H")],
  0x55: ["LD D,L", () => loadRegisterFromRegister("L", "D")],
  0x56: ["LD D,(HL)", () => loadRegisterFromIndirectHL("D")],
  0x57: ["LD D,A", () => loadRegisterFromRegister("D", "A")],
  0x58: ["LD E,B", () => loadRegisterFromRegister("E", "B")],
  0x59: ["LD E,C", () => loadRegisterFromRegister("E", "C")],
  0x5a: ["LD E,D", () => loadRegisterFromRegister("E", "D")],
  0x5b: ["LD E,E", () => loadRegisterFromRegister("E", "E")],
  0x5c: ["LD E,H", () => loadRegisterFromRegister("E", "H")],
  0x5d: ["LD E,L", () => loadRegisterFromRegister("E", "L")],
  0x5e: ["LD E,(HL)", () => loadRegisterFromIndirectHL("E")],
  0x5f: ["LD E,A", () => loadRegisterFromRegister("E", "A")],

  0x60: ["LD H,B", () => loadRegisterFromRegister("H", "B")],
  0x61: ["LD H,C", () => loadRegisterFromRegister("H", "C")],
  0x62: ["LD H,D", () => loadRegisterFromRegister("H", "D")],
  0x63: ["LD H,E", () => loadRegisterFromRegister("H", "E")],
  0x64: ["LD H,H", () => loadRegisterFromRegister("H", "H")],
  0x65: ["LD H,L", () => loadRegisterFromRegister("H", "L")],
  0x66: ["LD H,(HL)", () => loadRegisterFromIndirectHL("H")],
  0x67: ["LD H,A", () => loadRegisterFromRegister("H", "A")],
  0x68: ["LD L,B", () => loadRegisterFromRegister("L", "B")],
  0x69: ["LD L,C", () => loadRegisterFromRegister("L", "C")],
  0x6a: ["LD L,D", () => loadRegisterFromRegister("L", "D")],
  0x6b: ["LD L,E", () => loadRegisterFromRegister("L", "E")],
  0x6c: ["LD L,H", () => loadRegisterFromRegister("L", "H")],
  0x6d: ["LD L,L", () => loadRegisterFromRegister("L", "L")],
  0x6e: ["LD L,(HL)", () => loadRegisterFromIndirectHL("L")],
  0x6f: ["LD L,A", () => loadRegisterFromRegister("L", "A")],

  0x70: ["LD (HL),B", () => loadIndirectHLFromRegister("B")],
  0x71: ["LD (HL),C", () => loadIndirectHLFromRegister("C")],
  0x72: ["LD (HL),D", () => loadIndirectHLFromRegister("D")],
  0x73: ["LD (HL),E", () => loadIndirectHLFromRegister("E")],
  0x74: ["LD (HL),H", () => loadIndirectHLFromRegister("H")],
  0x75: ["LD (HL),L", () => loadIndirectHLFromRegister("L")],
  0x77: ["LD (HL),A", () => loadIndirectHLFromRegister("A")],
  0x78: ["LD A,B", () => loadRegisterFromRegister("A", "B")],
  0x79: ["LD A,C", () => loadRegisterFromRegister("A", "C")],
  0x7a: ["LD A,D", () => loadRegisterFromRegister("A", "D")],
  0x7b: ["LD A,E", () => loadRegisterFromRegister("A", "E")],
  0x7c: ["LD A,H", () => loadRegisterFromRegister("A", "H")],
  0x7d: ["LD A,L", () => loadRegisterFromRegister("A", "L")],
  0x7e: ["LD A,(HL)", () => loadRegisterFromIndirectHL("A")],
  0x7f: ["LD A,A", () => loadRegisterFromRegister("A", "A")],

  0xa8: ["XOR B", xorAWithRegister("B")],
  0xa9: ["XOR C", xorAWithRegister("C")],
  0xaa: ["XOR D", xorAWithRegister("D")],
  0xab: ["XOR E", xorAWithRegister("E")],
  0xac: ["XOR H", xorAWithRegister("H")],
  0xad: ["XOR L", xorAWithRegister("L")],
  0xae: ["XOR (HL)", xorAWithHLPointerData],
  0xaf: ["XOR A", xorAWithRegister("A")],

  0xc1: ["POP BC", () => popFromStack("BC")],
  0xc2: ["JP NZ,a16", () => jumpToAddressIf("NZ")],
  0xc3: ["JP a16", jumpToAddress],
  0xc5: ["PUSH BC", () => pushToStack("BC")],
  0xca: ["JP Z,a16", () => jumpToAddressIf("Z")],

  0xd1: ["POP BC", () => popFromStack("DE")],
  0xd2: ["JP NC,a16", () => jumpToAddressIf("NC")],
  0xd5: ["PUSH DE", () => pushToStack("DE")],
  0xda: ["JP C,a16", () => jumpToAddressIf("C")],

  0xe0: ["LDH (a8),A", loadDirectByteFromAccumulator],
  0xe1: ["POP BC", () => popFromStack("HL")],
  0xe2: ["LD (C),A", loadIndirectCFromAccumulator],
  0xe5: ["PUSH HL", () => pushToStack("HL")],
  0xe9: ["JP (HL)", jumpToHLAddress],
  0xea: ["LD (a16),A", loadDirectWordFromAccumulator],
  0xee: ["XOR d8", xorAWithImmediateByte],

  0xf0: ["LDH A,(a8)", loadAccumulatorFromDirectByte],
  0xf1: ["POP AF", () => popFromStack("AF")],
  0xf2: ["LD A,(C)", loadAccumulatorFromIndirectC],
  0xf3: ["DI", disableInterrupts],
  0xf5: ["PUSH AF", () => pushToStack("AF")],
  0xf8: ["LD HL,SP+r8", loadHLFromAdjustedStackPointer],
  0xf9: ["LD SP,HL", loadStackPointerFromHL],
  0xfa: ["LD A,(a16)", loadAccumulatorFromDirectWord],
  0xfb: ["EI", enableInterrupts],
};

// const prefixCBInstructions: Partial<Record<number, Instruction>> = {};

export const nextInstruction = () => {
  const opcode = fetchImmediateByte();

  const instruction = instructions[opcode];

  if (!instruction) {
    throw new Error(`Invalid opcode ${opcode.toString(16)}`);
  }

  return instruction;
};

export function execNextInstruction() {
  const instruction = nextInstruction();

  console.log(
    "Executing instruction",
    instruction[0],
    " at ",
    (readRegister16("PC") - 1).toString(16)
  );

  return instruction[1]();
}
