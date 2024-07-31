import {
  checkCondition,
  Condition,
  fetchImmediateByte,
  fetchImmediateWord,
  readRegister,
  readRegisterPair,
  Register8,
  RegisterPair,
  setIME,
  writeRegister,
  xor,
} from "./cpu";
import * as Memory from "./memory";

type Instruction = [string, () => number];

// Perform no operation
const nop = () => {
  return 4;
};

const loadRegisterIntoRegister =
  (source: Register8, destination: Register8) => () => {
    writeRegister(destination, readRegister(source));
    return 4;
  };

const loadImmediateByteIntoRegister = (destination: Register8) => () => {
  const data = fetchImmediateByte();
  writeRegister(destination, data);
  return 8;
};

const loadPointerDataIntoRegister =
  (source: RegisterPair, destination: Register8) => () => {
    const data = Memory.read(readRegisterPair(source));
    writeRegister(destination, data);
    return 8;
  };

const loadRegisterIntoPointerMemory =
  (source: Register8, destination: RegisterPair) => () => {
    Memory.write(readRegisterPair(destination), readRegister(source));
    return 8;
  };

const loadImmediateByteIntoHLPointerMemory = () => {
  const data = fetchImmediateByte();
  Memory.write(readRegisterPair("HL"), data);
  return 12;
};

const loadAddressDataIntoA = () => {
  const address = fetchImmediateWord();
  writeRegister("A", Memory.read(address));
  return 16;
};

const loadAIntoAddress = () => {
  const address = fetchImmediateWord();
  Memory.write(address, readRegister("A"));
  return 16;
};

const loadCPointerDataIntoA = () => {
  const address = 0xff00 + readRegister("C");
  writeRegister("A", Memory.read(address));
  return 8;
};

const loadAIntoCPointerMemory = () => {
  const address = 0xff00 + readRegister("C");
  Memory.write(address, readRegister("A"));
  return 8;
};

// Load the operand to the program counter
const jumpToAddress = () => {
  const address = fetchImmediateWord();
  writeRegister("PC", address);
  return 16;
};

// Load the operand in the PC if the condition and the flag status match
const jumpToAddressIf = (condition: Condition) => () => {
  const address = fetchImmediateWord();

  if (checkCondition(condition)) {
    writeRegister("PC", address);
    return 16;
  }

  return 12;
};

// Load the contents of register pair HL in program counter PC
const jumpToHLAddress = () => {
  writeRegister("PC", readRegisterPair("HL"));
  return 4;
};

// Take the logical exclusive-OR for each bit of the contents of the specified
// value and register A and store the results in register A
const xorA = (value: number) => {
  writeRegister("A", xor(readRegister("A"), value));
};

