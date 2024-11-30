import { WebAudio } from "../../audio";
import { testBit, wrappingIncrementByte } from "../../utils";
import { SystemCounter } from "../system-counter";
import {
  EnvelopeOptions,
  PeriodSweepOptions,
  PulseChannel,
} from "./pulse-channel";
import { WaveChannel } from "./wave-channel";

// TODO: 13 in double-speed mode
const APU_DIV_TRIGGER_BIT = 12;

const SOUND_LENGTH_RATE = 2;
const PERIOD_SWEEP_RATE = 4;
const ENVELOPE_SWEEP_RATE = 8;

export class APU {
  private divApu = 0;
  private lastDividerBit = false;

  private nr51 = 0;

  public channel1 = new PulseChannel(this.audio.channel1);
  public channel2 = new PulseChannel(this.audio.channel2);
  public channel3 = new WaveChannel(this.audio.channel3);

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

  public getCH3Period() {
    return this.channel3.getPeriod();
  }

  public setCH3Period(period: number) {
    this.channel3.setPeriod(period);
  }

  public getCH3LengthEnable() {
    return this.channel3.getLengthEnable();
  }

  public setCH3LengthEnable(enable: boolean) {
    this.channel3.setLengthEnable(enable);
  }

  public triggerCH1() {
    this.channel1.trigger();
  }

  public triggerCH2() {
    this.channel2.trigger();
  }

  public triggerCH3() {
    this.channel3.trigger();
  }

  public isCH3DACEnabled() {
    return this.channel3.isDACEnabled();
  }

  public setCH3DACEnabled(enabled: boolean) {
    this.channel3.setDACEnabled(enabled);
  }

  public setCH3LengthTimer(timer: number) {
    this.channel3.setInitialLengthTimer(timer);
  }

  public getCH3Volume() {
    return this.channel3.getVolume();
  }

  public setCH3Volume(volume: number) {
    this.channel3.setVolume(volume);
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

    if (data & 0x44) {
      this.channel3.unmute();
    } else {
      this.channel3.mute();
    }
  }

  public isCH1On() {
    return this.channel1.isOn();
  }

  public isCH2On() {
    return this.channel2.isOn();
  }

  public isCH3On() {
    return this.channel3.isOn();
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

        if (this.divApu % PERIOD_SWEEP_RATE === 0) {
          this.channel1.periodSweepTick();

          if (this.divApu % ENVELOPE_SWEEP_RATE === 0) {
            this.channel1.envelopeSweepTick();
            this.channel2.envelopeSweepTick();
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
}
