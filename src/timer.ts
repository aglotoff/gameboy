// const T_CYCLES_PER_SECOND = 4194304;
// const M_CYCLES_PER_SECOND = T_CYCLES_PER_SECOND / 4;
// const M_CYCLES_PER_MS = M_CYCLES_PER_SECOND / 1000;

import { InterruptController, InterruptSource } from "./interrupt-controller";

export enum TimerRegister {
  DIV = 0x00,
  TIMA = 0x01,
  TMA = 0x02,
  TAC = 0x03,
}

export class Timer {
  private tickCount = 0;

  private counter = 0;
  private modulo = 0;
  private control = 0;

  public constructor(private interruptController: InterruptController) {}

  public read(offset: number) {
    switch (offset) {
      case TimerRegister.DIV:
        return 0;
      case TimerRegister.TIMA:
        return this.counter;
      case TimerRegister.TMA:
        return this.modulo;
      case TimerRegister.TAC:
        return this.control;
      default:
        throw new Error(`Invalid offset ${offset}`);
    }
  }

  public write(offset: number, value: number) {
    switch (offset) {
      case TimerRegister.DIV:
        break;
      case TimerRegister.TIMA:
        this.counter = value;
        break;
      case TimerRegister.TMA:
        this.modulo = value;
        break;
      case TimerRegister.TAC:
        this.control = value & 0x7;
        break;
      default:
        throw new Error(`Invalid offset ${offset}`);
    }
  }

  public tick() {
    if (!(this.control & 0x4)) {
      return;
    }

    if (this.tickCount >= this.getFrequency()) {
      if (this.counter == 0xff) {
        this.counter = this.modulo;
        this.interruptController.requestInterrupt(InterruptSource.Timer);
      } else {
        this.counter += 1;
      }

      this.tickCount = 0;
    } else {
      this.tickCount += 1;
    }
  }

  private getFrequency() {
    switch (this.control & 0x3) {
      case 0:
        return 256;
      case 1:
        return 4;
      case 2:
        return 16;
      case 3:
        return 64;
      default:
        return 0;
    }
  }
}
