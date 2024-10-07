import { Timer, TimerRegister } from "./timer";
import {
  interruptController,
  InterruptControllerRegister,
} from "./interrupt-controller";

let vbank = 0;

let buf = "";

export const timer = new Timer(interruptController);

export interface IMemory {
  read(address: number): number;
  write(address: number, data: number): void;
}

export class Memory implements IMemory {
  private ram = new Uint8Array(0x10000);

  public reset() {
    this.ram = new Uint8Array(0x10000);
  }

  public read(address: number) {
    switch (address) {
      case 0xff04:
        return timer.read(TimerRegister.DIV);
      case 0xff05:
        return timer.read(TimerRegister.TIMA);
      case 0xff06:
        return timer.read(TimerRegister.TMA);
      case 0xff07:
        return timer.read(TimerRegister.TAC);
      case 0xff0f:
        return interruptController.readRegister(InterruptControllerRegister.IF);
      case 0xffff:
        return interruptController.readRegister(InterruptControllerRegister.IE);
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
      case 0xff04:
        timer.write(TimerRegister.DIV, data);
        break;
      case 0xff05:
        timer.write(TimerRegister.TIMA, data);
        break;
      case 0xff06:
        timer.write(TimerRegister.TMA, data);
        break;
      case 0xff07:
        timer.write(TimerRegister.TAC, data);
        break;
      case 0xff0f:
        interruptController.writeRegister(InterruptControllerRegister.IF, data);
        break;
      case 0xffff:
        interruptController.writeRegister(InterruptControllerRegister.IE, data);
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
