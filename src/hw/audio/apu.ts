import { WebAudio } from "../../audio";
import { testBit, wrappingIncrementByte } from "../../utils";
import { SystemCounter } from "../system-counter";
import {
  EnvelopeOptions,
  PeriodSweepOptions,
  PulseChannel,
} from "./pulse-channel";

export class APU {
  private divApu = 0;
  private lastDividerBit = false;

  private nr51 = 0;
  private nr52 = 0;

  private channel1 = new PulseChannel(this.audio.channel1);
  private channel2 = new PulseChannel(this.audio.channel2);

  public constructor(
    private systemCounter: SystemCounter,
    private audio: WebAudio
  ) {}

  public reset() {
    this.channel1.reset();
    this.channel2.reset();
    this.divApu = 0;
    this.lastDividerBit = false;
    this.nr51 = 0;
    this.nr52 = 0;
  }

  public getCH1Period() {
    return this.channel1.getPeriod();
  }

  public setCH1Period(period: number) {
    this.channel1.setPeriod(period);
  }

  public getCH1LengthEnable() {
    return this.channel1.getLengthEnable();
  }

  public setCH1LengthEnable(enable: boolean) {
    this.channel1.setLengthEnable(enable);
  }

  public getCH1PeriodSweepOptions() {
    return this.channel1.getPeriodSweepOptions();
  }

  public setCH1PeriodSweepOptions(options: PeriodSweepOptions) {
    this.channel1.setPeriodSweepOptions(options);
  }

  public getCH1EnvelopeOptions() {
    return this.channel1.getEnvelopeOptions();
  }

  public setCH1EnvelopeOptions(options: EnvelopeOptions) {
    this.channel1.setEnvelopeOptions(options);
  }

  public getCH1WaveDuty() {
    return this.channel1.getWaveDuty();
  }

  public setCH1WaveDuty(waveDuty: number) {
    this.channel1.setWaveDuty(waveDuty);
  }

  public setCH1LengthTimer(lengthTimer: number) {
    this.channel1.setInitialLengthTimer(lengthTimer);
  }

  public getCH2Period() {
    return this.channel2.getPeriod();
  }

  public setCH2Period(period: number) {
    this.channel2.setPeriod(period);
  }

  public getCH2LengthEnable() {
    return this.channel2.getLengthEnable();
  }

  public setCH2LengthEnable(enable: boolean) {
    this.channel2.setLengthEnable(enable);
  }

  public getCH2EnvelopeOptions() {
    return this.channel2.getEnvelopeOptions();
  }

  public setCH2EnvelopeOptions(options: EnvelopeOptions) {
    this.channel2.setEnvelopeOptions(options);
  }

  public getCH2WaveDuty() {
    return this.channel2.getWaveDuty();
  }

  public setCH2WaveDuty(waveDuty: number) {
    this.channel2.setWaveDuty(waveDuty);
  }

  public setCH2LengthTimer(lengthTimer: number) {
    this.channel2.setInitialLengthTimer(lengthTimer);
  }

  public triggerCH1() {
    this.channel1.trigger();
  }

  public triggerCH2() {
    this.channel2.trigger();
  }

  public getSoundPanning() {
    return this.nr51;
  }

  public setSoundPanning(data: number) {
    this.nr51 = data;

    if (data & 0x11) {
      this.channel1.unmute();
    } else {
      this.channel1.mute();
    }

    if (data & 0x22) {
      this.channel2.unmute();
    } else {
      this.channel2.mute();
    }
  }

  public getAudioMasterControl() {
    return (
      this.nr52 |
      (this.channel2.isOn() ? 0x2 : 0) |
      (this.channel1.isOn() ? 1 : 0)
    );
  }

  public setAudioMasterControl(data: number) {
    const wasOn = (this.nr52 & 0x80) !== 0;
    const isOn = (data & 0x80) !== 0;

    this.nr52 = data & 0x80;

    if (!wasOn && isOn) {
      if (data & 0x11) {
        this.channel1.unmute();
      }
      if (data & 0x22) {
        this.channel2.unmute();
      }
    } else if (wasOn && !isOn) {
      this.channel1.mute();
      this.channel2.mute();
    }
  }

  public tick() {
    const dividerBit = this.getDividerBit();

    const isFallingEdge = this.lastDividerBit && !dividerBit;
    if (isFallingEdge) {
      this.divApu = wrappingIncrementByte(this.divApu);

      if (this.divApu % 2 === 0) {
        this.channel1.lengthIncrementTick();
        this.channel2.lengthIncrementTick();

        if (this.divApu % 4 === 0) {
          this.channel1.periodSweepTick();

          if (this.divApu % 8 === 0) {
            this.channel1.envelopeSweepTick();
            this.channel2.envelopeSweepTick();
          }
        }
      }
    }

    this.lastDividerBit = dividerBit;
  }

  private getDividerBit() {
    return testBit(this.systemCounter.getValue(), 12);
  }
}
