import * as Memory from "./memory";

type Register8 = "A" | "B" | "C" | "D" | "E" | "H" | "L";
type RegisterPair = "BC" | "DE" | "HL";

type Register = Register8 | RegisterPair;

const cpu = {
  interruptsEnabled: false,
};

let arg = 0;

const registers = {
  a: 0,
  f: {
    z: 0,
    n: 0,
    h: 0,
    cy: 0,
  },
  b: 0,
  c: 0,
  d: 0,
  e: 0,
  h: 0,
  l: 0,

  sp: 0,
  pc: 0,
};

const readReg8 = (register: Register8) => {
  switch (register) {
    case "A":
      return registers.a;
    case "B":
      return registers.b;
    case "C":
      return registers.c;
    case "D":
      return registers.d;
    case "E":
      return registers.e;
    case "H":
      return registers.h;
    case "L":
      return registers.l;
  }
};

const writeReg8 = (register: Register8, value: number) => {
  switch (register) {
    case "A":
      registers.a = value;
      break;
    case "B":
      registers.b = value;
      break;
    case "C":
      registers.c = value;
      break;
    case "D":
      registers.d = value;
      break;
    case "E":
      registers.e = value;
      break;
    case "H":
      registers.h = value;
      break;
    case "L":
      registers.l = value;
      break;
  }
};

const readReg16 = (reg1: Register8, reg2: Register8) => {
  return (readReg8(reg1) << 8) | readReg8(reg2);
};

const writeReg16 = (reg1: Register8, reg2: Register8, value: number) => {
  writeReg8(reg1, (value >> 8) & 0xff);
  writeReg8(reg2, value & 0xff);
};

const readReg = (operand: Register) => {
  switch (operand) {
    case "BC":
      return readReg16("B", "C");
    case "DE":
      return readReg16("D", "E");
    case "HL":
      return readReg16("H", "L");
    default:
      return readReg8(operand);
  }
};

const writeReg = (operand: Register, value: number) => {
  switch (operand) {
    case "BC":
      writeReg16("B", "C", value);
      break;
    case "DE":
      writeReg16("D", "E", value);
      break;
    case "HL":
      writeReg16("H", "L", value);
      break;
    default:
      writeReg8(operand, value);
      break;
  }
};

const incReg8 = (register: Register8) => {
  writeReg8(register, (readReg8(register) + 1) % 256);
};

const decReg8 = (register: Register8) => {
  writeReg8(register, (256 + readReg8(register) - 1) % 256);
};

const incReg16 = (register: RegisterPair) => {
  writeReg(register, (readReg(register) + 1) % 65536);
};

const decReg16 = (register: RegisterPair) => {
  writeReg(register, (65536 + readReg(register) - 1) % 65536);
};

const fetchA8 = () => {
  return Memory.read(registers.pc++);
};

const fetchA16 = () => {
  let lo = Memory.read(registers.pc++);
  let hi = Memory.read(registers.pc++);
  return (hi << 8) + lo;
};

type Instruction = () => number;

// Loads the contents of a register into a register
const loadRegIntoReg = (dst: Register8, src: Register8) => () => {
  console.log(`${dst} <- ${src}`);
  writeReg8(dst, readReg8(src));
  return 4;
};

// Loads 8-bit immediate data into a register
const loadDataIntoReg = (dst: Register8) => () => {
  arg = fetchA8();
  console.log(`${dst} <- ${arg.toString(16)}`);
  writeReg(dst, arg);
  return 8;
};

// Loads into a register the contents of the internal RAM, port register, or
// mode register at the address in the range FF00h-FFFFh specified by a register
const loadRegMemoryIntoReg = (dst: Register8, src: Register8) => () => {
  console.log(`${dst} <- (0xFF00 + ${src})`);
  writeReg(dst, Memory.read(0xff00 + readReg(src)));
  return 8;
};

// Loads the contents of memory (8 bits) specified by register pair into a
// register
const loadRegPairMemoryIntoReg = (dst: Register8, src: RegisterPair) => () => {
  console.log(`${dst} <- (${src})`);
  writeReg(dst, Memory.read(readReg(src)));
  return 8;
};

