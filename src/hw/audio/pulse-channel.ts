import { WebAudioChannel } from "../../audio";
import { EnvelopeChannel } from "./envelope-channel";

export interface PeriodSweepOptions {
  pace: number;
  direction: number;
  step: number;
}

export class PulseChannel extends EnvelopeChannel<WebAudioChannel> {
  private period = 0;

  private periodSweepPace = 0;
  private ticksToPeriodSweep = 0;
  private periodSweepDirection = 0;
  private periodSweepStep = 0;

  public getPeriodSweepOptions(): PeriodSweepOptions {
    return {
      pace: this.periodSweepPace,
      direction: this.periodSweepDirection,
      step: this.periodSweepStep,
    };
  }

  public setPeriodSweepOptions(options: PeriodSweepOptions) {
    this.periodSweepPace = options.pace;
    this.periodSweepDirection = options.direction;
    this.periodSweepStep = options.step;
  }

  public reset() {
    super.reset();
    this.setPeriod(0);
    this.periodSweepPace = 0;
    this.periodSweepDirection = 0;
    this.periodSweepStep = 0;
    this.ticksToPeriodSweep = 0;
    this.setWaveDuty(0);
  }

  public getPeriod() {
    return this.period;
  }

  public setPeriod(period: number) {
    this.period = period;
    this.chan.setPeriod(this.period);
  }

  private waveDuty = 0.125;

  public setWaveDuty(waveDuty: number) {
    if (this.waveDuty !== waveDuty) {
      this.waveDuty = waveDuty;
      this.chan.setWaveDuty(waveDuty);
    }
  }

  public getWaveDuty() {
    return this.waveDuty;
  }

  public periodSweepTick() {
    if (!this.isOn()) return;

    if (this.ticksToPeriodSweep > 0 && this.periodSweepPace) {
      this.ticksToPeriodSweep -= 1;

      if (this.ticksToPeriodSweep === 0) {
        this.ticksToPeriodSweep = this.periodSweepPace;
        this.periodSweep();
      }
    }
  }

  private periodSweep() {
    this.period +=
      this.periodSweepDirection * (this.period / (1 << this.periodSweepStep));

    if (this.period > 0x7ff || this.period < 0) {
      this.period = 0;
      this.turnOff();
    }

    this.chan.setPeriod(this.period);
  }

  public trigger() {
    super.trigger();
    this.ticksToPeriodSweep = this.periodSweepPace;
  }
}
