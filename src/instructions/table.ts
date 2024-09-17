import {
  checkCondition,
  Condition,
  RegisterPair,
  setIME,
  Register,
  regs,
} from "./cpu";
import {
  addRegisterPair,
  addToStackPointer,
  decrementRegisterPair,
  incrementRegisterPair,
} from "./inst/arithmetic16";
import {
  addImmediate,
  addImmediateWithCarry,
  addIndirectHL,
  addIndirectHLWithCarry,
  addRegister,
  addRegisterWithCarry,
  andImmediate,
  andIndirectHL,
  andRegister,
  compareImmediate,
  compareIndirectHL,
  compareRegister,
  complementAccumulator,
  complementCarryFlag,
  decimalAdjustAccumulator,
  decrementIndirectHL,
  decrementRegister,
  incrementIndirectHL,
  incrementRegister,
  orImmediate,
  orIndirectHL,
  orRegister,
  setCarryFlag,
  subtractImmediate,
  subtractImmediateWithCarry,
  subtractIndirectHL,
  subtractIndirectHLWithCarry,
  subtractRegister,
  subtractRegisterWithCarry,
  xorImmediate,
  xorIndirectHL,
  xorRegister,
} from "./inst/arithmetic8";
import {
  rotateLeftAccumulator,
  rotateLeftCircularAccumulator,
  rotateRightAccumulator,
  rotateRightCircularAccumulator,
} from "./inst/bitwise";
import {
  fetchImmediateByte,
  fetchImmediateWord,
  Instruction,
  InstructionCtx,
} from "./inst/lib";
import {
  loadDirectFromStackPointer,
  loadHLFromAdjustedStackPointer,
  loadRegisterPair,
  loadStackPointerFromHL,
  popFromStack,
  pushToStack,
} from "./inst/load16";
import {
  loadAccumulatorFromDirectByte,
  loadAccumulatorFromDirectWord,
  loadAccumulatorFromIndirectBC,
  loadAccumulatorFromIndirectC,
  loadAccumulatorFromIndirectDE,
  loadAccumulatorFromIndirectHLDecrement,
  loadAccumulatorFromIndirectHLIncrement,
  loadDirectByteFromAccumulator,
  loadDirectWordFromAccumulator,
  loadIndirectBCFromAccumulator,
  loadIndirectCFromAccumulator,
  loadIndirectDEFromAccumulator,
  loadIndirectHLDecrementFromAccumulator,
  loadIndirectHLFromImmediateData,
  loadIndirectHLFromRegister,
  loadIndirectHLIncrementFromAccumulator,
  loadRegisterFromImmediate,
  loadRegisterFromIndirectHL,
  loadRegisterFromRegister,
} from "./inst/load8";

// Perform no operation
const nop = () => {
  return 4;
};

// -----------------

// Load the operand to the program counter
const jumpToAddress = (ctx: InstructionCtx) => {
  const address = fetchImmediateWord(ctx);
  ctx.regs.writePair(RegisterPair.PC, address);
  return 16;
};

// Load the operand in the PC if the condition and the flag status match
const jumpToAddressIf = (ctx: InstructionCtx, condition: Condition) => {
  const address = fetchImmediateWord(ctx);

  if (checkCondition(ctx.regs, condition)) {
    ctx.regs.writePair(RegisterPair.PC, address);
    return 16;
  }

  return 12;
};

