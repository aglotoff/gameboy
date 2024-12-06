import { WebAudioChannel } from "../../audio";
import { EnvelopeChannel } from "./envelope-channel";

export interface PeriodSweepOptions {
  pace: number;
  direction: number;
  step: number;
}

const PERIOD_SWEEP_RATE = 4;

export class PulseChannel extends EnvelopeChannel<WebAudioChannel> {
  private period = 0;

  private periodSweepEnabled = false;
  private periodSweepPace = 0;
  private ticksToPeriodSweep = 0;
  private periodSweepDirection = 0;
  private periodSweepStep = 0;
  private shadowPeriod = 0;
  private negateSweepCalculated = false;

  public getPeriodSweepOptions(): PeriodSweepOptions {
    return {
      pace: this.periodSweepPace,
      direction: this.periodSweepDirection,
      step: this.periodSweepStep,
    };
  }

  public setPeriodSweepOptions(options: PeriodSweepOptions) {
    if (
      this.periodSweepDirection < 0 &&
      options.direction > 0 &&
      this.negateSweepCalculated
    ) {
      this.turnOff();
    }

    this.periodSweepPace = options.pace;
    this.periodSweepDirection = options.direction;
    this.periodSweepStep = options.step;
  }

  public reset() {
    super.reset();

    this.periodSweepEnabled = false;
    this.periodSweepPace = 0;
    this.periodSweepDirection = 0;
    this.periodSweepStep = 0;
    this.ticksToPeriodSweep = 0;
    this.period = 0;
    this.shadowPeriod = 0;
    this.negateSweepCalculated = false;

    this.setPeriod(0);
    this.setWaveDuty(0);
  }

  public getPeriod() {
    return this.period;
  }

  public setPeriod(period: number) {
    this.period = period;
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
    if (this.ticksToPeriodSweep > 0) {
      this.ticksToPeriodSweep -= 1;

      if (this.ticksToPeriodSweep == 0) {
        this.ticksToPeriodSweep = this.getSweepPeriodTicks();
        this.periodSweep();
      }
    }
  }

  private calculateNewPeriod() {
    if (this.periodSweepDirection < 0) {
      this.negateSweepCalculated = true;
    }

    const newPeriod =
      this.shadowPeriod +
      this.periodSweepDirection * (this.shadowPeriod >> this.periodSweepStep);

    if (newPeriod > 0x7ff) {
      this.turnOff();
    }

    return newPeriod;
  }

  private periodSweep() {
    if (!this.periodSweepEnabled || this.periodSweepPace === 0) return;

    const newPeriod = this.calculateNewPeriod();

    if (newPeriod <= 0x7ff && this.periodSweepStep !== 0) {
      this.period = newPeriod;
      this.shadowPeriod = newPeriod;
      this.chan.setPeriod(newPeriod);

      this.calculateNewPeriod();
    }
  }

  private getSweepPeriodTicks() {
    return this.periodSweepPace || 8;
  }

  public trigger() {
    super.trigger();

    this.ticksToPeriodSweep = this.getSweepPeriodTicks();
    this.negateSweepCalculated = false;

    this.shadowPeriod = this.period;
    this.chan.setPeriod(this.shadowPeriod);

    this.periodSweepEnabled =
      this.periodSweepPace !== 0 || this.periodSweepStep !== 0;

    if (this.periodSweepStep !== 0) {
      this.calculateNewPeriod();
    }
  }

  public override tick(divApu: number) {
    super.tick(divApu);

    if (divApu % PERIOD_SWEEP_RATE === 0) {
      this.periodSweepTick();
    }
  }
}
