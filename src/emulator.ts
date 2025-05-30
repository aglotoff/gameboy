import { Cpu, Register } from "./cpu";
import { InterruptController } from "./hw/interrupt-controller";
import { ILCD, PPU, OAM } from "./hw/graphics";
import { Memory } from "./memory";
import { Timer, TimerRegisters } from "./hw/timer";
import { Cartridge } from "./cartridge";
import { ActionButton, DirectionButton, Joypad } from "./hw/joypad";
import { APU } from "./hw/audio";
import { SystemCounter } from "./hw/system-counter";
import { WebAudio } from "./audio";
import { PulseChannel } from "./hw/audio/pulse-channel";
import { WaveChannel } from "./hw/audio/wave-channel";
import { NoiseChannel } from "./hw/audio/noise-channel";
import { APURegisters } from "./hw/audio/apu-registers";
import { APUChannels } from "./hw/audio/apu";
import { VRAM } from "./hw/graphics/vram";
import { Serial } from "./hw/serial";
import { EmulatorType } from "./types";
import bootRoms from "./boot-roms";

export enum InterruptSource {
  VBlank = 0,
  LCD = 1,
  Timer = 2,
  Serial = 3,
  Joypad = 4,
}

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

let buf = "";

export class Emulator {
  private cpu: Cpu;
  private interruptController: InterruptController;
  private oam: OAM;
  private vram: VRAM;
  private timer: Timer;
  private ppu: PPU;
  private apu: APU;
  private memory: Memory;
  private joypad: Joypad;
  private systemCounter: SystemCounter;
  private serial: Serial;

  public constructor(type: EmulatorType, lcd: ILCD) {
    this.interruptController = new InterruptController();

    this.oam = new OAM({
      readCallback: (address): number => this.memory.readDMA(address),
    });

    this.vram = new VRAM();

    this.ppu = new PPU(
      lcd,
      this.oam,
      this.vram,
      () => {
        this.interruptController.requestInterrupt(InterruptSource.VBlank);
      },
      () => {
        this.interruptController.requestInterrupt(InterruptSource.LCD);
      }
    );

    this.systemCounter = new SystemCounter();

    this.timer = new Timer(this.systemCounter, () => {
      this.interruptController.requestInterrupt(InterruptSource.Timer);
    });

    const audio = new WebAudio();

    const channels: APUChannels = [
      new PulseChannel(audio.channel1),
      new PulseChannel(audio.channel2, 64, true),
      new WaveChannel(audio.channel3),
      new NoiseChannel(audio.channel4),
    ];

    this.apu = new APU(this.systemCounter, audio, channels);

    const apuRegs = new APURegisters(this.apu, channels);

    this.joypad = new Joypad(() =>
      this.interruptController.requestInterrupt(InterruptSource.Joypad)
    );

    this.serial = new Serial(this.systemCounter, (data) => {
      if (data == 10) {
        if (buf.length > 0) {
          console.log(buf);
        }
        buf = "";
      } else {
        buf += String.fromCharCode(data);
      }

      this.interruptController.requestInterrupt(InterruptSource.Serial);

      return 0;
    });

    this.memory = new Memory(
      this.ppu,
      this.interruptController,
      new TimerRegisters(this.timer),
      this.oam,
      this.vram,
      this.joypad,
      apuRegs,
      this.systemCounter,
      this.serial,
      bootRoms[type]
    );

    this.cpu = new Cpu(this.memory, this.interruptController, () =>
      this.mCycle()
    );
  }

  private mCycle() {
    for (let i = 0; i < 4; i++) {
      this.systemCounter.tick();
      this.timer.tick();
      this.oam.tick();
      this.ppu.tick();
      this.apu.tick();
      this.serial.tick();
    }
  }

  private timeout = 0;
  private stepCount = 0;
  private minTime = Number.MAX_VALUE;
  private maxTime = Number.MIN_VALUE;
  private totalTime = 0;

  async run(cartridge: Cartridge) {
    this.memory.setMBC(cartridge.getMBC());

    const type = cartridge.getType();
    const typeName = cartridgeTypes[type];

    if (!typeName) {
      throw new Error("Unsupported cartridge type " + type);
    }

    console.log(`Title: ${cartridge.getTitle()}`);
    console.log(`Type: ${typeName}`);
    console.log(`ROM Size: ${cartridge.getROMSize()}`);

    this.cpu.writeRegister(Register.A, 0x01);
    this.cpu.writeRegister(Register.B, 0xff);
    this.cpu.writeRegister(Register.C, 0x13);
    this.cpu.writeRegister(Register.D, 0x00);

    this.timeout = setInterval(() => {
      const start = performance.now();

      this.cpu.resetCycle();

      while (this.cpu.getElapsedCycles() <= 17477) {
        if (this.cpu.isStopped()) {
          clearInterval(this.timeout);
          console.log("STOPPED");
          return;
        }

        this.cpu.step();
      }

      const time = performance.now() - start;

      this.minTime = Math.min(time, this.minTime);
      this.maxTime = Math.max(time, this.maxTime);
      this.totalTime += time;
      this.stepCount += 1;

      if (this.stepCount % 100 === 0) {
        console.log(
          `avg = ${format(this.totalTime / this.stepCount)}, min = ${format(
            this.minTime
          )}, max = ${format(this.maxTime)}`
        );
      }
    }, 16);
  }

  public destroy() {
    this.apu.destroy();
    clearInterval(this.timeout);
  }

  public pressActionButton(i: ActionButton) {
    this.joypad.pressActionButton(i);
  }

  public releaseActionButton(i: ActionButton) {
    this.joypad.releaseActionButton(i);
  }

  public pressDirectionButton(i: DirectionButton) {
    this.joypad.pressDirectionButton(i);
  }

  public releaseDirectionButton(i: DirectionButton) {
    this.joypad.releaseDirectionButton(i);
  }
}

function format(time: number) {
  return time.toFixed(3);
}