// Loads in a register the contents of memory specified by the contents of a
// register pair and simultaneously increments the contents of HL
const loadRegPairMemoryIntoRegIncrement =
  (dst: Register8, src: RegisterPair) => () => {
    console.log(`${dst} <- (${src})`);
    console.log(`${src} <- ${src}+1`);
    writeReg(dst, Memory.read(readReg(src)));
    incReg16(src);
    return 8;
  };

// Loads in a register the contents of memory specified by the contents of a
// register pair and simultaneously decrements the contents of HL
const loadRegPairMemoryIntoRegDecrement =
  (dst: Register8, src: RegisterPair) => () => {
    console.log(`${dst} <- (${src})`);
    console.log(`${src} <- ${src}-1`);
    writeReg(dst, Memory.read(readReg(src)));
    decReg16(src);
    return 8;
  };

// Loads the contents of a register in the internal RAM, port register, or mode
// register at the address in the range FF00h-FFFFh specified by a register
const loadRegIntoRegMemory = (dst: Register8, src: Register8) => () => {
  console.log(`(0xFF + ${dst}) <- ${src}`);
  Memory.write(0xff00 + readReg(dst), readReg(src));
  return 8;
};

// Stores the contents of a register in memory specified by register pair
const loadRegIntoRegPairMemory = (dst: RegisterPair, src: Register8) => () => {
  console.log(`(${dst}) <- ${src}`);
  Memory.write(readReg(dst), readReg(src));
  return 8;
};

// Stores the contents of register A in the memory specified by register pair
// HL and simultaneously increments the contents of HL
const loadRegIntoRegPairMemoryIncrement =
  (dst: RegisterPair, src: Register8) => () => {
    console.log(`(${dst}) <- ${src}`);
    console.log(`${dst} <- ${dst}+1`);
    Memory.write(readReg(dst), readReg(src));
    incReg16(dst);
    return 8;
  };

// Stores the contents of register A in the memory specified by register pair
// HL and simultaneously decrements the contents of HL
const loadRegIntoRegPairMemoryDecrement =
  (dst: RegisterPair, src: Register8) => () => {
    console.log(`(${dst}) <- ${src}`);
    console.log(`${dst} <- ${dst}-1`);
    Memory.write(readReg(dst), readReg(src));
    decReg16(dst);
    return 8;
  };

// Loads 8-bit immediate data into memory specified by register pair HL
const loadDataIntoHLMemory = () => {
  arg = fetchA8();
  console.log(`HL <- ${arg.toString(16)}`);
  Memory.write(readReg("HL"), arg);
  return 12;
};

// Loads into a register the contents of the internal RAM, port register, or
// mode register at the address in the range FF00h-FFFFh specified by the 8-bit
// immediate operand
const loadMemory8IntoReg = (dst: Register8) => () => {
  arg = fetchA8();
  writeReg(dst, Memory.read(0xff00 + arg));
  return 12;
};

// Loads the contents of a register to the internal RAM, port register, or mode
// register at the address in the range FF00h-FFFFh specified by the 8-bit
// immediate operand
const loadRegIntoMemory8 = (src: Register8) => () => {
  arg = fetchA8();
  Memory.write(0xff00 + arg, readReg(src));
  return 12;
};

// Loads into a register the contents of the internal RAM or register specified
// by 16-bit immediate operand
const loadMemory16IntoReg = (dst: Register8) => () => {
  arg = fetchA16();
  writeReg(dst, Memory.read(arg));
  return 16;
};

// Loads the contents of a register to the internal RAM or register specified by
// 16-bit immediate operand
const loadRegIntoMemory16 = (src: Register8) => () => {
  arg = fetchA16();
  Memory.write(arg, readReg(src));
  return 16;
};

const nop = () => {
  console.log("NOP");
  return 4;
};

