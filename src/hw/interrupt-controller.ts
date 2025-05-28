// See https://gbdev.io/pandocs/Interrupts.html

const INTERRUPT_SOURCE_MAX = 5;
const INTERRUPT_SOURCE_MASK = 0b00011111;
const INTERRUPT_SOURCE_UNUSED_MASK = 0b11100000;

export class InterruptController {
  private enableRegister = 0;
  private flagRegister = INTERRUPT_SOURCE_UNUSED_MASK;

  public getEnableRegister() {
    return this.enableRegister;
  }

  public setEnableRegister(enable: number) {
    this.enableRegister = enable;
  }

  public getFlagRegister() {
    return this.flagRegister;
  }

  public setFlagRegister(flag: number) {
    this.flagRegister = flag | INTERRUPT_SOURCE_UNUSED_MASK;
  }

  public requestInterrupt(irq: number) {
    this.flagRegister |= 1 << irq;
  }

  public acknowledgeInterrupt(irq: number) {
    this.flagRegister &= ~(1 << irq);
  }

  public hasPendingInterrupt() {
    return this.getPendingBits() !== 0;
  }

  public getPendingInterrupt() {
    const pendingBits = this.getPendingBits();

    // Lower bits correspond to interrupts with higher priority
    for (let i = 0; i < INTERRUPT_SOURCE_MAX; i++) {
      if (pendingBits & (1 << i)) {
        return i;
      }
    }

    return -1;
  }

  private getPendingBits() {
    return this.enableRegister & this.flagRegister & INTERRUPT_SOURCE_MASK;
  }
}
