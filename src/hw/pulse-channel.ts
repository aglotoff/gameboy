export class PulseChannel {
  private oscillator: OscillatorNode;
  private gainNode: GainNode;

  private on = false;

  private initialVolume = 0;
  private volume = 0;

  private frequency = 0;

  private initialLengthTimer = 0;
  private lengthTimer = 0;
  private lengthEnable = false;

  private envelopeDirection = 0;
  private ticksToEnvelopeSweep = 0;
  private envelopeSweepPace = 0;

  public reset() {
    this.on = false;
    this.initialVolume = 0;
    this.volume = 0;
    this.gainNode.gain.value = 0;
    this.frequency = 0;
    this.initialLengthTimer = 0;
    this.lengthTimer = 0;
    this.lengthEnable = false;
    this.envelopeDirection = 0;
    this.ticksToEnvelopeSweep = 0;
    this.envelopeSweepPace = 0;
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

  public getFrequency() {
    return this.frequency;
  }

  public setFrequency(frequency: number) {
    this.frequency = frequency;
    this.oscillator.frequency.value = 131072 / (2048 - frequency);
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

  public setLengthEnable(lengthEnable: boolean) {
    this.lengthEnable = lengthEnable;
  }

  public constructor(audioContext: AudioContext) {
    this.oscillator = audioContext.createOscillator();
    this.oscillator.type = "square";
    this.oscillator.frequency.value = 0;

    this.gainNode = audioContext.createGain();
    this.gainNode.gain.value = 0;

    this.oscillator.connect(this.gainNode);

    this.gainNode.connect(audioContext.destination);
    this.oscillator.start();
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

  public trigger() {
    this.volume = this.initialVolume;
    if (!this.muted) {
      this.gainNode.gain.value = this.volume / 100;
    }
    this.lengthTimer = this.initialLengthTimer;
    this.ticksToEnvelopeSweep = this.envelopeSweepPace;
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