const instructions: Partial<Record<number, Instruction>> = {
  // NOP
  0x00: nop,
  // LD BC,d16
  0x01: () => {
    arg = fetchA16();
    console.log(`BC <- ${arg.toString(16)}`);
    writeReg("BC", arg);
    return 12;
  },
  // LD (BC),A
  0x02: loadRegIntoRegPairMemory("BC", "A"),
  // LD B,d8
  0x06: loadDataIntoReg("B"),
  // LD A,(BC)
  0x0a: loadRegPairMemoryIntoReg("A", "BC"),
  // LD C,d8
  0x0e: loadDataIntoReg("C"),

  // LD (DE),A
  0x12: loadRegIntoRegPairMemory("DE", "A"),
  // LD D,d8
  0x16: loadDataIntoReg("D"),
  // LD A,(DE)
  0x1a: loadRegPairMemoryIntoReg("A", "DE"),
  // LD E,d8
  0x1e: loadDataIntoReg("E"),

  // LD HL,d16
  0x21: () => {
    arg = fetchA16();
    console.log(`HL <- ${arg.toString(16)}`);
    writeReg("HL", arg);
    return 12;
  },
  // LD (HL+),A
  0x22: loadRegIntoRegPairMemoryIncrement("HL", "A"),
  // LD H,d8
  0x26: loadDataIntoReg("H"),
  // LD A,(HL+)
  0x2a: loadRegPairMemoryIntoRegIncrement("A", "HL"),
  // LD L,d8
  0x2e: loadDataIntoReg("L"),

  // LD SP,d16
  0x31: () => {
    arg = fetchA16();
    console.log(`SP <- ${arg.toString(16)}`);
    registers.sp = arg;
    return 12;
  },
  // LD (HL-),A
  0x32: loadRegIntoRegPairMemoryDecrement("HL", "A"),
  // LD (HL),d8
  0x36: loadDataIntoHLMemory,
  // LD A,(HL-)
  0x3a: loadRegPairMemoryIntoRegDecrement("A", "HL"),
  // LD A,d8
  0x3e: loadDataIntoReg("A"),

  // LD B,B
  0x40: loadRegIntoReg("B", "B"),
  // LD B,C
  0x41: loadRegIntoReg("B", "C"),
  // LD B,D
  0x42: loadRegIntoReg("B", "D"),
  // LD B,E
  0x43: loadRegIntoReg("B", "E"),
  // LD B,H
  0x44: loadRegIntoReg("B", "H"),
  // LD B,L
  0x45: loadRegIntoReg("B", "L"),
  // LD B,(HL)
  0x46: loadRegPairMemoryIntoReg("B", "HL"),
  // LD B,L
  0x47: loadRegIntoReg("B", "A"),
  // LD C,B
  0x48: loadRegIntoReg("C", "B"),
  // LD C,C
  0x49: loadRegIntoReg("C", "C"),
  // LD C,D
  0x4a: loadRegIntoReg("C", "D"),
  // LD C,E
  0x4b: loadRegIntoReg("C", "E"),
  // LD C,H
  0x4c: loadRegIntoReg("C", "H"),
  // LD C,L
  0x4d: loadRegIntoReg("C", "L"),
  // LD C,(HL)
  0x4e: loadRegPairMemoryIntoReg("C", "HL"),
  // LD C,A
  0x4f: loadRegIntoReg("C", "A"),

  // LD D,B
  0x50: loadRegIntoReg("D", "B"),
  // LD D,C
  0x51: loadRegIntoReg("D", "C"),
  // LD D,D
  0x52: loadRegIntoReg("D", "D"),
  // LD D,E
  0x53: loadRegIntoReg("D", "E"),
  // LD D,H
  0x54: loadRegIntoReg("D", "H"),
  // LD D,L
  0x55: loadRegIntoReg("D", "L"),
  // LD D,(HL)
  0x56: loadRegPairMemoryIntoReg("D", "HL"),
  // LD D,A
  0x57: loadRegIntoReg("D", "A"),
  // LD E,B
  0x58: loadRegIntoReg("E", "B"),
  // LD E,C
  0x59: loadRegIntoReg("E", "C"),
  // LD E,D
  0x5a: loadRegIntoReg("E", "D"),
  // LD E,E
  0x5b: loadRegIntoReg("E", "E"),
  // LD E,H
  0x5c: loadRegIntoReg("E", "H"),
  // LD E,L
  0x5d: loadRegIntoReg("E", "L"),
  // LD E,(HL)
  0x5e: loadRegPairMemoryIntoReg("E", "HL"),
  // LD E,A
  0x5f: loadRegIntoReg("E", "A"),

  // LD H,B
  0x60: loadRegIntoReg("H", "B"),
  // LD H,C
  0x61: loadRegIntoReg("H", "C"),
  // LD H,D
  0x62: loadRegIntoReg("H", "D"),
  // LD H,E
  0x63: loadRegIntoReg("H", "E"),
  // LD H,H
  0x64: loadRegIntoReg("H", "H"),
  // LD H,L
  0x65: loadRegIntoReg("H", "L"),
  // LD H,(HL)
  0x66: loadRegPairMemoryIntoReg("H", "HL"),
  // LD H,A
  0x67: loadRegIntoReg("H", "A"),
  // LD L,B
  0x68: loadRegIntoReg("L", "B"),
  // LD L,C
  0x69: loadRegIntoReg("L", "C"),
  // LD L,D
  0x6a: loadRegIntoReg("L", "D"),
  // LD L,E
  0x6b: loadRegIntoReg("L", "E"),
  // LD L,H
  0x6c: loadRegIntoReg("L", "H"),
  // LD L,L
  0x6d: loadRegIntoReg("L", "L"),
  // LD L,(HL)
  0x6e: loadRegPairMemoryIntoReg("L", "HL"),
  // LD L,A
  0x6f: loadRegIntoReg("L", "A"),

  // LD (HL),B
  0x70: loadRegIntoRegPairMemory("HL", "B"),
  // LD (HL),C
  0x71: loadRegIntoRegPairMemory("HL", "C"),
  // LD (HL),D
  0x72: loadRegIntoRegPairMemory("HL", "D"),
  // LD (HL),E
  0x73: loadRegIntoRegPairMemory("HL", "E"),
  // LD (HL),H
  0x74: loadRegIntoRegPairMemory("HL", "H"),
  // LD (HL),L
  0x75: loadRegIntoRegPairMemory("HL", "L"),
  // 0x76
  // LD (HL),A
  0x77: loadRegIntoRegPairMemory("HL", "A"),
  // LD A,B
  0x78: loadRegIntoReg("A", "B"),
  // LD A,C
  0x79: loadRegIntoReg("A", "C"),
  // LD A,D
  0x7a: loadRegIntoReg("A", "D"),
  // LD A,E
  0x7b: loadRegIntoReg("A", "E"),
  // LD A,H
  0x7c: loadRegIntoReg("A", "H"),
  // LD A,L
  0x7d: loadRegIntoReg("A", "L"),
  // LD A,(HL)
  0x7e: loadRegPairMemoryIntoReg("A", "HL"),
  // LD A,A
  0x7f: loadRegIntoReg("A", "A"),

  // JP a16
  0xc3: () => {
    arg = fetchA16();
    console.log(`JP ${arg.toString(16)}`);
    registers.pc = arg;
    return 16;
  },
  // CALL a16
  0xcd: () => {
    arg = fetchA16();
    console.log(`CALL ${arg.toString(16)}`);
    Memory.write(registers.sp - 1, (registers.pc >> 8) & 0xff);
    Memory.write(registers.sp - 2, registers.pc & 0xff);
    registers.pc = arg;
    registers.sp -= 2;
    return 24;
  },

  // LDH (a8),A
  0xe0: loadRegIntoMemory8("A"),
  // LD (C),A
  0xe2: loadRegIntoRegMemory("C", "A"),
  // LD (a16),A
  0xea: loadRegIntoMemory16("A"),

  // LDH (a8),A
  0xf0: loadMemory8IntoReg("A"),
  // LD A,(C)
  0xf2: loadRegMemoryIntoReg("A", "C"),
  // DI
  0xf3: () => {
    console.log("DI");
    cpu.interruptsEnabled = false;
    return 4;
  },
  // LD (a16),A
  0xfa: loadMemory16IntoReg("A"),
  // EI
  0xfb: () => {
    console.log("EI");
    cpu.interruptsEnabled = true;
    return 4;
  },
};

