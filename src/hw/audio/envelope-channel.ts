import { IAudioChannel } from "../../audio";
import { BaseChannel } from "./base-channel";

export interface EnvelopeOptions {
  direction: number;
  sweepPace: number;
  initialVolume: number;
}

export class EnvelopeChannel<
  ChannelType extends IAudioChannel
> extends BaseChannel<ChannelType> {
  private initialVolume = 0;
  private envelopeDirection = 0;
  private ticksToEnvelopeSweep = 0;
  private envelopeSweepPace = 0;

  public reset() {
    super.reset();
    this.initialVolume = 0;
    this.envelopeDirection = 0;
    this.ticksToEnvelopeSweep = 0;
    this.envelopeSweepPace = 0;
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

    if (this.isOn() && !this.isDACEnabled()) {
      this.turnOff();
    }
  }

  public envelopeSweepTick() {
    if (!this.isOn()) return;

    if (this.ticksToEnvelopeSweep > 0 && this.envelopeSweepPace) {
      this.ticksToEnvelopeSweep -= 1;

      if (this.ticksToEnvelopeSweep === 0) {
        this.ticksToEnvelopeSweep = this.envelopeSweepPace;
        this.envelopeSweep();
      }
    }
  }

  private envelopeSweep() {
    this.setVolume(
      Math.min(Math.max(this.getVolume() + this.envelopeDirection, 0), 15)
    );
  }

  public trigger() {
    if (!this.isDACEnabled()) return;

    this.setVolume(this.initialVolume);
    this.ticksToEnvelopeSweep = this.envelopeSweepPace;

    super.trigger();
  }

  private isDACEnabled() {
    return this.initialVolume > 0 || this.envelopeDirection > 0;
  }
}
