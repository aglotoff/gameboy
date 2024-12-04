import { getLSB, getMSB, makeWord } from "../../utils";
import { APU } from "./apu";
import { EnvelopeOptions } from "./envelope-channel";

export class APURegisters {
  public constructor(private apu: APU) {}

  public get nr10() {
    const options = this.apu.channel1.getPeriodSweepOptions();

    let data = 0x80;

    data |= options.pace << 4;
    data |= options.direction === -1 ? 0x8 : 0;
    data |= options.step;

    return data;
  }

  public set nr10(data: number) {
    if (!this.apu.isOn()) return;

    this.apu.channel1.setPeriodSweepOptions({
      pace: (data >> 4) & 0x7,
      direction: data & 0x8 ? -1 : 1,
      step: data & 0x7,
    });
  }

  public get nr11() {
    let data = 0x3f;
    data |= this.apu.channel1.getWaveDuty() << 6;
    return data;
  }

  public set nr11(data: number) {
    if (!this.apu.isOn()) return;

    this.apu.channel1.setWaveDuty((data >> 6) & 0x3);
    this.apu.channel1.setInitialLengthTimer(data & 0x1f);
  }

  public get nr12() {
    return convertEnvelopeOptionsToBits(this.apu.channel1.getEnvelopeOptions());
  }

  public set nr12(data: number) {
    if (!this.apu.isOn()) return;

    this.apu.channel1.setEnvelopeOptions(convertBitsToEnvelopeOptions(data));
  }

  public get nr13() {
    return 0xff;
  }

  public set nr13(data: number) {
    if (!this.apu.isOn()) return;
    setPeriodLSB(this.apu.channel1, data);
  }

  public get nr14() {
    let data = 0xbf;
    data |= this.apu.channel1.getLengthEnable() ? 0x40 : 0;
    return data;
  }

  public set nr14(data: number) {
    if (!this.apu.isOn()) return;

    setPeriodMSB(this.apu.channel1, data);

    this.apu.channel1.setLengthEnable((data & 0x40) !== 0);

    if (data & 0x80) {
      this.apu.channel1.trigger();
    }
  }

  public get nr21() {
    let data = 0x3f;
    data |= this.apu.channel2.getWaveDuty() << 6;
    return data;
  }

  public set nr21(data: number) {
    if (!this.apu.isOn()) return;

    this.apu.channel2.setWaveDuty((data >> 6) & 0x3);
    this.apu.channel2.setInitialLengthTimer(data & 0x1f);
  }

  public get nr22() {
    return convertEnvelopeOptionsToBits(this.apu.channel2.getEnvelopeOptions());
  }

  public set nr22(data: number) {
    if (!this.apu.isOn()) return;

    this.apu.channel2.setEnvelopeOptions(convertBitsToEnvelopeOptions(data));
  }

  public get nr23() {
    return 0xff;
  }

  public set nr23(data: number) {
    if (!this.apu.isOn()) return;

    setPeriodLSB(this.apu.channel2, data);
  }

  public get nr24() {
    let data = 0xbf;
    data |= this.apu.channel2.getLengthEnable() ? 0x40 : 0;
    return data;
  }

  public set nr24(data: number) {
    if (!this.apu.isOn()) return;

    setPeriodMSB(this.apu.channel2, data);

    this.apu.channel2.setLengthEnable((data & 0x40) !== 0);

    if (data & 0x80) {
      this.apu.channel2.trigger();
    }
  }

  public get nr30() {
    let data = 0x7f;
    if (this.apu.channel3.isDACEnabled()) data |= 0x80;
    return data;
  }

  public set nr30(data: number) {
    if (!this.apu.isOn()) return;
    this.apu.channel3.setDACEnabled((data & 0x80) !== 0);
  }

  public get nr31() {
    return 0xff;
  }

  public set nr31(data: number) {
    if (!this.apu.isOn()) return;
    this.apu.channel3.setInitialLengthTimer(data);
  }

  public get nr32() {
    return (
      ([0, 1, 0.5, 0.25].indexOf(this.apu.channel3.getVolume()) << 5) | 0x9f
    );
  }

  public set nr32(data: number) {
    if (!this.apu.isOn()) return;
    this.apu.channel3.setVolume([0, 1, 0.5, 0.25][(data >> 5) & 0x3]);
  }

  public get nr33() {
    return 0xff;
  }

  public set nr33(data: number) {
    if (!this.apu.isOn()) return;
    setPeriodLSB(this.apu.channel3, data);
  }

