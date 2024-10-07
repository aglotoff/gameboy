import { resetBit, setBit, testBit } from "./utils";

export enum InterruptSource {
  VBlank = 0,
  LCD = 1,
  Timer = 2,
  Serial = 3,
  Joypad = 4,
}

const INTERRUPT_SOURCE_MAX = 5;
const INTERRUPT_SOURCE_MASK = 0x1f;

export enum InterruptControllerRegister {
  IF,
  IE,
}

export class InterruptController {
  private enabled = 0;
  private flags = 0;

  public readRegister(reg: InterruptControllerRegister) {
    switch (reg) {
      case InterruptControllerRegister.IF:
        return this.flags;
      case InterruptControllerRegister.IE:
        return this.enabled;
    }
  }

  public writeRegister(reg: InterruptControllerRegister, data: number) {
    switch (reg) {
      case InterruptControllerRegister.IF:
        this.flags = data & INTERRUPT_SOURCE_MASK;
        break;
      case InterruptControllerRegister.IE:
        this.enabled = data & INTERRUPT_SOURCE_MASK;
        break;
    }
  }

  public requestInterrupt(irq: number) {
    if (irq < 0 || irq >= INTERRUPT_SOURCE_MAX) {
      throw new Error(`Bad interrupt source: ${irq}`);
    }

    this.flags = setBit(this.flags, irq);
  }

  public acknowledgeInterrupt(irq: number) {
    if (irq < 0 || irq >= INTERRUPT_SOURCE_MAX) {
      throw new Error(`Bad interrupt source: ${irq}`);
    }

    this.flags = resetBit(this.flags, irq);
  }

  public hasPendingInterrupt() {
    return this.getPendingBits() !== 0;
  }

  public getPendingInterrupt() {
    for (let i = 0; i < INTERRUPT_SOURCE_MAX; i++) {
      if (testBit(this.getPendingBits(), i)) {
        return i;
      }
    }

    return -1;
  }

  private getPendingBits() {
    return this.enabled & this.flags;
  }
}

export const interruptController = new InterruptController();
