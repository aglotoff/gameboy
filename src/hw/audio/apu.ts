import { WebAudio } from "../../audio";
import { testBit, wrappingIncrementByte } from "../../utils";
import { SystemCounter } from "../system-counter";
import { NoiseChannel } from "./noise-channel";
import { PulseChannel } from "./pulse-channel";
import { WaveChannel } from "./wave-channel";

// https://gbdev.gg8.se/wiki/articles/Gameboy_sound_hardware

// TODO: 13 in double-speed mode
const APU_DIV_TRIGGER_BIT = 12;

export type APUChannels = [
  PulseChannel,
  PulseChannel,
  WaveChannel,
  NoiseChannel
];

export class APU {
  private divApu = 0;
  private lastDividerBit = false;
  private frameSequencerStep = 0;

  private nr50 = 0;
  private nr51 = 0;

  public constructor(
    private systemCounter: SystemCounter,
    private audio: WebAudio,
    private channels: APUChannels
  ) {}

  public reset() {
    this.channels[0].reset();
    this.channels[1].reset();
    this.channels[2].reset();
    this.channels[3].reset();

    this.divApu = 0;
    this.lastDividerBit = false;
    this.nr51 = 0;
  }

  public getSoundPanning() {
    return this.nr51;
  }

  public setSoundPanning(data: number) {
    const enabledBitMask = (this.nr51 ^ data) & data;
    const disabledBitMask = (this.nr51 ^ data) & ~data;

    for (let i = 0; i < 4; i++) {
      if (enabledBitMask & (1 << i)) {
        this.audio.connectChannelRight(i);
      } else if (disabledBitMask & (1 << i)) {
        this.audio.disconnectChannelRight(i);
      }
    }

    for (let i = 4; i < 8; i++) {
      if (enabledBitMask & (1 << i)) {
        this.audio.connectChannelLeft(i - 4);
      } else if (disabledBitMask & (1 << i)) {
        this.audio.disconnectChannelLeft(i - 4);
      }
    }

    this.nr51 = data;
  }

  private on = false;

  public turnOn() {
    this.frameSequencerStep = 0;
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

      this.channels[0].frameSequencerTick(this.frameSequencerStep);
      this.channels[1].frameSequencerTick(this.frameSequencerStep);
      this.channels[2].frameSequencerTick(this.frameSequencerStep);
      this.channels[3].frameSequencerTick(this.frameSequencerStep);

      this.frameSequencerStep = (this.frameSequencerStep + 1) % 8;
    }

    this.lastDividerBit = dividerBit;
  }

  private getDividerBit() {
    return testBit(this.systemCounter.getValue(), APU_DIV_TRIGGER_BIT);
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
