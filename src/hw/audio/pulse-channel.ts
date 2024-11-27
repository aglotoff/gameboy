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
  private volume = 0;

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
  }

  public reset() {
    this.on = false;
    this.initialVolume = 0;
    this.volume = 0;
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
    if (this.ticksToEnvelopeSweep > 0 && this.on && this.envelopeSweepPace) {
      this.ticksToEnvelopeSweep -= 1;

      if (this.ticksToEnvelopeSweep === 0) {
        this.ticksToEnvelopeSweep = this.envelopeSweepPace;
        this.envelopeSweep();
      }
    }
  }

  private envelopeSweep() {
    this.volume += this.envelopeDirection;

    if (this.volume <= 0) {
      this.volume = 0;
    }

    if (!this.muted && this.on) {
      this.chan.setVolume(this.volume);
    }
  }

  public lengthIncrementTick() {
    if (this.lengthEnable) {
      this.lengthTimer += 1;

      if (this.lengthTimer === 64) {
        this.lengthTimer = 0;
        this.off();
      }
    }
  }

  private off() {
    this.on = false;
    this.volume = 0;
    this.chan.setVolume(0);
  }

  public periodSweepTick() {
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
      this.off();
    }

    this.chan.setPeriod(this.period);
  }

  public trigger() {
    this.volume = this.initialVolume;
    if (!this.muted) {
      this.chan.setVolume(this.volume);
    }
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
    this.chan.setVolume(this.volume);
  }
}
