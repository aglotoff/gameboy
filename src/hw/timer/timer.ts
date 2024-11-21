import {
  testBit,
  wrappingIncrementByte,
  wrappingIncrementWord,
} from "../../utils";

export interface IDivider {
  getSystemCounter(): number;
}

// References:
// https://github.com/Hacktix/GBEDG/blob/master/timers/index.md
// https://gbdev.io/pandocs/Timer_Obscure_Behaviour.html

export class Timer implements IDivider {
  // This magic value is used to pass the acceptance/boot_div-dmgABCmgb test
  // TODO: something seems to be absolutely wrong...
  private systemCounter = 0xdc87;

  private counterEnabled = false;
  private counter = 0;
  private modulo = 0;
  private inputClockBit = 9;
  private oldInputClockSignal = false;

  private reloadDelay = 0;
  private isReloading = false;

  public constructor(private onInterruptRequest: () => void) {}

  public reset() {
    this.systemCounter = 0xdc87;
    this.counterEnabled = false;
    this.counter = 0;
    this.modulo = 0;
    this.inputClockBit = 0;
    this.oldInputClockSignal = false;
    this.reloadDelay = 0;
    this.isReloading = false;
  }

  public getSystemCounter() {
    return this.systemCounter;
  }

  public resetSystemCounter() {
    this.systemCounter = 0;
  }

  public getCounter() {
    return this.counter;
  }

  public setCounter(data: number) {
    // Writing to the counter the same cycle its value is loaded from the modulo
    // register is ignored
    if (this.isReloading) return;

    this.counter = data;
    this.reloadDelay = 0;
  }

  public getModulo() {
    return this.modulo;
  }

  public setModulo(data: number) {
    this.modulo = data;

    // If the module is updated on the same cycle its content is loaded into the
    // counter, the counter is also loaded with the new value
    if (this.isReloading) {
      this.counter = data;
    }
  }

  public setParams(params: { counterEnabled: boolean; inputClockBit: number }) {
    this.counterEnabled = params.counterEnabled;
    this.inputClockBit = params.inputClockBit;

    // Changing params may result in a counter increment (added to pass the
    // acceptance/timer/rapid_toggle test)
    this.checkClock();
  }

  public enableCounter() {
    this.counterEnabled = true;
  }

  public disableCounter() {
    this.counterEnabled = false;
  }

  public setInputClockBit(bit: number) {
    this.inputClockBit = bit;
  }

  public tick() {
    this.systemCounter = wrappingIncrementWord(this.systemCounter);
    this.processReloading();
    this.checkClock();
  }

  private processReloading() {
    this.isReloading = false;

    if (this.reloadDelay > 0) {
      this.reloadDelay -= 1;

      if (this.reloadDelay === 0) {
        this.counter = this.modulo;
        this.isReloading = true;

        this.onInterruptRequest();
      }
    }
  }

  private checkClock() {
    const newInputClockSignal =
      testBit(this.systemCounter, this.inputClockBit) && this.counterEnabled;

    const isFallingEdge = this.oldInputClockSignal && !newInputClockSignal;
    if (isFallingEdge) {
      this.incrementCounter();
    }

    this.oldInputClockSignal = newInputClockSignal;
  }

  private incrementCounter() {
    this.counter = wrappingIncrementByte(this.counter);

    if (this.counter === 0) {
      this.counter = 0;
      this.reloadDelay = 4;
    }
  }
}
