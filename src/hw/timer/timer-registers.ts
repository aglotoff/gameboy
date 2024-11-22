import { getMSB, testBit } from "../../utils";
import { Timer } from "./timer";

const TAC_UNUSED_MASK = 0b11111000;
const TAC_CLOCK_SELECT_MASK = 0b11;
const TAC_ENABLE_BIT = 2;

export class TimerRegisters {
  private controlRegister = TAC_UNUSED_MASK;

  public constructor(private timer: Timer) {}

  public get div() {
    // DIV is the 8 upper bits of the system counter
    return getMSB(this.timer.getSystemCounter());
  }

  public set div(_value: number) {
    // Writing any value resets the divider
    this.timer.resetSystemCounter();
  }

  public get tima() {
    return this.timer.getCounter();
  }

  public set tima(value: number) {
    this.timer.setCounter(value);
  }

  public get tma() {
    return this.timer.getModulo();
  }

  public set tma(value: number) {
    this.timer.setModulo(value);
  }

  public get tac() {
    return this.controlRegister;
  }

  public set tac(value: number) {
    this.controlRegister = TAC_UNUSED_MASK | value;

    this.timer.setParams({
      counterEnabled: testBit(value, TAC_ENABLE_BIT),
      inputClockBit: TimerRegisters.getInputClockBit(
        value & TAC_CLOCK_SELECT_MASK
      ),
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
