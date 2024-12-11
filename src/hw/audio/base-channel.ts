import { IAudioChannel } from "../../audio";

const SOUND_LENGTH_RATE = 2;

export abstract class BaseChannel<ChannelType extends IAudioChannel> {
  private on = false;

  private ticksToLengthDecrement = 0;
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

    // this.ticksToLengthDecrement = 0;
    this.lengthTimer = 0;
    this.lengthEnable = false;

    this.currentVolume = 0;
    this.chan.setVolume(0);
  }

  public getVolume() {
    return this.currentVolume;
  }

  public setVolume(volume: number) {
    this.currentVolume = volume;

    if (this.isOn()) {
      this.chan.setVolume(volume);
    }
  }

  public setLengthTimer(data: number) {
    this.lengthTimer = this.maxLengthTimer - (data % this.maxLengthTimer);
  }

  public getLengthEnable() {
    return this.lengthEnable;
  }

  public setLengthEnable(lengthEnable: boolean) {
    if (this.ticksToLengthDecrement !== 0) {
      if (!this.lengthEnable && lengthEnable && this.lengthTimer > 0) {
        this.lengthTimer -= 1;

        if (this.lengthTimer === 0) {
          this.turnOff();
        }
      }
    }

    this.lengthEnable = lengthEnable;
  }

  public isDACEnabled() {
    return true;
  }

  public isOn() {
    return this.on;
  }

  public trigger() {
    if (this.lengthTimer === 0) {
      this.lengthTimer = this.maxLengthTimer;

      if (this.lengthEnable && this.ticksToLengthDecrement !== 0) {
        this.lengthTimer -= 1;
      }
    }

    if (this.isDACEnabled()) {
      this.on = true;
      this.chan.setVolume(this.currentVolume);
    }
  }

  public turnOff() {
    this.on = false;
    this.chan.setVolume(0);
  }

  public tick(divApu: number) {
    if (divApu % SOUND_LENGTH_RATE === 0) {
      this.lengthTimerTick();
      this.ticksToLengthDecrement = 1;
    } else {
      this.ticksToLengthDecrement = 0;
    }
  }

  private lengthTimerTick() {
    if (this.lengthEnable && this.lengthTimer > 0) {
      this.lengthTimer -= 1;

      if (this.lengthTimer === 0) {
        this.turnOff();
      }
    }
  }
}
