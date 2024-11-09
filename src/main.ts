import { Cpu, Register } from "./cpu";
import { InterruptController } from "./hw/interrupt-controller";
import { PPU } from "./hw/ppu";
import { Memory } from "./memory";
import { Timer } from "./hw/timer";
import { OAM } from "./hw/oam";
import { Cartridge } from "./cartridge";
import { ActionButton, DirectionButton, Joypad } from "./hw/joypad";

import "./style.css";
import { LCD } from "./hw/lcd";

const canvas = document.createElement("canvas");
canvas.width = 160 * 2;
canvas.height = 144 * 2;
canvas.style.margin = "0 0 32px";
canvas.style.border = "1px solid gray";
const context = canvas.getContext("2d")!;

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
canvas2.style.visibility = "hidden";
// const context2 = canvas2.getContext("2d")!;

interface Emulator {
  cpu: Cpu;
  oam: OAM;
  timer: Timer;
  interruptController: InterruptController;
  ppu: PPU;
}

let current: Emulator | null = null;

const joypad = new Joypad();

window.addEventListener(
  "keydown",
  (e) => {
    switch (e.code) {
      case "KeyZ":
        joypad.pressActionButton(ActionButton.A);
        break;
      case "KeyX":
        joypad.pressActionButton(ActionButton.B);
        break;
      case "Space":
        joypad.pressActionButton(ActionButton.Select);
        break;
      case "Enter":
        joypad.pressActionButton(ActionButton.Start);
        break;
      case "ArrowUp":
        joypad.pressDirectionButton(DirectionButton.Up);
        break;
      case "ArrowDown":
        joypad.pressDirectionButton(DirectionButton.Down);
        break;
      case "ArrowLeft":
        joypad.pressDirectionButton(DirectionButton.Left);
        break;
      case "ArrowRight":
        joypad.pressDirectionButton(DirectionButton.Right);
        break;
    }
  },
  false
);

window.addEventListener(
  "keyup",
  (e) => {
    switch (e.code) {
      case "KeyZ":
        joypad.releaseActionButton(ActionButton.A);
        break;
      case "KeyX":
        joypad.releaseActionButton(ActionButton.B);
        break;
      case "Space":
        joypad.releaseActionButton(ActionButton.Select);
        break;
      case "Enter":
        joypad.releaseActionButton(ActionButton.Start);
        break;
      case "ArrowUp":
        joypad.releaseDirectionButton(DirectionButton.Up);
        break;
      case "ArrowDown":
        joypad.releaseDirectionButton(DirectionButton.Down);
        break;
      case "ArrowLeft":
        joypad.releaseDirectionButton(DirectionButton.Left);
        break;
      case "ArrowRight":
        joypad.releaseDirectionButton(DirectionButton.Right);
        break;
    }
  },
  false
);

let timeout = 0;

let stepCount = 0;
let minTime = Number.MAX_VALUE;
let maxTime = Number.MIN_VALUE;
let totalTime = 0;

async function run({ cpu }: Emulator) {
  (fileSelector as HTMLInputElement).disabled = true;

  timeout = setInterval(() => {
    const start = performance.now();

    cpu.resetCycle();

    while (cpu.getElapsedCycles() < 17477) {
      if (cpu.isStopped()) {
        clearInterval(timeout);
        console.log("STOPPED");
        return;
      }

      cpu.step();
    }

    const time = performance.now() - start;

    minTime = Math.min(time, minTime);
    maxTime = Math.max(time, maxTime);
    totalTime += time;
    stepCount += 1;

    if (stepCount % 100 === 0) {
      console.log(
        `avg = ${format(totalTime / stepCount)}, min = ${format(
          minTime
        )}, max = ${format(maxTime)}`
      );
    }
  }, 16);

  //cpu.writeRegisterPair(RegisterPair.PC, 0x100);
}

function format(time: number) {
  return time.toFixed(3);
}

async function readImage(file: File) {
  if (current) {
    current.cpu.stop();
    clearInterval(timeout);
  }

  const buffer = await file.arrayBuffer();

  const cartridge = new Cartridge(buffer);

  const interruptController = new InterruptController();

  const oam = new OAM({
    readCallback: (address): number => memory.readDMA(address),
  });

  const ppu = new PPU(
    new LCD(context),
    // context2,
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

  const memory = new Memory(
    ppu,
    interruptController,
    timer,
    cartridge.getMBC(),
    oam,
    joypad
  );

  const cpu = new Cpu(memory, interruptController, () => {
    for (let i = 0; i < 4; i++) {
      oam.tick();
      timer.tick();
      ppu.tick();
    }
  });

  current = {
    interruptController,
    oam,
    ppu,
    cpu,
    timer,
  };

  const type = cartridge.getType();
  const typeName = cartridgeTypes[type];

  if (!typeName) {
    throw new Error("Unsupported cartridge type " + type);
  }

  console.log(`Title: ${cartridge.getTitle()}`);
  console.log(`Type: ${typeName}`);
  console.log(`ROM Size: ${cartridge.getROMSize()}`);

  cpu.writeRegister(Register.A, 0x01);
  cpu.writeRegister(Register.B, 0xff);
  cpu.writeRegister(Register.C, 0x13);
  cpu.writeRegister(Register.D, 0x00);

  run(current);
}

const app = document.getElementById("app");
if (app != null) {
  app.insertBefore(canvas, app.firstChild);
  app.appendChild(canvas2);
}

const fileSelector = document.getElementById("file-selector");
if (fileSelector != null) {
  fileSelector.addEventListener("change", (event) => {
    const fileList = (event.target as HTMLInputElement).files!;
    readImage(fileList[0]);
  });
}
