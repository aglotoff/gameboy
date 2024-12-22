import { IAudioChannel } from "../../audio";
import { BaseChannel } from "./base-channel";

export enum EnvelopeDirection {
  DOWN,
  UP,
}

export interface EnvelopeOptions {
  direction: EnvelopeDirection;
  sweepPace: number;
  initialVolume: number;
}

const ENVELOPE_SWEEP_RATE = 8;

export class EnvelopeChannel<
  ChannelType extends IAudioChannel
> extends BaseChannel<ChannelType> {
  private initialVolume = 0;
  private envelopeDirection = EnvelopeDirection.DOWN;
  private envelopePeriod = 0;
  private ticksToEnvelope = 0;

  public reset() {
    super.reset();

    this.initialVolume = 0;
    this.envelopeDirection = EnvelopeDirection.DOWN;
    this.envelopePeriod = 0;
    this.ticksToEnvelope = 0;
  }

  public getEnvelopeOptions(): EnvelopeOptions {
    return {
      sweepPace: this.envelopePeriod,
      direction: this.envelopeDirection,
      initialVolume: this.initialVolume,
    };
  }

  public setEnvelopeOptions(options: EnvelopeOptions) {
    this.envelopePeriod = options.sweepPace;
    this.envelopeDirection = options.direction;
    this.initialVolume = options.initialVolume;

    if (this.isOn() && !this.isDACEnabled()) {
      this.turnOff();
    }
  }

  public envelopeTick() {
    if (!this.isOn()) return;

    if (this.ticksToEnvelope > 0 && this.envelopePeriod) {
      this.ticksToEnvelope -= 1;

      if (this.ticksToEnvelope === 0) {
        this.ticksToEnvelope = this.envelopePeriod;
        this.envelopeSweep();
      }
    }
  }

  private envelopeSweep() {
    const newVolume =
      this.envelopeDirection === EnvelopeDirection.DOWN
        ? this.getVolume() - 1
        : this.getVolume() + 1;

    this.setVolume(Math.min(Math.max(newVolume, 0), 15));
  }

  public trigger() {
    super.trigger();

    if (!this.isDACEnabled()) return;

    this.setVolume(this.initialVolume);
    this.ticksToEnvelope = this.envelopePeriod;
  }

  public isDACEnabled() {
    return this.initialVolume > 0 || this.envelopeDirection > 0;
  }

  public override frameSequencerTick(step: number) {
    super.frameSequencerTick(step);

    if (step % ENVELOPE_SWEEP_RATE === 7) {
      this.envelopeTick();
    }
  }
}
