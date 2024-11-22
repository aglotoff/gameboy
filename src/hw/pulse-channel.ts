export class PulseChannel {
  private static waves: Partial<Record<number, PeriodicWave>> = {};

  private oscillator: OscillatorNode;
  private gainNode: GainNode;

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

  public setPeriodSweepPace(sweepPace: number) {
    this.periodSweepPace = sweepPace;
  }

  public setPeriodSweepDirection(sweepDirection: number) {
    this.periodSweepDirection = sweepDirection;
  }

  public setPeriodSweepStep(sweepStep: number) {
    this.periodSweepStep = sweepStep;
  }

  public reset() {
    this.on = false;
    this.initialVolume = 0;
    this.volume = 0;
    this.gainNode.gain.value = 0;
    this.period = 0;
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

  public getEnvelopeDirection() {
    return this.envelopeDirection;
  }

  public setEnvelopeDirection(direction: number) {
    this.envelopeDirection = direction;
  }

  public setEnvelopeSweepPace(sweepPace: number) {
    this.envelopeSweepPace = sweepPace;
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
    this.oscillator.frequency.value = 131072 / (2048 - period);
  }

  public getInitialVolume() {
    return this.initialVolume;
  }

  public setInitialVolume(initialVolume: number) {
    this.initialVolume = initialVolume;
  }

  public getLengthEnable() {
    return this.lengthEnable;
  }

  private waveDuty = 0.125;

  public setWaveDuty(waveDuty: number) {
    if (this.waveDuty !== waveDuty) {
      this.waveDuty = waveDuty;
      this.oscillator.setPeriodicWave(
        this.getPeriodicWave([0.125, 0.25, 0.5, 0.75][this.waveDuty])
      );
    }
  }

  public getWaveDuty() {
    return this.waveDuty;
  }

  public setLengthEnable(lengthEnable: boolean) {
    this.lengthEnable = lengthEnable;
  }

  public constructor(private audioContext: AudioContext) {
    this.oscillator = audioContext.createOscillator();

    this.oscillator.setPeriodicWave(this.getPeriodicWave(0.125));

    this.oscillator.frequency.value = 0;

    this.gainNode = audioContext.createGain();
    this.gainNode.gain.value = 0;

    this.oscillator.connect(this.gainNode);

    this.gainNode.connect(audioContext.destination);
    this.oscillator.start();
  }

  private getPeriodicWave(duty: number) {
    const existingWave = PulseChannel.waves[duty];
    if (existingWave != null) {
      return existingWave;
    }

    const real = new Float32Array(128);
    const imag = new Float32Array(128); // defaults to zeros

    for (let n = 1; n < 128; n++) {
      real[n] = (2 * Math.sin(Math.PI * n * duty)) / (Math.PI * n);
    }

    const wave = this.audioContext.createPeriodicWave(real, imag);
    PulseChannel.waves[duty] = wave;
    return wave;
  }

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

    if (!this.muted && this.on) {
      this.gainNode.gain.value = this.volume / 100;
    }

    if (this.volume <= 0) {
      this.on = false;
    }
  }

  public lengthIncrementTick() {
    if (this.lengthEnable) {
      this.lengthTimer += 1;

      if (this.lengthTimer === 64) {
        this.lengthTimer = 0;
        this.on = false;
        this.volume = 0;
        this.gainNode.gain.value = 0;
      }
    }
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
      this.on = false;
    }

    this.oscillator.frequency.value = 131072 / (2048 - this.period);
  }

  public trigger() {
    this.volume = this.initialVolume;
    if (!this.muted) {
      this.gainNode.gain.value = this.volume / 100;
    }
    this.lengthTimer = this.initialLengthTimer;
    this.ticksToEnvelopeSweep = this.envelopeSweepPace;
    this.ticksToPeriodSweep = this.periodSweepPace;
    this.on = true;
  }

  private muted = true;

  public mute() {
    this.muted = true;
    this.gainNode.gain.value = 0;
  }

  public unmute() {
    this.muted = false;
    this.gainNode.gain.value = this.volume / 100;
  }
}