  public get nr34() {
    let data = 0xbf;
    data |= this.apu.channel3.getLengthEnable() ? 0x40 : 0;
    return data;
  }

  public set nr34(data: number) {
    if (!this.apu.isOn()) return;

    setPeriodMSB(this.apu.channel3, data);

    this.apu.channel3.setLengthEnable((data & 0x40) !== 0);

    if (data & 0x80) {
      this.apu.channel3.trigger();
    }
  }

  public get nr41() {
    return 0xff;
  }

  public set nr41(data: number) {
    if (!this.apu.isOn()) return;
    this.apu.channel4.setInitialLengthTimer(data & 0x1f);
  }

  public get nr42() {
    return convertEnvelopeOptionsToBits(this.apu.channel4.getEnvelopeOptions());
  }

  public set nr42(data: number) {
    if (!this.apu.isOn()) return;
    this.apu.channel4.setEnvelopeOptions(convertBitsToEnvelopeOptions(data));
  }

  public get nr43() {
    const options = this.apu.channel4.getRandomOptions();

    let data = options.clockShift << 4;
    data |= options.lfsrWidth === 7 ? 0x8 : 0;
    data |= options.clockDivider;

    return data;
  }

  public set nr43(data: number) {
    if (!this.apu.isOn()) return;

    this.apu.channel4.setRandomOptions({
      clockShift: data >> 4,
      lfsrWidth: (data & 0x8) !== 0 ? 7 : 15,
      clockDivider: data & 0x7,
    });
  }

  public get nr44() {
    let data = 0xbf;
    data |= this.apu.channel4.getLengthEnable() ? 0x40 : 0;
    return data;
  }

  public set nr44(data: number) {
    if (!this.apu.isOn()) return;

    this.apu.channel4.setLengthEnable((data & 0x40) !== 0);

    if (data & 0x80) {
      this.apu.channel4.trigger();
    }
  }

  public get nr50() {
    return this.apu.getMasterVolume();
  }

  public set nr50(data: number) {
    if (!this.apu.isOn()) return;
    this.apu.setMasterVolume(data);
  }

  public get nr51() {
    return this.apu.getSoundPanning();
  }

  public set nr51(data: number) {
    if (!this.apu.isOn()) return;
    this.apu.setSoundPanning(data);
  }

  public get nr52() {
    let data = 0x70;

    if (this.apu.isOn()) {
      data |= 0x80;

      if (this.apu.channel1.isOn()) data |= 0x01;
      if (this.apu.channel2.isOn()) data |= 0x02;
      if (this.apu.channel3.isOn()) data |= 0x04;
      if (this.apu.channel4.isOn()) data |= 0x08;
    }

    return data;
  }

  public set nr52(data: number) {
    if ((data & 0x80) !== 0 && !this.apu.isOn()) {
      this.apu.turnOn();
    } else if ((data & 0x80) === 0 && this.apu.isOn()) {
      this.nr50 = 0;
      this.nr51 = 0;

      this.apu.channel1.reset();
      this.apu.channel2.reset();
      this.apu.channel3.reset();
      this.apu.channel4.reset();

      this.apu.turnOff();
    }
  }
}

const INITIAL_VOLUME_SHIFT = 4;
const ENVELOPE_SWEEP_PACE_MASK = 0b111;
const ENVELOPE_DIRECTION_PACE_MASK = 0b1000;

function convertEnvelopeOptionsToBits(options: EnvelopeOptions) {
  let data = options.sweepPace;
  data |= options.initialVolume << INITIAL_VOLUME_SHIFT;
  data |= options.direction === 1 ? ENVELOPE_DIRECTION_PACE_MASK : 0;
  return data;
}

function convertBitsToEnvelopeOptions(data: number): EnvelopeOptions {
  return {
    direction: data & ENVELOPE_DIRECTION_PACE_MASK ? 1 : -1,
    sweepPace: data & ENVELOPE_SWEEP_PACE_MASK,
    initialVolume: data >> INITIAL_VOLUME_SHIFT,
  };
}

interface IChannel {
  getPeriod(): number;
  setPeriod(period: number): void;
}

function setPeriodLSB(channel: IChannel, data: number) {
  channel.setPeriod(makeWord(getMSB(channel.getPeriod()), data));
}

function setPeriodMSB(channel: IChannel, data: number) {
  channel.setPeriod(makeWord(data & 0b111, getLSB(channel.getPeriod())));
}
