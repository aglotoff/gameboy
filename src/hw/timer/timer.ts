import { wrappingIncrementByte } from "../../utils";
import { SystemCounter } from "../system-counter";

const DEFAULT_INPUT_CLOCK_MASK = 1 << 9;

// References:
// https://github.com/Hacktix/GBEDG/blob/master/timers/index.md
// https://gbdev.io/pandocs/Timer_Obscure_Behaviour.html

export class Timer {
  private counterEnabled = false;
  private counter = 0;
  private modulo = 0;
  private inputClockMask = DEFAULT_INPUT_CLOCK_MASK;
  private prevInputClockSignal = false;

  private reloadDelay = 0;
  private isReloading = false;

  public constructor(
    private systemCounter: SystemCounter,
    private onInterruptRequest = () => {}
  ) {}

  public reset() {
    this.counterEnabled = false;
    this.counter = 0;
    this.modulo = 0;
    this.inputClockMask = DEFAULT_INPUT_CLOCK_MASK;
    this.prevInputClockSignal = false;
    this.reloadDelay = 0;
    this.isReloading = false;
  }

  public getCounter() {
    return this.counter;
  }

  public setCounter(data: number) {
    // Writing to the counter the same cycle its value is loaded from the modulo
    // register is ignored
    if (this.isReloading) return;

    // Writing aborts reloading and interrupt request
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
    this.setInputClockBit(params.inputClockBit);

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
    this.inputClockMask = 1 << bit;
  }

  public tick() {
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
    const nextInputClockSignal =
      this.counterEnabled &&
      (this.systemCounter.getValue() & this.inputClockMask) !== 0;

    const isFallingEdge = this.prevInputClockSignal && !nextInputClockSignal;
    if (isFallingEdge) {
      this.incrementCounter();
    }

    this.prevInputClockSignal = nextInputClockSignal;
  }

  private incrementCounter() {
    this.counter = wrappingIncrementByte(this.counter);

    // After overflowing the counter remains zero for a duration of 4 T-cycles
    // before it is reloaded
    if (this.counter === 0) {
      this.counter = 0;
      this.reloadDelay = 4;
    }
  }
}
