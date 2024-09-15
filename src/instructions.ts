import { add, add16, addSigned, sub } from "./alu";
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
  getSignedByte,
  writeFlag,
  isSetFlag,
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

export function loadHLFromAdjustedStackPointer() {
  const e = getSignedByte(fetchImmediateByte());
  const { result, carryFrom3, carryFrom7 } = addSigned(readRegister16("SP"), e);
  writeRegisterPair("HL", result);
  writeFlag("Z", false);
  writeFlag("N", false);
  writeFlag("H", carryFrom3);
  writeFlag("CY", carryFrom7);
  return 12;
}

function addToAccumulator(value: number, carry = false) {
  const { result, carryFrom3, carryFrom7 } = add(
    readRegister8("A"),
    value,
    carry && isSetFlag("CY")
  );

  writeRegister8("A", result);
  writeFlag("Z", result === 0);
  writeFlag("N", false);
  writeFlag("H", carryFrom3);
  writeFlag("CY", carryFrom7);
}

export function addRegister(r: Register8) {
  addToAccumulator(readRegister8(r));
  return 4;
}

export function addIndirectHL() {
  addToAccumulator(Memory.read(readRegisterPair("HL")));
  return 8;
}

export function addImmediate() {
  addToAccumulator(fetchImmediateByte());
  return 8;
}

export function addRegisterWithCarry(r: Register8) {
  addToAccumulator(readRegister8(r), true);
  return 4;
}

export function addIndirectHLWithCarry() {
  addToAccumulator(Memory.read(readRegisterPair("HL")), true);
  return 8;
}

export function addImmediateWithCarry() {
  addToAccumulator(fetchImmediateByte(), true);
  return 8;
}

function subtractFromAccumulator(value: number, carry = false) {
  const { result, borrowTo3, borrowTo7 } = sub(
    readRegister8("A"),
    value,
    carry && isSetFlag("CY")
  );

  writeRegister8("A", result);
  writeFlag("Z", result === 0);
  writeFlag("N", true);
  writeFlag("H", borrowTo3);
  writeFlag("CY", borrowTo7);
}

export function subtractRegister(r: Register8) {
  subtractFromAccumulator(readRegister8(r));
  return 4;
}

export function subtractIndirectHL() {
  subtractFromAccumulator(Memory.read(readRegisterPair("HL")));
  return 8;
}

export function subtractImmediate() {
  subtractFromAccumulator(fetchImmediateByte());
  return 8;
}

export function subtractRegisterWithCarry(r: Register8) {
  subtractFromAccumulator(readRegister8(r), true);
  return 4;
}

export function subtractIndirectHLWithCarry() {
  subtractFromAccumulator(Memory.read(readRegisterPair("HL")), true);
  return 8;
}

export function subtractImmediateWithCarry() {
  subtractFromAccumulator(fetchImmediateByte(), true);
  return 8;
}

function compareWithAccumulator(value: number) {
  const { result, borrowTo3, borrowTo7 } = sub(readRegister8("A"), value);

  writeFlag("Z", result === 0);
  writeFlag("N", true);
  writeFlag("H", borrowTo3);
  writeFlag("CY", borrowTo7);
}

export function compareRegister(r: Register8) {
  compareWithAccumulator(readRegister8(r));
  return 4;
}

export function compareIndirectHL() {
  compareWithAccumulator(Memory.read(readRegisterPair("HL")));
  return 8;
}

export function compareImmediate() {
  compareWithAccumulator(fetchImmediateByte());
  return 8;
}

function increment(value: number) {
  const { result, carryFrom3 } = add(value, 1);

  writeFlag("Z", result === 0);
  writeFlag("N", false);
  writeFlag("H", carryFrom3);

  return result;
}

export function incrementRegister(r: Register8) {
  writeRegister8(r, increment(readRegister8(r)));
  return 4;
}

export function incrementIndirectHL() {
  const address = readRegisterPair("HL");
  Memory.write(address, increment(Memory.read(address)));
  return 12;
}

function decrement(value: number) {
  const { result, borrowTo3 } = sub(value, 1);

  writeFlag("Z", result === 0);
  writeFlag("N", true);
  writeFlag("H", borrowTo3);

  return result;
}

export function decrementRegister(r: Register8) {
  writeRegister8(r, decrement(readRegister8(r)));
  return 4;
}

export function decrementIndirectHL() {
  const address = readRegisterPair("HL");
  Memory.write(address, decrement(Memory.read(address)));
  return 12;
}

