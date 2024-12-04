import { WebWaveChannel } from "../../audio";
import { BaseChannel } from "./base-channel";

export class WaveChannel extends BaseChannel<WebWaveChannel> {
  public wave = new Uint8Array(16);
  public waveChanged = true;

  private period = 0;

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
    if (!this.isDACEnabled()) return;

    if (this.waveChanged) {
      this.chan.setWave(this.wave);
      this.waveChanged = false;
    }

    super.trigger();
  }
}
