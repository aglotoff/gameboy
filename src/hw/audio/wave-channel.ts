import { WebWaveChannel } from "../../audio";
import { BaseChannel } from "./base-channel";

export class WaveChannel extends BaseChannel<WebWaveChannel> {
  private wave = new Uint8Array(16);
  private waveChanged = true;

  public readWaveRAM(offset: number) {
    return this.wave[offset];
  }

  public writeWaveRAM(offset: number, data: number) {
    this.wave[offset] = data;
    this.waveChanged = true;
  }

  private period = 0;

  public constructor(chan: WebWaveChannel) {
    super(chan, 256);
  }

  public reset() {
    super.reset();
    this.dacEnabled = false;
    this.period = 0;
  }

  private dacEnabled = false;

  public isDACEnabled() {
    return this.dacEnabled;
  }

  public setDACEnabled(dacEnabled: boolean) {
    this.dacEnabled = dacEnabled;
    if (!dacEnabled && this.isOn()) {
      this.turnOff();
    }
  }

  public getPeriod() {
    return this.period;
  }

  public setPeriod(period: number) {
    this.period = period;
    this.chan.setPeriod(this.period);
  }

  public trigger() {
    super.trigger();

    if (!this.isDACEnabled()) return;

    if (this.waveChanged) {
      this.chan.setWave(this.wave);
      this.waveChanged = false;
    }
  }
}