function andAccumulator(value: number) {
  const result = readRegister8("A") & value;

  writeRegister8("A", result);
  writeFlag("Z", result === 0);
  writeFlag("N", false);
  writeFlag("H", true);
  writeFlag("CY", false);
}

export function andRegister(r: Register8) {
  andAccumulator(readRegister8(r));
  return 4;
}

export function andIndirectHL() {
  andAccumulator(Memory.read(readRegisterPair("HL")));
  return 8;
}

export function andImmediate() {
  andAccumulator(fetchImmediateByte());
  return 8;
}

function orAccumulator(value: number) {
  const result = readRegister8("A") | value;

  writeRegister8("A", result);
  writeFlag("Z", result === 0);
  writeFlag("N", false);
  writeFlag("H", false);
  writeFlag("CY", false);
}

export function orRegister(r: Register8) {
  orAccumulator(readRegister8(r));
  return 4;
}

export function orIndirectHL() {
  orAccumulator(Memory.read(readRegisterPair("HL")));
  return 8;
}

export function orImmediate() {
  orAccumulator(fetchImmediateByte());
  return 8;
}

function xorAccumulator(value: number) {
  const result = readRegister8("A") ^ value;

  writeRegister8("A", result);
  writeFlag("Z", result === 0);
  writeFlag("N", false);
  writeFlag("H", false);
  writeFlag("CY", false);
}

export function xorRegister(r: Register8) {
  xorAccumulator(readRegister8(r));
  return 4;
}

export function xorIndirectHL() {
  xorAccumulator(Memory.read(readRegisterPair("HL")));
  return 8;
}

export function xorImmediate() {
  xorAccumulator(fetchImmediateByte());
  return 8;
}

export function complementCarryFlag() {
  writeFlag("N", false);
  writeFlag("H", false);
  writeFlag("CY", !isSetFlag("CY"));
  return 4;
}

export function setCarryFlag() {
  writeFlag("N", false);
  writeFlag("H", false);
  writeFlag("CY", true);
  return 4;
}

export function decimalAdjustAccumulator() {
  const a = readRegister8("A");
  const cy = isSetFlag("CY");
  const h = isSetFlag("H");

  const high = (a >> 4) & 0xf;
  const low = a & 0xf;

  if (!isSetFlag("N")) {
    if (!cy && high <= 0x9 && !h && low <= 0x9) {
      writeRegister8("A", a + 0x00);
      writeFlag("CY", false);
    } else if (!cy && high <= 0x8 && !h && low >= 0xa) {
      writeRegister8("A", a + 0x06);
      writeFlag("CY", false);
    } else if (!cy && high <= 0x9 && h && low <= 0x3) {
      writeRegister8("A", a + 0x06);
      writeFlag("CY", false);
    } else if (!cy && high >= 0xa && !h && low <= 0x9) {
      writeRegister8("A", a + 0x60);
      writeFlag("CY", true);
    } else if (!cy && high >= 0x9 && !h && low >= 0xa) {
      writeRegister8("A", a + 0x66);
      writeFlag("CY", true);
    } else if (!cy && high >= 0xa && h && low <= 0x3) {
      writeRegister8("A", a + 0x66);
      writeFlag("CY", true);
    } else if (cy && high <= 0x2 && !h && low <= 0x9) {
      writeRegister8("A", a + 0x60);
      writeFlag("CY", true);
    } else if (cy && high <= 0x2 && !h && low >= 0xa) {
      writeRegister8("A", a + 0x66);
      writeFlag("CY", true);
    } else if (cy && high <= 0x3 && h && low <= 0x3) {
      writeRegister8("A", a + 0x66);
      writeFlag("CY", true);
    }
  } else {
    if (!cy && high <= 0x9 && !h && low <= 0x9) {
      writeRegister8("A", a + 0x00);
      writeFlag("CY", false);
    } else if (!cy && high <= 0x8 && h && low >= 0x6) {
      writeRegister8("A", a + 0xfa);
      writeFlag("CY", false);
    } else if (cy && high >= 0x7 && !h && low <= 0x9) {
      writeRegister8("A", a + 0xa0);
      writeFlag("CY", false);
    } else if (cy && high >= 0x6 && h && low >= 0x6) {
      writeRegister8("A", a + 0x9a);
      writeFlag("CY", false);
    }
  }

  writeFlag("H", false);

  return 4;
}

export function complementAccumulator() {
  writeRegister8("A", ~readRegister8("A"));
  writeFlag("N", true);
  writeFlag("H", true);
  return 4;
}