// Load the contents of register pair HL in program counter PC
const jumpToHLAddress = (ctx: InstructionCtx) => {
  ctx.regs.writePair(RegisterPair.PC, ctx.regs.readPair(RegisterPair.HL));
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
  0x01: ["LD BC,d16", (c) => loadRegisterPair(c, RegisterPair.BC)],
  0x02: ["LD (BC),A", loadIndirectBCFromAccumulator],
  0x03: ["INC BC", (c) => incrementRegisterPair(c, RegisterPair.BC)],
  0x04: ["INC B", (c) => incrementRegister(c, Register.B)],
  0x05: ["DEC B", (c) => decrementRegister(c, Register.B)],
  0x06: ["LD B,d8", (c) => loadRegisterFromImmediate(c, Register.B)],
  0x07: ["RLCA", rotateLeftCircularAccumulator],
  0x08: ["LD (a16),SP", loadDirectFromStackPointer],
  0x09: ["ADD HL,BC", (c) => addRegisterPair(c, RegisterPair.BC)],
  0x0a: ["LD A,(BC)", loadAccumulatorFromIndirectBC],
  0x0b: ["DEC BC", (c) => decrementRegisterPair(c, RegisterPair.BC)],
  0x0c: ["INC C", (c) => incrementRegister(c, Register.C)],
  0x0d: ["DEC C", (c) => decrementRegister(c, Register.C)],
  0x0e: ["LD C,d8", (c) => loadRegisterFromImmediate(c, Register.C)],
  0x0f: ["RRCA", rotateRightCircularAccumulator],

  0x11: ["LD DE,d16", (c) => loadRegisterPair(c, RegisterPair.DE)],
  0x12: ["LD (DE),A", loadIndirectDEFromAccumulator],
  0x13: ["INC DE", (c) => incrementRegisterPair(c, RegisterPair.DE)],
  0x14: ["INC D", (c) => incrementRegister(c, Register.D)],
  0x15: ["DEC D", (c) => decrementRegister(c, Register.D)],
  0x16: ["LD D,d8", (c) => loadRegisterFromImmediate(c, Register.D)],
  0x17: ["RLA", rotateLeftAccumulator],
  0x19: ["ADD HL,DE", (c) => addRegisterPair(c, RegisterPair.DE)],
  0x1a: ["LD A,(DE)", loadAccumulatorFromIndirectDE],
  0x1b: ["DEC DE", (c) => decrementRegisterPair(c, RegisterPair.DE)],
  0x1c: ["INC E", (c) => incrementRegister(c, Register.E)],
  0x1d: ["DEC E", (c) => decrementRegister(c, Register.E)],
  0x1e: ["LD E,d8", (c) => loadRegisterFromImmediate(c, Register.E)],
  0x1f: ["RRA", rotateRightAccumulator],

  0x21: ["LD HL,d16", (c) => loadRegisterPair(c, RegisterPair.HL)],
  0x22: ["LD (HL+),A", loadIndirectHLIncrementFromAccumulator],
  0x23: ["INC HL", (c) => incrementRegisterPair(c, RegisterPair.HL)],
  0x24: ["INC H", (c) => incrementRegister(c, Register.H)],
  0x25: ["DEC H", (c) => decrementRegister(c, Register.H)],
  0x26: ["LD H,d8", (c) => loadRegisterFromImmediate(c, Register.H)],
  0x27: ["DAA", decimalAdjustAccumulator],
  0x29: ["ADD HL,HL", (c) => addRegisterPair(c, RegisterPair.HL)],
  0x2a: ["LD A,(HL+)", loadAccumulatorFromIndirectHLIncrement],
  0x2b: ["DEC HL", (c) => decrementRegisterPair(c, RegisterPair.HL)],
  0x2c: ["INC L", (c) => incrementRegister(c, Register.L)],
  0x2d: ["DEC L", (c) => decrementRegister(c, Register.L)],
  0x2e: ["LD L,d8", (c) => loadRegisterFromImmediate(c, Register.L)],
  0x2f: ["CPL", complementAccumulator],

  0x31: ["LD SP,d16", (c) => loadRegisterPair(c, RegisterPair.SP)],
  0x32: ["LD (HL-),A", loadIndirectHLDecrementFromAccumulator],
  0x33: ["INC SP", (c) => incrementRegisterPair(c, RegisterPair.SP)],
  0x34: ["INC (HL)", incrementIndirectHL],
  0x35: ["DEC (HL)", decrementIndirectHL],
  0x36: ["LD (HL),d8", loadIndirectHLFromImmediateData],
  0x37: ["SCF", setCarryFlag],
  0x39: ["ADD HL,SP", (c) => addRegisterPair(c, RegisterPair.SP)],
  0x3a: ["LD A,(HL-)", loadAccumulatorFromIndirectHLDecrement],
  0x3b: ["DEC SP", (c) => decrementRegisterPair(c, RegisterPair.SP)],
  0x3c: ["INC A", (c) => incrementRegister(c, Register.A)],
  0x3d: ["DEC A", (c) => decrementRegister(c, Register.A)],
  0x3e: ["LD A,d8", (c) => loadRegisterFromImmediate(c, Register.A)],
  0x3f: ["CCF", complementCarryFlag],

  0x40: ["LD B,B", (c) => loadRegisterFromRegister(c, Register.B, Register.B)],
  0x41: ["LD B,C", (c) => loadRegisterFromRegister(c, Register.B, Register.C)],
  0x42: ["LD B,D", (c) => loadRegisterFromRegister(c, Register.B, Register.D)],
  0x43: ["LD B,E", (c) => loadRegisterFromRegister(c, Register.B, Register.E)],
  0x44: ["LD B,H", (c) => loadRegisterFromRegister(c, Register.B, Register.H)],
  0x45: ["LD B,L", (c) => loadRegisterFromRegister(c, Register.B, Register.L)],
  0x46: ["LD B,(HL)", (c) => loadRegisterFromIndirectHL(c, Register.B)],
  0x47: ["LD B,A", (c) => loadRegisterFromRegister(c, Register.B, Register.A)],
  0x48: ["LD C,B", (c) => loadRegisterFromRegister(c, Register.C, Register.B)],
  0x49: ["LD C,C", (c) => loadRegisterFromRegister(c, Register.C, Register.C)],
  0x4a: ["LD C,D", (c) => loadRegisterFromRegister(c, Register.C, Register.D)],
  0x4b: ["LD C,E", (c) => loadRegisterFromRegister(c, Register.C, Register.E)],
  0x4c: ["LD C,H", (c) => loadRegisterFromRegister(c, Register.C, Register.H)],
  0x4d: ["LD C,L", (c) => loadRegisterFromRegister(c, Register.C, Register.L)],
  0x4e: ["LD C,(HL)", (c) => loadRegisterFromIndirectHL(c, Register.C)],
  0x4f: ["LD C,A", (c) => loadRegisterFromRegister(c, Register.C, Register.A)],

  0x50: ["LD D,B", (c) => loadRegisterFromRegister(c, Register.D, Register.B)],
  0x51: ["LD D,C", (c) => loadRegisterFromRegister(c, Register.D, Register.D)],
  0x52: ["LD D,D", (c) => loadRegisterFromRegister(c, Register.D, Register.D)],
  0x53: ["LD D,E", (c) => loadRegisterFromRegister(c, Register.D, Register.E)],
  0x54: ["LD D,H", (c) => loadRegisterFromRegister(c, Register.D, Register.H)],
  0x55: ["LD D,L", (c) => loadRegisterFromRegister(c, Register.L, Register.D)],
  0x56: ["LD D,(HL)", (c) => loadRegisterFromIndirectHL(c, Register.D)],
  0x57: ["LD D,A", (c) => loadRegisterFromRegister(c, Register.D, Register.A)],
  0x58: ["LD E,B", (c) => loadRegisterFromRegister(c, Register.E, Register.B)],
  0x59: ["LD E,C", (c) => loadRegisterFromRegister(c, Register.E, Register.C)],
  0x5a: ["LD E,D", (c) => loadRegisterFromRegister(c, Register.E, Register.D)],
  0x5b: ["LD E,E", (c) => loadRegisterFromRegister(c, Register.E, Register.E)],
  0x5c: ["LD E,H", (c) => loadRegisterFromRegister(c, Register.E, Register.H)],
  0x5d: ["LD E,L", (c) => loadRegisterFromRegister(c, Register.E, Register.L)],
  0x5e: ["LD E,(HL)", (c) => loadRegisterFromIndirectHL(c, Register.E)],
  0x5f: ["LD E,A", (c) => loadRegisterFromRegister(c, Register.E, Register.A)],

  0x60: ["LD H,B", (c) => loadRegisterFromRegister(c, Register.H, Register.B)],
  0x61: ["LD H,C", (c) => loadRegisterFromRegister(c, Register.H, Register.C)],
  0x62: ["LD H,D", (c) => loadRegisterFromRegister(c, Register.H, Register.D)],
  0x63: ["LD H,E", (c) => loadRegisterFromRegister(c, Register.H, Register.E)],
  0x64: ["LD H,H", (c) => loadRegisterFromRegister(c, Register.H, Register.H)],
  0x65: ["LD H,L", (c) => loadRegisterFromRegister(c, Register.H, Register.L)],
  0x66: ["LD H,(HL)", (c) => loadRegisterFromIndirectHL(c, Register.H)],
  0x67: ["LD H,A", (c) => loadRegisterFromRegister(c, Register.H, Register.A)],
  0x68: ["LD L,B", (c) => loadRegisterFromRegister(c, Register.L, Register.B)],
  0x69: ["LD L,C", (c) => loadRegisterFromRegister(c, Register.L, Register.C)],
  0x6a: ["LD L,D", (c) => loadRegisterFromRegister(c, Register.L, Register.D)],
  0x6b: ["LD L,E", (c) => loadRegisterFromRegister(c, Register.L, Register.E)],
  0x6c: ["LD L,H", (c) => loadRegisterFromRegister(c, Register.L, Register.H)],
  0x6d: ["LD L,L", (c) => loadRegisterFromRegister(c, Register.L, Register.L)],
  0x6e: ["LD L,(HL)", (c) => loadRegisterFromIndirectHL(c, Register.L)],
  0x6f: ["LD L,A", (c) => loadRegisterFromRegister(c, Register.L, Register.A)],

  0x70: ["LD (HL),B", (c) => loadIndirectHLFromRegister(c, Register.B)],
  0x71: ["LD (HL),C", (c) => loadIndirectHLFromRegister(c, Register.C)],
  0x72: ["LD (HL),D", (c) => loadIndirectHLFromRegister(c, Register.D)],
  0x73: ["LD (HL),E", (c) => loadIndirectHLFromRegister(c, Register.E)],
  0x74: ["LD (HL),H", (c) => loadIndirectHLFromRegister(c, Register.H)],
  0x75: ["LD (HL),L", (c) => loadIndirectHLFromRegister(c, Register.L)],
  0x77: ["LD (HL),A", (c) => loadIndirectHLFromRegister(c, Register.A)],
  0x78: ["LD A,B", (c) => loadRegisterFromRegister(c, Register.A, Register.B)],
  0x79: ["LD A,C", (c) => loadRegisterFromRegister(c, Register.A, Register.C)],
  0x7a: ["LD A,D", (c) => loadRegisterFromRegister(c, Register.A, Register.D)],
  0x7b: ["LD A,E", (c) => loadRegisterFromRegister(c, Register.A, Register.E)],
  0x7c: ["LD A,H", (c) => loadRegisterFromRegister(c, Register.A, Register.H)],
  0x7d: ["LD A,L", (c) => loadRegisterFromRegister(c, Register.A, Register.L)],
  0x7e: ["LD A,(HL)", (c) => loadRegisterFromIndirectHL(c, Register.A)],
  0x7f: ["LD A,A", (c) => loadRegisterFromRegister(c, Register.A, Register.A)],

  0x80: ["ADD A,B", (c) => addRegister(c, Register.B)],
  0x81: ["ADD A,C", (c) => addRegister(c, Register.C)],
  0x82: ["ADD A,D", (c) => addRegister(c, Register.D)],
  0x83: ["ADD A,E", (c) => addRegister(c, Register.E)],
  0x84: ["ADD A,H", (c) => addRegister(c, Register.H)],
  0x85: ["ADD A,L", (c) => addRegister(c, Register.L)],
  0x86: ["ADD A,(HL)", addIndirectHL],
  0x87: ["ADD A,A", (c) => addRegister(c, Register.A)],
  0x88: ["ADC A,B", (c) => addRegisterWithCarry(c, Register.B)],
  0x89: ["ADC A,C", (c) => addRegisterWithCarry(c, Register.C)],
  0x8a: ["ADC A,D", (c) => addRegisterWithCarry(c, Register.D)],
  0x8b: ["ADC A,E", (c) => addRegisterWithCarry(c, Register.E)],
  0x8c: ["ADC A,H", (c) => addRegisterWithCarry(c, Register.H)],
  0x8d: ["ADC A,L", (c) => addRegisterWithCarry(c, Register.L)],
  0x8e: ["ADC A,(HL)", addIndirectHLWithCarry],
  0x8f: ["ADC A,A", (c) => addRegisterWithCarry(c, Register.A)],

  0x90: ["SUB B", (c) => subtractRegister(c, Register.B)],
  0x91: ["SUB C", (c) => subtractRegister(c, Register.C)],
  0x92: ["SUB D", (c) => subtractRegister(c, Register.D)],
  0x93: ["SUB E", (c) => subtractRegister(c, Register.E)],
  0x94: ["SUB H", (c) => subtractRegister(c, Register.H)],
  0x95: ["SUB L", (c) => subtractRegister(c, Register.L)],
  0x96: ["SUB (HL)", subtractIndirectHL],
  0x97: ["SUB A", (c) => subtractRegister(c, Register.A)],
  0x98: ["SBC A,B", (c) => subtractRegisterWithCarry(c, Register.B)],
  0x99: ["SBC A,C", (c) => subtractRegisterWithCarry(c, Register.C)],
  0x9a: ["SBC A,D", (c) => subtractRegisterWithCarry(c, Register.D)],
  0x9b: ["SBC A,E", (c) => subtractRegisterWithCarry(c, Register.E)],
  0x9c: ["SBC A,H", (c) => subtractRegisterWithCarry(c, Register.H)],
  0x9d: ["SBC A,L", (c) => subtractRegisterWithCarry(c, Register.L)],
  0x9e: ["SBC A,(HL)", subtractIndirectHLWithCarry],
  0x9f: ["SBC A,A", (c) => subtractRegisterWithCarry(c, Register.A)],

  0xa0: ["AND B", (c) => andRegister(c, Register.B)],
  0xa1: ["AND C", (c) => andRegister(c, Register.C)],
  0xa2: ["AND D", (c) => andRegister(c, Register.D)],
  0xa3: ["AND E", (c) => andRegister(c, Register.E)],
  0xa4: ["AND H", (c) => andRegister(c, Register.H)],
  0xa5: ["AND L", (c) => andRegister(c, Register.L)],
  0xa6: ["AND (HL)", andIndirectHL],
  0xa7: ["AND A", (c) => andRegister(c, Register.A)],
  0xa8: ["XOR B", (c) => xorRegister(c, Register.B)],
  0xa9: ["XOR C", (c) => xorRegister(c, Register.C)],
  0xaa: ["XOR D", (c) => xorRegister(c, Register.D)],
  0xab: ["XOR E", (c) => xorRegister(c, Register.E)],
  0xac: ["XOR H", (c) => xorRegister(c, Register.H)],
  0xad: ["XOR L", (c) => xorRegister(c, Register.L)],
  0xae: ["XOR (HL)", xorIndirectHL],
  0xaf: ["XOR A", (c) => xorRegister(c, Register.A)],

  0xb0: ["OR B", (c) => orRegister(c, Register.B)],
  0xb1: ["OR C", (c) => orRegister(c, Register.C)],
  0xb2: ["OR D", (c) => orRegister(c, Register.D)],
  0xb3: ["OR E", (c) => orRegister(c, Register.E)],
  0xb4: ["OR H", (c) => orRegister(c, Register.H)],
  0xb5: ["OR L", (c) => orRegister(c, Register.L)],
  0xb6: ["OR (HL)", orIndirectHL],
  0xb7: ["OR A", (c) => orRegister(c, Register.A)],
  0xb8: ["CP B", (c) => compareRegister(c, Register.B)],
  0xb9: ["CP C", (c) => compareRegister(c, Register.C)],
  0xba: ["CP D", (c) => compareRegister(c, Register.D)],
  0xbb: ["CP E", (c) => compareRegister(c, Register.E)],
  0xbc: ["CP H", (c) => compareRegister(c, Register.H)],
  0xbd: ["CP L", (c) => compareRegister(c, Register.L)],
  0xbe: ["CP (HL)", compareIndirectHL],
  0xbf: ["CP A", (c) => compareRegister(c, Register.A)],

  0xc1: ["POP BC", (c) => popFromStack(c, RegisterPair.BC)],
  0xc2: ["JP NZ,a16", (c) => jumpToAddressIf(c, "NZ")],
  0xc3: ["JP a16", jumpToAddress],
  0xc5: ["PUSH BC", (c) => pushToStack(c, RegisterPair.BC)],
  0xc6: ["ADD A,d8", addImmediate],
  0xca: ["JP Z,a16", (c) => jumpToAddressIf(c, "Z")],
  0xce: ["ADC A,d8", addImmediateWithCarry],

  0xd1: ["POP BC", (c) => popFromStack(c, RegisterPair.DE)],
  0xd2: ["JP NC,a16", (c) => jumpToAddressIf(c, "NC")],
  0xd5: ["PUSH DE", (c) => pushToStack(c, RegisterPair.DE)],
  0xd6: ["SUB d8", subtractImmediate],
  0xda: ["JP C,a16", (c) => jumpToAddressIf(c, "C")],
  0xde: ["SBC A,d8", subtractImmediateWithCarry],

  0xe0: ["LDH (a8),A", loadDirectByteFromAccumulator],
  0xe1: ["POP BC", (c) => popFromStack(c, RegisterPair.HL)],
  0xe2: ["LD (C),A", loadIndirectCFromAccumulator],
  0xe5: ["PUSH HL", (c) => pushToStack(c, RegisterPair.HL)],
  0xe6: ["AND d8", andImmediate],
  0xe8: ["ADD SP,r8", addToStackPointer],
  0xe9: ["JP (HL)", jumpToHLAddress],
  0xea: ["LD (a16),A", loadDirectWordFromAccumulator],
  0xee: ["XOR d8", xorImmediate],

  0xf0: ["LDH A,(a8)", loadAccumulatorFromDirectByte],
  0xf1: ["POP AF", (c) => popFromStack(c, RegisterPair.AF)],
  0xf2: ["LD A,(C)", loadAccumulatorFromIndirectC],
  0xf3: ["DI", disableInterrupts],
  0xf5: ["PUSH AF", (c) => pushToStack(c, RegisterPair.AF)],
  0xf6: ["AND d8", orImmediate],
  0xf8: ["LD HL,SP+r8", loadHLFromAdjustedStackPointer],
  0xf9: ["LD SP,HL", loadStackPointerFromHL],
  0xfa: ["LD A,(a16)", loadAccumulatorFromDirectWord],
  0xfb: ["EI", enableInterrupts],
  0xfe: ["CP d8", compareImmediate],
};

// const prefixCBInstructions: Partial<Record<number, Instruction>> = {};

export const nextInstruction = (ctx: InstructionCtx) => {
  const opcode = fetchImmediateByte(ctx);

  const instruction = instructions[opcode];

  if (!instruction) {
    throw new Error(`Invalid opcode ${opcode.toString(16)}`);
  }

  return instruction;
};

export function execNextInstruction(ctx: InstructionCtx) {
  const instruction = nextInstruction(ctx);

  console.log(
    "Executing instruction",
    instruction[0],
    " at ",
    (regs.readPair(RegisterPair.PC) - 1).toString(16)
  );

  return instruction[1](ctx);
}
