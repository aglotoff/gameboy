import {
  checkCondition,
  clearFlag,
  Condition,
  fetchImmediateByte,
  fetchImmediateWord,
  readRegister,
  readRegisterPair,
  Register8,
  setFlag,
  setIME,
  writeRegister,
} from "./cpu";
import * as Memory from "./memory";

type Instruction = [string, () => number];

// Perform no operation
const nop = () => {
  return 4;
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

// Take the logical exclusive-OR for each bit of the contents and register A
const xorAWith = (contents: number) => {
  const result = readRegister("A") ^ contents;

  if (result == 0) {
    setFlag("Z");
  } else {
    clearFlag("Z");
  }

  clearFlag("N");
  clearFlag("H");
  clearFlag("CY");

  writeRegister("A", result);
};

const xorAWithRegister = (register: Register8) => () => {
  xorAWith(readRegister(register));
  return 4;
};

const xorAWithHLMemory = () => {
  xorAWith(Memory.read(readRegisterPair("HL")));
  return 8;
};

const xorAWithByte = () => {
  xorAWith(fetchImmediateByte());
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

export const instructions: Partial<Record<number, Instruction>> = {
  0x00: ["NOP", nop],

  0xa8: ["XOR B", xorAWithRegister("B")],
  0xa9: ["XOR C", xorAWithRegister("C")],
  0xaa: ["XOR D", xorAWithRegister("D")],
  0xab: ["XOR E", xorAWithRegister("E")],
  0xac: ["XOR H", xorAWithRegister("H")],
  0xad: ["XOR L", xorAWithRegister("L")],
  0xae: ["XOR (HL)", xorAWithHLMemory],
  0xaf: ["XOR A", xorAWithRegister("A")],

  0xc2: ["JP NZ,a16", jumpToAddressIf("NZ")],
  0xc3: ["JP a16", jumpToAddress],
  0xca: ["JP Z,a16", jumpToAddressIf("Z")],

  0xd2: ["JP NC,a16", jumpToAddressIf("NC")],
  0xda: ["JP C,a16", jumpToAddressIf("C")],

  0xe9: ["JP (HL)", jumpToHLAddress],
  0xee: ["XOR d8", xorAWithByte],

  0xf3: ["DI", disableInterrupts],
  0xfb: ["EI", enableInterrupts],
};