const xorAWithRegister = (register: Register8) => () => {
  xorA(readRegister(register));
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
  0x02: ["LD (BC),A", loadRegisterIntoPointerMemory("A", "BC")],
  0x06: ["LD B,d8", loadImmediateByteIntoRegister("B")],
  0x0a: ["LD A,(BC)", loadPointerDataIntoRegister("BC", "A")],
  0x0e: ["LD C,d8", loadImmediateByteIntoRegister("C")],

  0x12: ["LD (DE),A", loadRegisterIntoPointerMemory("A", "DE")],
  0x16: ["LD D,d8", loadImmediateByteIntoRegister("D")],
  0x1e: ["LD E,d8", loadImmediateByteIntoRegister("E")],

  0x26: ["LD H,d8", loadImmediateByteIntoRegister("H")],
  0x2e: ["LD L,d8", loadImmediateByteIntoRegister("L")],

  0x36: ["LD (HL),d8", loadImmediateByteIntoHLPointerMemory],
  0x3e: ["LD A,d8", loadImmediateByteIntoRegister("A")],

  0x40: ["LD B,B", loadRegisterIntoRegister("B", "B")],
  0x41: ["LD B,C", loadRegisterIntoRegister("C", "B")],
  0x42: ["LD B,D", loadRegisterIntoRegister("D", "B")],
  0x43: ["LD B,E", loadRegisterIntoRegister("E", "B")],
  0x44: ["LD B,H", loadRegisterIntoRegister("H", "B")],
  0x45: ["LD B,L", loadRegisterIntoRegister("L", "B")],
  0x46: ["LD B,(HL)", loadPointerDataIntoRegister("HL", "B")],
  0x47: ["LD B,A", loadRegisterIntoRegister("A", "B")],
  0x48: ["LD C,B", loadRegisterIntoRegister("B", "C")],
  0x49: ["LD C,C", loadRegisterIntoRegister("C", "C")],
  0x4a: ["LD C,D", loadRegisterIntoRegister("D", "C")],
  0x4b: ["LD C,E", loadRegisterIntoRegister("E", "C")],
  0x4c: ["LD C,H", loadRegisterIntoRegister("H", "C")],
  0x4d: ["LD C,L", loadRegisterIntoRegister("L", "C")],
  0x4e: ["LD C,(HL)", loadPointerDataIntoRegister("HL", "C")],
  0x4f: ["LD C,A", loadRegisterIntoRegister("A", "C")],

  0x50: ["LD D,B", loadRegisterIntoRegister("B", "D")],
  0x51: ["LD D,C", loadRegisterIntoRegister("C", "D")],
  0x52: ["LD D,D", loadRegisterIntoRegister("D", "D")],
  0x53: ["LD D,E", loadRegisterIntoRegister("E", "D")],
  0x54: ["LD D,H", loadRegisterIntoRegister("H", "D")],
  0x55: ["LD D,L", loadRegisterIntoRegister("L", "D")],
  0x56: ["LD D,(HL)", loadPointerDataIntoRegister("HL", "D")],
  0x57: ["LD D,A", loadRegisterIntoRegister("A", "D")],
  0x58: ["LD E,B", loadRegisterIntoRegister("B", "E")],
  0x59: ["LD E,C", loadRegisterIntoRegister("C", "E")],
  0x5a: ["LD E,D", loadRegisterIntoRegister("D", "E")],
  0x5b: ["LD E,E", loadRegisterIntoRegister("E", "E")],
  0x5c: ["LD E,H", loadRegisterIntoRegister("H", "E")],
  0x5d: ["LD E,L", loadRegisterIntoRegister("L", "E")],
  0x5e: ["LD E,(HL)", loadPointerDataIntoRegister("HL", "E")],
  0x5f: ["LD E,A", loadRegisterIntoRegister("A", "E")],

  0x60: ["LD H,B", loadRegisterIntoRegister("B", "H")],
  0x61: ["LD H,C", loadRegisterIntoRegister("C", "H")],
  0x62: ["LD H,D", loadRegisterIntoRegister("D", "H")],
  0x63: ["LD H,E", loadRegisterIntoRegister("E", "H")],
  0x64: ["LD H,H", loadRegisterIntoRegister("H", "H")],
  0x65: ["LD H,L", loadRegisterIntoRegister("L", "H")],
  0x66: ["LD H,(HL)", loadPointerDataIntoRegister("HL", "H")],
  0x67: ["LD H,A", loadRegisterIntoRegister("A", "H")],
  0x68: ["LD L,B", loadRegisterIntoRegister("B", "L")],
  0x69: ["LD L,C", loadRegisterIntoRegister("C", "L")],
  0x6a: ["LD L,D", loadRegisterIntoRegister("D", "L")],
  0x6b: ["LD L,E", loadRegisterIntoRegister("E", "L")],
  0x6c: ["LD L,H", loadRegisterIntoRegister("H", "L")],
  0x6d: ["LD L,L", loadRegisterIntoRegister("L", "L")],
  0x6e: ["LD L,(HL)", loadPointerDataIntoRegister("HL", "L")],
  0x6f: ["LD L,A", loadRegisterIntoRegister("A", "L")],

  0x70: ["LD (HL),B", loadRegisterIntoPointerMemory("B", "HL")],
  0x71: ["LD (HL),C", loadRegisterIntoPointerMemory("C", "HL")],
  0x72: ["LD (HL),D", loadRegisterIntoPointerMemory("D", "HL")],
  0x73: ["LD (HL),E", loadRegisterIntoPointerMemory("E", "HL")],
  0x74: ["LD (HL),H", loadRegisterIntoPointerMemory("H", "HL")],
  0x75: ["LD (HL),L", loadRegisterIntoPointerMemory("L", "HL")],
  0x77: ["LD (HL),A", loadRegisterIntoPointerMemory("A", "HL")],
  0x78: ["LD A,B", loadRegisterIntoRegister("B", "A")],
  0x79: ["LD A,C", loadRegisterIntoRegister("C", "A")],
  0x7a: ["LD A,D", loadRegisterIntoRegister("D", "A")],
  0x7b: ["LD A,E", loadRegisterIntoRegister("E", "A")],
  0x7c: ["LD A,H", loadRegisterIntoRegister("H", "A")],
  0x7d: ["LD A,L", loadRegisterIntoRegister("L", "A")],
  0x7e: ["LD A,(HL)", loadPointerDataIntoRegister("HL", "A")],
  0x7f: ["LD A,A", loadRegisterIntoRegister("A", "A")],

  0xa8: ["XOR B", xorAWithRegister("B")],
  0xa9: ["XOR C", xorAWithRegister("C")],
  0xaa: ["XOR D", xorAWithRegister("D")],
  0xab: ["XOR E", xorAWithRegister("E")],
  0xac: ["XOR H", xorAWithRegister("H")],
  0xad: ["XOR L", xorAWithRegister("L")],
  0xae: ["XOR (HL)", xorAWithHLPointerData],
  0xaf: ["XOR A", xorAWithRegister("A")],

  0xc2: ["JP NZ,a16", jumpToAddressIf("NZ")],
  0xc3: ["JP a16", jumpToAddress],
  0xca: ["JP Z,a16", jumpToAddressIf("Z")],

  0xd2: ["JP NC,a16", jumpToAddressIf("NC")],
  0xda: ["JP C,a16", jumpToAddressIf("C")],

  0xe2: ["LD (C),A", loadAIntoCPointerMemory],
  0xe9: ["JP (HL)", jumpToHLAddress],
  0xea: ["LD (a16),A", loadAIntoAddress],
  0xee: ["XOR d8", xorAWithImmediateByte],

  0xf2: ["LD A,(C)", loadCPointerDataIntoA],
  0xf3: ["DI", disableInterrupts],
  0xfa: ["LD A,(a16)", loadAddressDataIntoA],
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
