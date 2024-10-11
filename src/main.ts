import { Cpu, RegisterPair } from "./cpu";
import { InterruptController } from "./hw/interrupt-controller";
import { LCD } from "./hw/lcd";
import { Memory } from "./memory";
import { Timer } from "./hw/timer";
import { OAM } from "./hw/oam";
import { Cartridge } from "./cartridge";

const canvas = document.createElement("canvas");
canvas.width = 160 * 2;
canvas.height = 144 * 2;
canvas.style.margin = "20px auto";
canvas.style.border = "1px solid gray";
const context = canvas.getContext("2d")!;

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

export enum InterruptSource {
  VBlank = 0,
  LCD = 1,
  Timer = 2,
  Serial = 3,
  Joypad = 4,
}

const canvas2 = document.createElement("canvas");
canvas2.width = 16 * 16;
canvas2.height = 32 * 16;
canvas2.style.position = "fixed";
canvas2.style.top = "10px";
canvas2.style.right = "10px";
canvas2.style.border = "1px solid gray";
const context2 = canvas2.getContext("2d")!;

interface Emulator {
  cpu: Cpu;
  oam: OAM;
  timer: Timer;
  interruptController: InterruptController;
  lcd: LCD;
}

let current: Emulator | null = null;

async function run({ cpu, oam, lcd, timer }: Emulator) {
  let mCycles = 0;

  cpu.writeRegisterPair(RegisterPair.PC, 0x100);

  while (!cpu.isStopped()) {
    let stepMCycles = cpu.step();

    for (let i = 0; i < stepMCycles; i++) {
      oam.tick();
      timer.tick();
      lcd.tick();
    }

    mCycles += stepMCycles;

    if (mCycles > 4194) {
      await new Promise((resolve) => {
        setTimeout(resolve, 4);
      });
      mCycles = 0;
    }
  }

  console.log("STOPPED");
}

async function readImage(file: File) {
  if (current) {
    current.cpu.stop();
  }

  const buffer = await file.arrayBuffer();

  const cartridge = new Cartridge(buffer);

  const interruptController = new InterruptController();

  const oam = new OAM({
    readCallback: (address): number => memory.read(address),
  });

  const lcd = new LCD(
    context,
    context2,
    oam,
    () => {
      interruptController.requestInterrupt(InterruptSource.VBlank);
    },
    () => {
      interruptController.requestInterrupt(InterruptSource.LCD);
    }
  );

  const timer = new Timer(() => {
    interruptController.requestInterrupt(InterruptSource.Timer);
  });

  const memory = new Memory(lcd, interruptController, timer, cartridge, oam);

  const cpu = new Cpu(memory, interruptController);

  current = {
    interruptController,
    oam,
    lcd,
    cpu,
    timer,
  };

  const logoData = cartridge.getLogo();

  displayLogo(logoData);

  logoBytes.forEach((byte, i) => {
    if (logoData[i] !== byte) {
      throw new Error("Invalid logo");
    }
  });

  const type = cartridge.getType();
  const typeName = cartridgeTypes[type];

  if (!typeName) {
    throw new Error("Unsupported cartridge type " + type);
  }

  console.log(`Title: ${cartridge.getTitle()}`);
  console.log(`Type: ${typeName}`);
  console.log(`ROM Size: ${cartridge.getROMSize()}`);

  run(current);
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

const app = document.getElementById("app");
if (app != null) {
  app.appendChild(canvas);
  app.appendChild(canvas2);
}

const fileSelector = document.getElementById("file-selector");
if (fileSelector != null) {
  fileSelector.addEventListener("change", (event) => {
    const fileList = (event.target as HTMLInputElement).files!;
    readImage(fileList[0]);
  });
}
