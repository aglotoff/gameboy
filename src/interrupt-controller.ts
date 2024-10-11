import { resetBit, setBit, testBit } from "./utils";

const INTERRUPT_SOURCE_MAX = 5;
const INTERRUPT_SOURCE_MASK = 0x1f;

export class InterruptController {
  private enableRegister = 0;
  private flagRegister = 0;

  public getEnableRegister() {
    return this.enableRegister;
  }

  public setEnableRegister(enable: number) {
    this.enableRegister = enable & INTERRUPT_SOURCE_MASK;
  }

  public getFlagRegister() {
    return this.flagRegister;
  }

  public setFlagRegister(flag: number) {
    this.flagRegister = flag & INTERRUPT_SOURCE_MASK;
  }

  public requestInterrupt(irq: number) {
    if (irq < 0 || irq >= INTERRUPT_SOURCE_MAX) {
      throw new Error(`Bad interrupt source: ${irq}`);
    }

    this.flagRegister = setBit(this.flagRegister, irq);
  }

  public acknowledgeInterrupt(irq: number) {
    if (irq < 0 || irq >= INTERRUPT_SOURCE_MAX) {
      throw new Error(`Bad interrupt source: ${irq}`);
    }

    this.flagRegister = resetBit(this.flagRegister, irq);
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
    return this.enableRegister & this.flagRegister;
  }
}
