type Register8 = "A" | "B" | "C" | "D" | "E" | "H" | "L";
type Register16 = "BC" | "DE" | "HL";

type Register = Register8 | Register16;
type Address = "(a16)" | ;
type SourceOperand = Register | Address;
type TargetOperand = Register | Address;

const ram = new Uint8Array(0x10000);

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

const read = (operand: SourceOperand) => {
  switch (operand) {
    case "BC":
      return readReg16("B", "C");
    case "DE":
      return readReg16("D", "E");
    case "HL":
      return readReg16("H", "L");
    case "(a16)":
      return readBus(arg);
    default:
      return readReg8(operand);
  }
};

const write = (operand: TargetOperand, value: number) => {
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
    case "(a16)":
      writeBus(arg, value);
      break;
    default:
      writeReg8(operand, value);
      break;
  }
};

const readBus = (address: number) => ram[address];

const writeBus = (address: number, data: number) => {
  ram[address] = data;
};

const fetchA8 = () => {
  return readBus(registers.pc++);
};

const fetchA16 = () => {
  let lo = readBus(registers.pc++);
  let hi = readBus(registers.pc++);
  return (hi << 8) + lo;
};

const run = () => {
  while (true) {
    const opcode = readBus(registers.pc++);

    switch (opcode) {
      case 0x00: // NOP
        break;

      case 0x21: // LD HL,d16
        arg = fetchA16();
        write("HL", arg);
        break;

      case 0x31: // LD SP,d16
        arg = fetchA16();
        registers.sp = arg;
        break;
      case 0x3e: // LD A,d8
        arg = fetchA8();
        write("A", arg);
        break;

      case 0x7c: // LD A,H
        write("A", read("H"));
        break;
      case 0x7d: // LD A,L
        write("A", read("L"));
        break;

      case 0xc3: // JP a16
        arg = fetchA16();
        registers.pc = arg;
        break;
      case 0xcd: // CALL a16
        arg = fetchA16();
        writeBus(registers.sp - 1, (registers.pc >> 8) & 0xff);
        writeBus(registers.sp - 2, registers.pc & 0xff);
        registers.pc = arg;
        registers.sp -= 2;
        break;

      case 0xe0: // LDH (a8),A
        arg = fetchA8();
        writeBus(0xff + arg, read("A"));
        break;
      case 0xea: // LD (a16),A
        arg = fetchA16();
        write("(a16)", read("A"));
        break;

      case 0xf3: // DI
        cpu.interruptsEnabled = false;
        break;
      case 0xfb: // EI
        cpu.interruptsEnabled = true;
        break;

      default:
        throw new Error(`Invalid opcode ${opcode.toString(16)}`);
    }
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
    ram[i] = data[i];
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
