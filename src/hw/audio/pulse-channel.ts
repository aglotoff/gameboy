import { AudioChannel } from "../../audio";

export interface EnvelopeOptions {
  direction: number;
  sweepPace: number;
  initialVolume: number;
}

export interface PeriodSweepOptions {
  pace: number;
  direction: number;
  step: number;
}

export class PulseChannel {
  private on = false;

  private initialVolume = 0;
  private currentVolume = 0;

  private period = 0;

  private initialLengthTimer = 0;
  private lengthTimer = 0;
  private lengthEnable = false;

  private envelopeDirection = 0;
  private ticksToEnvelopeSweep = 0;
  private envelopeSweepPace = 0;

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

  public getEnvelopeOptions(): EnvelopeOptions {
    return {
      sweepPace: this.envelopeSweepPace,
      direction: this.envelopeDirection,
      initialVolume: this.initialVolume,
    };
  }

  public setEnvelopeOptions(options: EnvelopeOptions) {
    this.envelopeSweepPace = options.sweepPace;
    this.envelopeDirection = options.direction;
    this.initialVolume = options.initialVolume;

    if (this.on && !this.isDACEnabled()) {
      this.turnOff();
    }
  }

  private setVolume(volume: number) {
    this.currentVolume = volume;
    if (!this.muted) {
      this.chan.setVolume(volume / 15);
    }
  }

  public reset() {
    this.on = false;
    this.initialVolume = 0;
    this.currentVolume = 0;
    this.chan.setVolume(0);
    this.setPeriod(0);
    this.initialLengthTimer = 0;
    this.lengthTimer = 0;
    this.lengthEnable = false;
    this.envelopeDirection = 0;
    this.ticksToEnvelopeSweep = 0;
    this.envelopeSweepPace = 0;
    this.periodSweepPace = 0;
    this.periodSweepDirection = 0;
    this.periodSweepStep = 0;
    this.ticksToPeriodSweep = 0;
    this.setWaveDuty(0);
  }

  public getInitialLengthTimer() {
    return this.lengthTimer;
  }

  public setInitialLengthTimer(lengthTimer: number) {
    this.lengthTimer = lengthTimer;
  }

  public getPeriod() {
    return this.period;
  }

  public setPeriod(period: number) {
    this.period = period;
    this.chan.setPeriod(this.period);
  }

  public getLengthEnable() {
    return this.lengthEnable;
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

  public setLengthEnable(lengthEnable: boolean) {
    this.lengthEnable = lengthEnable;
  }

  public constructor(private chan: AudioChannel) {}

  public isOn() {
    return this.on;
  }

  public envelopeSweepTick() {
    if (!this.on) return;

    if (this.ticksToEnvelopeSweep > 0 && this.on && this.envelopeSweepPace) {
      this.ticksToEnvelopeSweep -= 1;

      if (this.ticksToEnvelopeSweep === 0) {
        this.ticksToEnvelopeSweep = this.envelopeSweepPace;
        this.envelopeSweep();
      }
    }
  }

  private envelopeSweep() {
    this.setVolume(
      Math.min(Math.max(this.currentVolume + this.envelopeDirection, 0), 15)
    );
  }

  public lengthIncrementTick() {
    if (this.on && this.lengthEnable) {
      this.lengthTimer += 1;

      if (this.lengthTimer === 64) {
        this.lengthTimer = 0;
        this.turnOff();
      }
    }
  }

  private turnOff() {
    this.on = false;
    this.setVolume(0);
  }

  public periodSweepTick() {
    if (!this.on) return;

    if (this.ticksToPeriodSweep > 0 && this.on && this.periodSweepPace) {
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
    if (!this.isDACEnabled()) return;

    this.setVolume(this.initialVolume);
    this.lengthTimer = this.initialLengthTimer;
    this.ticksToEnvelopeSweep = this.envelopeSweepPace;
    this.ticksToPeriodSweep = this.periodSweepPace;

    this.on = true;
  }

  private muted = true;

  public mute() {
    this.muted = true;
    this.chan.setVolume(0);
  }

  public unmute() {
    this.muted = false;
    this.chan.setVolume(this.currentVolume / 15);
  }

  public isMuted() {
    return this.muted;
  }

  private isDACEnabled() {
    return this.initialVolume > 0 || this.envelopeDirection > 0;
  }
}