export function incrementRegisterPair(rr: RegisterPair | "SP") {
  if (rr === "SP") {
    writeRegister16("SP", readRegister16("SP") + 1);
  } else {
    writeRegisterPair(rr, readRegisterPair(rr) + 1);
  }
  return 8;
}

export function decrementRegisterPair(rr: RegisterPair | "SP") {
  if (rr === "SP") {
    writeRegister16("SP", readRegister16("SP") - 1);
  } else {
    writeRegisterPair(rr, readRegisterPair(rr) - 1);
  }
  return 8;
}

export function addRegisterPair(rr: RegisterPair | "SP") {
  const { result, carryFrom11, carryFrom15 } = add16(
    readRegisterPair("HL"),
    rr === "SP" ? readRegister16("SP") : readRegisterPair(rr)
  );

  writeRegisterPair("HL", result);
  writeFlag("N", false);
  writeFlag("H", carryFrom11);
  writeFlag("CY", carryFrom15);

  return 8;
}

export function addToStackPointer() {
  const e = getSignedByte(fetchImmediateByte());
  const { result, carryFrom3, carryFrom7 } = addSigned(readRegister16("SP"), e);
  writeRegister16("SP", result);
  writeFlag("Z", false);
  writeFlag("N", false);
  writeFlag("H", carryFrom3);
  writeFlag("CY", carryFrom7);
  return 16;
}

export function rotateLeftCircularAccumulator() {
  const value = readRegister8("A");
  writeRegister8("A", ((value << 1) | (value >> 7)) & 0xff);
  writeFlag("Z", false);
  writeFlag("N", false);
  writeFlag("H", false);
  writeFlag("CY", (value & 0x80) != 0);
  return 4;
}

export function rotateRightCircularAccumulator() {
  const value = readRegister8("A");
  writeRegister8("A", ((value >> 1) | (value << 7)) & 0xff);
  writeFlag("Z", false);
  writeFlag("N", false);
  writeFlag("H", false);
  writeFlag("CY", (value & 0x01) != 0);
  return 4;
}

export function rotateLeftAccumulator() {
  const value = readRegister8("A");
  writeRegister8("A", ((value << 1) & 0xff) | (isSetFlag("CY") ? 1 : 0));
  writeFlag("Z", false);
  writeFlag("N", false);
  writeFlag("H", false);
  writeFlag("CY", (value & 0x80) != 0);
  return 4;
}

