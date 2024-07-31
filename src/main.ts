import { readRegister, writeRegister } from "./cpu";
import { nextInstruction } from "./instructions";
import * as Memory from "./memory";

const run = () => {
  let cycles = 0;

  while (true) {
    const instruction = nextInstruction();

    console.log(
      "Executing instruction",
      instruction[0],
      " at ",
      (readRegister("PC") - 1).toString(16)
    );

    cycles += instruction[1]();
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

  for (let i = 0; i < Math.min(0x8000, romSize); i++) {
    Memory.write(i, data[i]);
  }

  writeRegister("PC", 0x100);
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