const run = () => {
  let cycles = 0;

  while (true) {
    const opcode = Memory.read(registers.pc++);

    const instruction = instructions[opcode];
    if (!instruction) {
      throw new Error(`Invalid opcode ${opcode.toString(16)}`);
    }

    cycles += instruction();
  }
};

const logoBytes = [
  0xce, 0xed, 0x66, 0x66, 0xcc, 0x0d, 0x00, 0x0b, 0x03, 0x73, 0x00, 0x83, 0x00,
  0x0c, 0x00, 0x0d, 0x00, 0x08, 0x11, 0x1f, 0x88, 0x89, 0x00, 0x0e, 0xdc, 0xcc,
  0x6e, 0xe6, 0xdd, 0xdd, 0xd9, 0x99, 0xbb, 0xbb, 0x67, 0x63, 0x6e, 0x0e, 0xec,
  0xcc, 0xdd, 0xdc, 0x99, 0x9f, 0xbb, 0xb9, 0x33, 0x3e,
];

const cartridgeTypes: Partial<Record<number, string>> = {
  [0x00]: "ROM ONLY",
  [0x01]: "MBC1",
  [0x02]: "MBC1+RAM",
  [0x03]: "MBC1+RAM+BATTERY",
  [0x05]: "MBC2",
  [0x06]: "MBC2+BATTERY",
  [0x08]: "ROM+RAM 9",
  [0x09]: "ROM+RAM+BATTERY 9",
  [0x0b]: "MMM01",
  [0x0c]: "MMM01+RAM",
  [0x0d]: "MMM01+RAM+BATTERY",
  [0x0f]: "MBC3+TIMER+BATTERY",
  [0x10]: "MBC3+TIMER+RAM+BATTERY 10",
  [0x11]: "MBC3",
  [0x12]: "MBC3+RAM 10",
  [0x13]: "MBC3+RAM+BATTERY 10",
  [0x19]: "MBC5",
  [0x1a]: "MBC5+RAM",
  [0x1b]: "MBC5+RAM+BATTERY",
  [0x1c]: "MBC5+RUMBLE",
  [0x1d]: "MBC5+RUMBLE+RAM",
  [0x1e]: "MBC5+RUMBLE+RAM+BATTERY",
  [0x20]: "MBC6",
  [0x22]: "MBC7+SENSOR+RUMBLE+RAM+BATTERY",
  [0xfc]: "POCKET CAMERA",
  [0xfd]: "BANDAI TAMA5",
  [0xfe]: "HuC3",
  [0xff]: "HuC1+RAM+BATTERY",
};

