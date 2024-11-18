import { getMSB, testBit } from "../../utils";
import { Timer } from "./timer";

export class TimerRegisters {
  private controlRegister = 0;

  public constructor(private timer: Timer) {}

  public get divider() {
    // DIV is the 8 upper bits of the system counter
    return getMSB(this.timer.getSystemCounter());
  }

  public set divider(_value: number) {
    // Writing any value resets the divider
    this.timer.resetSystemCounter();
  }

  public get counter() {
    return this.timer.getCounter();
  }

  public set counter(value: number) {
    this.timer.setCounter(value);
  }

  public get modulo() {
    return this.timer.getModulo();
  }

  public set modulo(value: number) {
    this.timer.setModulo(value);
  }

  public get control() {
    return this.controlRegister;
  }

  public set control(value: number) {
    this.controlRegister = value & 0x7;

    this.timer.setParams({
      counterEnabled: testBit(value, 2),
      inputClockBit: TimerRegisters.getInputClockBit(value & 0x3),
    });
  }

  private static getInputClockBit(clockSelector: number) {
    switch (clockSelector) {
      case 1:
        return 3;
      case 2:
        return 5;
      case 3:
        return 7;
      default: // case 0
        return 9;
    }
  }
}
