import { getLSB, getMSB, makeWord } from "../../utils";
import { APU } from "./apu";

export class APURegisters {
  public constructor(private apu: APU) {}

  public get nr10() {
    const options = this.apu.getCH1PeriodSweepOptions();

    let data = 0x80;

    data |= options.pace << 4;
    data |= options.direction === -1 ? 0x8 : 0;
    data |= options.step;

    return data;
  }

  public set nr10(data: number) {
    this.apu.setCH1PeriodSweepOptions({
      pace: (data >> 4) & 0x3,
      direction: data & 0x8 ? -1 : 1,
      step: data & 0x7,
    });
  }

  public get nr11() {
    let data = 0x3f;
    data |= this.apu.getCH1WaveDuty() << 6;
    return data;
  }

  public set nr11(data: number) {
    this.apu.setCH1WaveDuty((data >> 6) & 0x3);
    this.apu.setCH1LengthTimer(data & 0x1f);
  }

  public get nr12() {
    const options = this.apu.getCH1EnvelopeOptions();

    let data = options.sweepPace;
    data |= options.initialVolume << 4;
    data |= options.direction === 1 ? 0x8 : 1;

    return data;
  }

  public set nr12(data: number) {
    this.apu.setCH1EnvelopeOptions({
      direction: data & 0x8 ? 1 : -1,
      sweepPace: data & 0x7,
      initialVolume: data >> 4,
    });
  }

  public get nr13() {
    return 0xff;
  }

  public set nr13(data: number) {
    this.apu.setCH1Period(makeWord(getMSB(this.apu.getCH1Period()), data));
  }

  public get nr14() {
    let data = 0xbf;
    data |= this.apu.getCH1LengthEnable() ? 0x40 : 0;
    return data;
  }

  public set nr14(data: number) {
    this.apu.setCH1Period(makeWord(data & 7, getLSB(this.apu.getCH1Period())));
    this.apu.setCH1LengthEnable((data & 0x40) !== 0);
    if (data & 0x80) {
      this.apu.triggerCH1();
    }
  }

  public get nr21() {
    let data = 0x3f;
    data |= this.apu.getCH2WaveDuty() << 6;
    return data;
  }

  public set nr21(data: number) {
    this.apu.setCH2WaveDuty((data >> 6) & 0x3);
    this.apu.setCH2LengthTimer(data & 0x1f);
  }

  public get nr22() {
    const options = this.apu.getCH2EnvelopeOptions();

    let data = options.sweepPace;
    data |= options.initialVolume << 4;
    data |= options.direction === 1 ? 0x8 : 1;

    return data;
  }

  public set nr22(data: number) {
    this.apu.setCH2EnvelopeOptions({
      direction: data & 0x8 ? 1 : -1,
      sweepPace: data & 0x7,
      initialVolume: data >> 4,
    });
  }

  public get nr23() {
    return 0xff;
  }

  public set nr23(data: number) {
    this.apu.setCH2Period(makeWord(getMSB(this.apu.getCH2Period()), data));
  }

  public get nr24() {
    let data = 0xbf;
    data |= this.apu.getCH2LengthEnable() ? 0x40 : 0;
    return data;
  }

  public set nr24(data: number) {
    this.apu.setCH2Period(makeWord(data & 7, getLSB(this.apu.getCH2Period())));
    this.apu.setCH2LengthEnable((data & 0x40) !== 0);
    if (data & 0x80) {
      this.apu.triggerCH2();
    }
  }

  public get nr51() {
    return this.apu.getSoundPanning();
  }

  public set nr51(data: number) {
    this.apu.setSoundPanning(data);
  }

  public get nr52() {
    return this.apu.getAudioMasterControl();
  }

  public set nr52(data: number) {
    this.apu.setAudioMasterControl(data);
  }
}