const LOGO_BASE = 0x0104;
const LOGO_END = 0x0134;
const TYPE = 0x0147;
const ROM_SIZE = 0x0148;

async function readImage(file: File) {
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);

  const logoData = data.slice(LOGO_BASE, LOGO_END);

  displayLogo(logoData);

  logoBytes.forEach((byte, i) => {
    if (logoData[i] !== byte) {
      throw new Error("Invalid logo");
    }
  });

  const title = String.fromCharCode(...data.slice(0x0134, 0x143));

  const type = data[TYPE];
  const typeName = cartridgeTypes[type];

  if (!typeName) {
    throw new Error("Unsupported cartridge type " + type);
  }

  console.log(`Title: ${title}`);
  console.log(`Type: ${typeName}`);

  const romSize = 32 * 1024 * (1 << data[ROM_SIZE]);
  if (romSize !== data.length) {
    throw new Error("Bad ROM size");
  }

  console.log(romSize);

  for (let i = 0; i < romSize; i++) {
    Memory.write(i, data[i]);
  }

  registers.pc = 0x100;
  run();
}

const displayLogo = (bytes: Uint8Array) => {
  for (let i = 0; i < 24; i++) {
    const byte = bytes[i];

    for (let j = 0; j < 8; j++) {
      const x = 56 + Math.floor(i / 2) * 4 + (j % 4);
      const y = 68 + (i % 2) * 2 + Math.floor(j / 4);

      if (byte & (1 << (7 - j))) {
        context.fillRect(x * 2, y * 2, 2, 2);
      }
    }
  }

  for (let i = 24; i < 48; i++) {
    const byte = bytes[i];

    for (let j = 0; j < 8; j++) {
      const x = 56 + Math.floor((i - 24) / 2) * 4 + (j % 4);
      const y = 68 + 4 + (i % 2) * 2 + Math.floor(j / 4);

      if (byte & (1 << (7 - j))) {
        context.fillRect(x * 2, y * 2, 2, 2);
      }
    }
  }
};

const canvas = document.createElement("canvas");
canvas.width = 160 * 2;
canvas.height = 144 * 2;
canvas.style.margin = "20px auto";
canvas.style.border = "1px solid gray";
const context = canvas.getContext("2d")!;

const app = document.getElementById("app");
if (app != null) {
  app.appendChild(canvas);
}

const fileSelector = document.getElementById("file-selector");
if (fileSelector != null) {
  fileSelector.addEventListener("change", (event) => {
    const fileList = (event.target as HTMLInputElement).files!;
    readImage(fileList[0]);
  });
}
