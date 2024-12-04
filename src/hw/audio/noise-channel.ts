import { WebNoiseChannel } from "../../audio";
import { EnvelopeChannel } from "./envelope-channel";

export interface RandomOptions {
  clockShift: number;
  lfsrWidth: number;
  clockDivider: number;
}

export class NoiseChannel extends EnvelopeChannel<WebNoiseChannel> {
  private clockShift = 0;
  private lfsrWidth = 15;
  private clockDivider = 0;

  public reset() {
    super.reset();

    this.clockDivider = 0;
    this.lfsrWidth = 15;
    this.clockShift = 0;
  }

  public setRandomOptions(options: RandomOptions) {
    this.clockShift = options.clockShift;
    this.lfsrWidth = options.lfsrWidth;
    this.clockDivider = options.clockDivider;
  }

  public getRandomOptions(): RandomOptions {
    return {
      clockDivider: this.clockDivider,
      clockShift: this.clockShift,
      lfsrWidth: this.lfsrWidth,
    };
  }

  public trigger() {
    this.chan.setRate(
      1 / ((this.clockDivider || 0.5) * (1 << (this.clockShift + 1)))
    );

    this.chan.setWidth(this.lfsrWidth);

    super.trigger();
  }
}