export function rotateRightAccumulator() {
  const value = readRegister8("A");
  writeRegister8("A", ((value >> 1) & 0xff) | (isSetFlag("CY") ? 0x80 : 0));
  writeFlag("Z", false);
  writeFlag("N", false);
  writeFlag("H", false);
  writeFlag("CY", (value & 0x1) != 0);
  return 4;
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
  0x03: ["INC BC", () => incrementRegisterPair("BC")],
  0x04: ["INC B", () => incrementRegister("B")],
  0x05: ["DEC B", () => decrementRegister("B")],
  0x06: ["LD B,d8", () => loadRegisterFromImmediate("B")],
  0x07: ["RLCA", rotateLeftCircularAccumulator],
  0x08: ["LD (a16),SP", loadDirectFromStackPointer],
  0x09: ["ADD HL,BC", () => addRegisterPair("BC")],
  0x0a: ["LD A,(BC)", loadAccumulatorFromIndirectBC],
  0x0b: ["DEC BC", () => decrementRegisterPair("BC")],
  0x0c: ["INC C", () => incrementRegister("C")],
  0x0d: ["DEC C", () => decrementRegister("C")],
  0x0e: ["LD C,d8", () => loadRegisterFromImmediate("C")],
  0x0f: ["RRCA", rotateRightCircularAccumulator],

  0x11: ["LD DE,d16", () => loadRegisterPair("DE")],
  0x12: ["LD (DE),A", loadIndirectDEFromAccumulator],
  0x13: ["INC DE", () => incrementRegisterPair("DE")],
  0x14: ["INC D", () => incrementRegister("D")],
  0x15: ["DEC D", () => decrementRegister("D")],
  0x16: ["LD D,d8", () => loadRegisterFromImmediate("D")],
  0x17: ["RLA", rotateLeftAccumulator],
  0x19: ["ADD HL,DE", () => addRegisterPair("DE")],
  0x1a: ["LD A,(DE)", loadAccumulatorFromIndirectDE],
  0x1b: ["DEC DE", () => decrementRegisterPair("DE")],
  0x1c: ["INC E", () => incrementRegister("E")],
  0x1d: ["DEC E", () => decrementRegister("E")],
  0x1e: ["LD E,d8", () => loadRegisterFromImmediate("E")],
  0x1f: ["RRA", rotateRightAccumulator],

  0x21: ["LD HL,d16", () => loadRegisterPair("HL")],
  0x22: ["LD (HL+),A", loadIndirectHLIncrementFromAccumulator],
  0x23: ["INC HL", () => incrementRegisterPair("HL")],
  0x24: ["INC H", () => incrementRegister("H")],
  0x25: ["DEC H", () => decrementRegister("H")],
  0x26: ["LD H,d8", () => loadRegisterFromImmediate("H")],
  0x27: ["DAA", decimalAdjustAccumulator],
  0x29: ["ADD HL,HL", () => addRegisterPair("HL")],
  0x2a: ["LD A,(HL+)", loadAccumulatorFromIndirectHLIncrement],
  0x2b: ["DEC HL", () => decrementRegisterPair("HL")],
  0x2c: ["INC L", () => incrementRegister("L")],
  0x2d: ["DEC L", () => decrementRegister("L")],
  0x2e: ["LD L,d8", () => loadRegisterFromImmediate("L")],
  0x2f: ["CPL", complementAccumulator],

  0x31: ["LD SP,d16", () => loadRegisterPair("SP")],
  0x32: ["LD (HL-),A", loadIndirectHLDecrementFromAccumulator],
  0x33: ["INC SP", () => incrementRegisterPair("SP")],
  0x34: ["INC (HL)", incrementIndirectHL],
  0x35: ["DEC (HL)", decrementIndirectHL],
  0x36: ["LD (HL),d8", loadIndirectHLFromImmediateData],
  0x37: ["SCF", setCarryFlag],
  0x39: ["ADD HL,SP", () => addRegisterPair("SP")],
  0x3a: ["LD A,(HL-)", loadAccumulatorFromIndirectHLDecrement],
  0x3b: ["DEC SP", () => decrementRegisterPair("SP")],
  0x3c: ["INC A", () => incrementRegister("A")],
  0x3d: ["DEC A", () => decrementRegister("A")],
  0x3e: ["LD A,d8", () => loadRegisterFromImmediate("A")],
  0x3f: ["CCF", complementCarryFlag],

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

  0x80: ["ADD A,B", () => addRegister("B")],
  0x81: ["ADD A,C", () => addRegister("C")],
  0x82: ["ADD A,D", () => addRegister("D")],
  0x83: ["ADD A,E", () => addRegister("E")],
  0x84: ["ADD A,H", () => addRegister("H")],
  0x85: ["ADD A,L", () => addRegister("L")],
  0x86: ["ADD A,(HL)", addIndirectHL],
  0x87: ["ADD A,A", () => addRegister("A")],
  0x88: ["ADC A,B", () => addRegisterWithCarry("B")],
  0x89: ["ADC A,C", () => addRegisterWithCarry("C")],
  0x8a: ["ADC A,D", () => addRegisterWithCarry("D")],
  0x8b: ["ADC A,E", () => addRegisterWithCarry("E")],
  0x8c: ["ADC A,H", () => addRegisterWithCarry("H")],
  0x8d: ["ADC A,L", () => addRegisterWithCarry("L")],
  0x8e: ["ADC A,(HL)", addIndirectHLWithCarry],
  0x8f: ["ADC A,A", () => addRegisterWithCarry("A")],

  0x90: ["SUB B", () => subtractRegister("B")],
  0x91: ["SUB C", () => subtractRegister("C")],
  0x92: ["SUB D", () => subtractRegister("D")],
  0x93: ["SUB E", () => subtractRegister("E")],
  0x94: ["SUB H", () => subtractRegister("H")],
  0x95: ["SUB L", () => subtractRegister("L")],
  0x96: ["SUB (HL)", subtractIndirectHL],
  0x97: ["SUB A", () => subtractRegister("A")],
  0x98: ["SBC A,B", () => subtractRegisterWithCarry("B")],
  0x99: ["SBC A,C", () => subtractRegisterWithCarry("C")],
  0x9a: ["SBC A,D", () => subtractRegisterWithCarry("D")],
  0x9b: ["SBC A,E", () => subtractRegisterWithCarry("E")],
  0x9c: ["SBC A,H", () => subtractRegisterWithCarry("H")],
  0x9d: ["SBC A,L", () => subtractRegisterWithCarry("L")],
  0x9e: ["SBC A,(HL)", subtractIndirectHLWithCarry],
  0x9f: ["SBC A,A", () => subtractRegisterWithCarry("A")],

  0xa0: ["AND B", () => andRegister("B")],
  0xa1: ["AND C", () => andRegister("C")],
  0xa2: ["AND D", () => andRegister("D")],
  0xa3: ["AND E", () => andRegister("E")],
  0xa4: ["AND H", () => andRegister("H")],
  0xa5: ["AND L", () => andRegister("L")],
  0xa6: ["AND (HL)", andIndirectHL],
  0xa7: ["AND A", () => andRegister("A")],
  0xa8: ["XOR B", () => xorRegister("B")],
  0xa9: ["XOR C", () => xorRegister("C")],
  0xaa: ["XOR D", () => xorRegister("D")],
  0xab: ["XOR E", () => xorRegister("E")],
  0xac: ["XOR H", () => xorRegister("H")],
  0xad: ["XOR L", () => xorRegister("L")],
  0xae: ["XOR (HL)", xorIndirectHL],
  0xaf: ["XOR A", () => xorRegister("A")],

  0xb0: ["OR B", () => orRegister("B")],
  0xb1: ["OR C", () => orRegister("C")],
  0xb2: ["OR D", () => orRegister("D")],
  0xb3: ["OR E", () => orRegister("E")],
  0xb4: ["OR H", () => orRegister("H")],
  0xb5: ["OR L", () => orRegister("L")],
  0xb6: ["OR (HL)", orIndirectHL],
  0xb7: ["OR A", () => orRegister("A")],
  0xb8: ["CP B", () => compareRegister("B")],
  0xb9: ["CP C", () => compareRegister("C")],
  0xba: ["CP D", () => compareRegister("D")],
  0xbb: ["CP E", () => compareRegister("E")],
  0xbc: ["CP H", () => compareRegister("H")],
  0xbd: ["CP L", () => compareRegister("L")],
  0xbe: ["CP (HL)", compareIndirectHL],
  0xbf: ["CP A", () => compareRegister("A")],

  0xc1: ["POP BC", () => popFromStack("BC")],
  0xc2: ["JP NZ,a16", () => jumpToAddressIf("NZ")],
  0xc3: ["JP a16", jumpToAddress],
  0xc5: ["PUSH BC", () => pushToStack("BC")],
  0xc6: ["ADD A,d8", addImmediate],
  0xca: ["JP Z,a16", () => jumpToAddressIf("Z")],
  0xce: ["ADC A,d8", addImmediateWithCarry],

  0xd1: ["POP BC", () => popFromStack("DE")],
  0xd2: ["JP NC,a16", () => jumpToAddressIf("NC")],
  0xd5: ["PUSH DE", () => pushToStack("DE")],
  0xd6: ["SUB d8", subtractImmediate],
  0xda: ["JP C,a16", () => jumpToAddressIf("C")],
  0xde: ["SBC A,d8", subtractImmediateWithCarry],

  0xe0: ["LDH (a8),A", loadDirectByteFromAccumulator],
  0xe1: ["POP BC", () => popFromStack("HL")],
  0xe2: ["LD (C),A", loadIndirectCFromAccumulator],
  0xe5: ["PUSH HL", () => pushToStack("HL")],
  0xe6: ["AND d8", andImmediate],
  0xe8: ["ADD SP,r8", addToStackPointer],
  0xe9: ["JP (HL)", jumpToHLAddress],
  0xea: ["LD (a16),A", loadDirectWordFromAccumulator],
  0xee: ["XOR d8", xorImmediate],

  0xf0: ["LDH A,(a8)", loadAccumulatorFromDirectByte],
  0xf1: ["POP AF", () => popFromStack("AF")],
  0xf2: ["LD A,(C)", loadAccumulatorFromIndirectC],
  0xf3: ["DI", disableInterrupts],
  0xf5: ["PUSH AF", () => pushToStack("AF")],
  0xf6: ["AND d8", orImmediate],
  0xf8: ["LD HL,SP+r8", loadHLFromAdjustedStackPointer],
  0xf9: ["LD SP,HL", loadStackPointerFromHL],
  0xfa: ["LD A,(a16)", loadAccumulatorFromDirectWord],
  0xfb: ["EI", enableInterrupts],
  0xfe: ["CP d8", compareImmediate],
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
