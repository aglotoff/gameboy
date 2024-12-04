import { IAudioChannel } from "../../audio";

export abstract class BaseChannel<ChannelType extends IAudioChannel> {
  private on = false;

  private lengthTimer = 0;
  private lengthEnable = false;

  private currentVolume = 0;

  public constructor(
    protected chan: ChannelType,
    private maxLengthTimer = 64,
    public debug = false
  ) {}

  public reset() {
    this.on = false;

    this.lengthTimer = 0;
    this.lengthEnable = false;

    this.currentVolume = 0;
    this.chan.setVolume(0);
  }

  public setVolume(volume: number) {
    this.currentVolume = volume;

    if (this.isOn()) {
      this.chan.setVolume(volume);
    }
  }

  public setInitialLengthTimer(lengthTimer: number) {
    this.lengthTimer = this.maxLengthTimer - lengthTimer;
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

  public lengthIncrementTick() {
    if (this.lengthEnable && this.lengthTimer > 0) {
      this.lengthTimer -= 1;

      if (this.lengthTimer === 0) {
        this.turnOff();
      }
    }
  }

  public turnOff() {
    this.on = false;
    this.chan.setVolume(0);
  }

  public trigger() {
    if (this.lengthTimer === 0) {
      this.lengthTimer = this.maxLengthTimer;
    }

    this.on = true;
    this.chan.setVolume(this.currentVolume);
  }

  public getVolume() {
    return this.currentVolume;
  }
}
