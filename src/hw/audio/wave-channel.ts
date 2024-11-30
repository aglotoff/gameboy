import { AudioChannel } from "../../audio";

export class WaveChannel {
  public wave = new Uint8Array(16);
  public waveChanged = true;

  private on = false;
  private muted = true;

  private initialLengthTimer = 0;
  private lengthTimer = 0;
  private lengthEnable = false;
  private currentVolume = 0;

  private period = 0;

  public reset() {
    this.period = 0;
    this.on = false;
    this.currentVolume = 0;
    this.chan.setVolume(0);
    this.initialLengthTimer = 0;
    this.lengthTimer = 0;
    this.lengthEnable = false;
  }

  public constructor(private chan: AudioChannel) {
    this.mute();
    this.setVolume(0);
  }

  private dacEnabled = false;

  public isDACEnabled() {
    return this.dacEnabled;
  }

  public setDACEnabled(dacEnabled: boolean) {
    this.dacEnabled = dacEnabled;
    if (!dacEnabled && this.on) {
      this.turnOff();
    }
  }

  public getInitialLengthTimer() {
    return this.lengthTimer;
  }

  public setInitialLengthTimer(lengthTimer: number) {
    this.lengthTimer = lengthTimer;
  }

  public getLengthEnable() {
    return this.lengthEnable;
  }

  public setLengthEnable(lengthEnable: boolean) {
    this.lengthEnable = lengthEnable;
  }

  public isOn() {
    return this.on;
  }

  public setVolume(volume: number) {
    this.currentVolume = volume;

    if (!this.muted && this.on) {
      this.chan.setVolume(volume);
    }
  }

  public getVolume() {
    return this.currentVolume;
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
    this.chan.setVolume(0);
  }

  public getPeriod() {
    return this.period;
  }

  public setPeriod(period: number) {
    this.period = period;
    this.chan.setPeriod2(this.period);
  }

  public trigger() {
    if (!this.isDACEnabled()) return;

    if (this.waveChanged) {
      this.chan.setWave(this.wave);
      this.waveChanged = false;
    }

    if (!this.muted) {
      this.chan.setVolume(this.currentVolume);
    }

    this.lengthTimer = this.initialLengthTimer;

    this.on = true;
  }

  public mute() {
    this.muted = true;
    this.chan.setVolume(0);
  }

  public unmute() {
    this.muted = false;
    if (this.on) {
      this.chan.setVolume(this.currentVolume);
    }
  }

  public isMuted() {
    return this.muted;
  }
}
