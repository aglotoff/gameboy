import { Timer } from "./timer";
import { interruptController } from "./interrupt-controller";

let vbank = 0;

let buf = "";

export enum InterruptSource {
  VBlank = 0,
  LCD = 1,
  Timer = 2,
  Serial = 3,
  Joypad = 4,
}

export const timer = new Timer(() => {
  interruptController.requestInterrupt(InterruptSource.Timer);
});

export interface IMemory {
  read(address: number): number;
  write(address: number, data: number): void;
}

export enum HWRegister {
  DIV = 0xff04,
  TIMA = 0xff05,
  TMA = 0xff06,
  TAC = 0xff07,
  IF = 0xff0f,
  IE = 0xffff,
}

export class Memory implements IMemory {
  private ram = new Uint8Array(0x10000);

  public reset() {
    this.ram = new Uint8Array(0x10000);
  }

  public read(address: number) {
    switch (address) {
      case HWRegister.DIV:
        return timer.getDividerRegister();
      case HWRegister.TIMA:
        return timer.getCounterRegister();
      case HWRegister.TMA:
        return timer.getModuloRegister();
      case HWRegister.TAC:
        return timer.getControlRegister();
      case HWRegister.IF:
        return interruptController.getFlagRegister();
      case HWRegister.IE:
        return interruptController.getEnableRegister();
    }

    if (address === 0xff44) {
      let r = vbank;
      vbank = (vbank + 1) % 154;
      return r;
    }

    return this.ram[address];
  }

  public write(address: number, data: number) {
    switch (address) {
      case HWRegister.DIV:
        timer.setDividerRegister(data);
        break;
      case HWRegister.TIMA:
        timer.setCounterRegister(data);
        break;
      case HWRegister.TMA:
        timer.setModuloRegister(data);
        break;
      case HWRegister.TAC:
        timer.setControlRegister(data);
        break;
      case HWRegister.IF:
        interruptController.setFlagRegister(data);
        break;
      case HWRegister.IE:
        interruptController.setEnableRegister(data);
        break;
    }

    if (address === 0xff01) {
      if (data == 10) {
        console.log(buf);
        buf = "";
      }
      buf += String.fromCharCode(data);
    }

    this.ram[address] = data;
  }
}

export const memory = new Memory();
