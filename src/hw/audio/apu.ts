import { WebAudio } from "../../audio";
import { testBit, wrappingIncrementByte } from "../../utils";
import { SystemCounter } from "../system-counter";
import { NoiseChannel } from "./noise-channel";
import { PulseChannel } from "./pulse-channel";
import { WaveChannel } from "./wave-channel";

// TODO: 13 in double-speed mode
const APU_DIV_TRIGGER_BIT = 12;

const SOUND_LENGTH_RATE = 2;
const PERIOD_SWEEP_RATE = 4;
const ENVELOPE_SWEEP_RATE = 8;

export class APU {
  private divApu = 0;
  private lastDividerBit = false;

  private nr50 = 0;
  private nr51 = 0;

  public channel1 = new PulseChannel(this.audio.channel1);
  public channel2 = new PulseChannel(this.audio.channel2, 64, true);
  public channel3 = new WaveChannel(this.audio.channel3);
  public channel4 = new NoiseChannel(this.audio.channel4);

  public constructor(
    private systemCounter: SystemCounter,
    private audio: WebAudio
  ) {}

  public reset() {
    this.channel1.reset();
    this.channel2.reset();
    this.channel3.reset();
    this.channel4.reset();

    this.divApu = 0;
    this.lastDividerBit = false;
    this.nr51 = 0;
  }

  public getSoundPanning() {
    return this.nr51;
  }

  public setSoundPanning(data: number) {
    const onBits = (this.nr51 ^ data) & data;
    const offBits = (this.nr51 ^ data) & ~data;

    if (onBits & (1 << 0)) this.connectCH1Right(true);
    else if (offBits & (1 << 0)) this.connectCH1Right(false);

    if (onBits & (1 << 1)) this.connectCH2Right(true);
    else if (offBits & (1 << 1)) this.connectCH2Right(false);

    if (onBits & (1 << 2)) this.connectCH3Right(true);
    else if (offBits & (1 << 2)) this.connectCH3Right(false);

    if (onBits & (1 << 3)) this.connectCH4Right(true);
    else if (offBits & (1 << 3)) this.connectCH4Right(false);

    if (onBits & (1 << 4)) this.connectCH1Left(true);
    else if (offBits & (1 << 4)) this.connectCH1Left(false);

    if (onBits & (1 << 5)) this.connectCH2Left(true);
    else if (offBits & (1 << 5)) this.connectCH2Left(false);

    if (onBits & (1 << 6)) this.connectCH3Left(true);
    else if (offBits & (1 << 6)) this.connectCH3Left(false);

    if (onBits & (1 << 7)) this.connectCH4Left(true);
    else if (offBits & (1 << 7)) this.connectCH4Left(false);

    this.nr51 = data;
  }

  private on = false;

  public turnOn() {
    this.on = true;
    this.audio.turnOn();
  }

  public turnOff() {
    this.on = false;
    this.audio.turnOff();
  }

  public isOn() {
    return this.on;
  }

  public tick() {
    const dividerBit = this.getDividerBit();

    const isFallingEdge = this.lastDividerBit && !dividerBit;
    if (isFallingEdge) {
      this.divApu = wrappingIncrementByte(this.divApu);

      if (this.divApu % SOUND_LENGTH_RATE === 0) {
        this.channel1.lengthIncrementTick();
        this.channel2.lengthIncrementTick();
        this.channel3.lengthIncrementTick();
        this.channel4.lengthIncrementTick();

        if (this.divApu % PERIOD_SWEEP_RATE === 0) {
          this.channel1.periodSweepTick();

          if (this.divApu % ENVELOPE_SWEEP_RATE === 0) {
            this.channel1.envelopeSweepTick();
            this.channel2.envelopeSweepTick();
            this.channel4.envelopeSweepTick();
          }
        }
      }
    }

    this.lastDividerBit = dividerBit;
  }

  private getDividerBit() {
    return testBit(this.systemCounter.getValue(), APU_DIV_TRIGGER_BIT);
  }

  public readWaveRAM(offset: number) {
    return this.channel3.wave[offset];
  }

  public writeWaveRAM(offset: number, data: number) {
    this.channel3.wave[offset] = data;
    this.channel3.waveChanged = true;
  }

  public connectCH1Left(value: boolean) {
    if (value) {
      this.audio.channel1.connect(this.audio.left);
    } else {
      this.audio.channel1.disconnect(this.audio.left);
    }
  }

  public connectCH1Right(value: boolean) {
    if (value) {
      this.audio.channel1.connect(this.audio.right);
    } else {
      this.audio.channel1.disconnect(this.audio.right);
    }
  }

  public connectCH2Left(value: boolean) {
    if (value) {
      this.audio.channel2.connect(this.audio.left);
    } else {
      this.audio.channel2.disconnect(this.audio.left);
    }
  }

  public connectCH2Right(value: boolean) {
    if (value) {
      this.audio.channel2.connect(this.audio.right);
    } else {
      this.audio.channel2.disconnect(this.audio.right);
    }
  }

  public connectCH3Left(value: boolean) {
    if (value) {
      this.audio.channel3.connect(this.audio.left);
    } else {
      this.audio.channel3.disconnect(this.audio.left);
    }
  }

  public connectCH3Right(value: boolean) {
    if (value) {
      this.audio.channel3.connect(this.audio.right);
    } else {
      this.audio.channel3.disconnect(this.audio.right);
    }
  }

  public connectCH4Left(value: boolean) {
    if (value) {
      this.audio.channel4.connect(this.audio.left);
    } else {
      this.audio.channel4.disconnect(this.audio.left);
    }
  }

  public connectCH4Right(value: boolean) {
    if (value) {
      this.audio.channel4.connect(this.audio.right);
    } else {
      this.audio.channel4.disconnect(this.audio.right);
    }
  }

  public getMasterVolume() {
    return this.nr50;
  }

  public setMasterVolume(data: number) {
    this.audio.left.gain.value = ((data >> 4) & 7) / 7;
    this.audio.right.gain.value = (data & 7) / 7;
    this.nr50 = data;
  }
}
