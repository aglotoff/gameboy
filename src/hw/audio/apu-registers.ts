import { getLSB, getMSB, makeWord } from "../../utils";
import { APU, APUChannels } from "./apu";
import { EnvelopeOptions } from "./envelope-channel";

export class APURegisters {
  public constructor(private apu: APU, private channels: APUChannels) {}

  public get nr10() {
    const options = this.channels[0].getPeriodSweepOptions();

    let data = 0x80;

    data |= options.pace << 4;
    data |= options.direction === -1 ? 0x8 : 0;
    data |= options.step;

    return data;
  }

  public set nr10(data: number) {
    if (!this.apu.isOn()) return;

    this.channels[0].setPeriodSweepOptions({
      pace: (data >> 4) & 0x7,
      direction: data & 0x8 ? -1 : 1,
      step: data & 0x7,
    });
  }

  public get nr11() {
    let data = 0x3f;
    data |= this.channels[0].getWaveDuty() << 6;
    return data;
  }

  public set nr11(data: number) {
    if (!this.apu.isOn()) return;

    this.channels[0].setWaveDuty((data >> 6) & 0x3);
    this.channels[0].setLengthTimer(data & 0x3f);
  }

  public get nr12() {
    return convertEnvelopeOptionsToBits(this.channels[0].getEnvelopeOptions());
  }

  public set nr12(data: number) {
    if (!this.apu.isOn()) return;

    this.channels[0].setEnvelopeOptions(convertBitsToEnvelopeOptions(data));
  }

  public get nr13() {
    return 0xff;
  }

  public set nr13(data: number) {
    if (!this.apu.isOn()) return;
    setPeriodLSB(this.channels[0], data);
  }

  public get nr14() {
    let data = 0xbf;
    data |= this.channels[0].getLengthEnable() ? 0x40 : 0;
    return data;
  }

  public set nr14(data: number) {
    if (!this.apu.isOn()) return;

    setPeriodMSB(this.channels[0], data);

    this.channels[0].setLengthEnable((data & 0x40) !== 0);

    if (data & (1 << 7)) {
      this.channels[0].trigger();
    }
  }

  public get nr21() {
    let data = 0x3f;
    data |= this.channels[1].getWaveDuty() << 6;
    return data;
  }

  public set nr21(data: number) {
    if (!this.apu.isOn()) return;

    this.channels[1].setWaveDuty((data >> 6) & 0x3);
    this.channels[1].setLengthTimer(data & 0x3f);
  }

  public get nr22() {
    return convertEnvelopeOptionsToBits(this.channels[1].getEnvelopeOptions());
  }

  public set nr22(data: number) {
    if (!this.apu.isOn()) return;

    this.channels[1].setEnvelopeOptions(convertBitsToEnvelopeOptions(data));
  }

  public get nr23() {
    return 0xff;
  }

  public set nr23(data: number) {
    if (!this.apu.isOn()) return;

    setPeriodLSB(this.channels[1], data);
  }

  public get nr24() {
    let data = 0xbf;
    data |= this.channels[1].getLengthEnable() ? 0x40 : 0;
    return data;
  }

  public set nr24(data: number) {
    if (!this.apu.isOn()) return;

    setPeriodMSB(this.channels[1], data);

    this.channels[1].setLengthEnable((data & 0x40) !== 0);

    if (data & (1 << 7)) {
      this.channels[1].trigger();
    }
  }

  public get nr30() {
    let data = 0x7f;
    if (this.channels[2].isDACEnabled()) data |= 0x80;
    return data;
  }

  public set nr30(data: number) {
    if (!this.apu.isOn()) return;
    this.channels[2].setDACEnabled((data & 0x80) !== 0);
  }

  public get nr31() {
    return 0xff;
  }

  public set nr31(data: number) {
    if (!this.apu.isOn()) return;
    // FIXME: ticks up to 256!!!!
    this.channels[2].setLengthTimer(data);
  }

  public get nr32() {
    return (
      ([0, 1, 0.5, 0.25].indexOf(this.channels[2].getVolume()) << 5) | 0x9f
    );
  }

  public set nr32(data: number) {
    if (!this.apu.isOn()) return;
    this.channels[2].setVolume([0, 1, 0.5, 0.25][(data >> 5) & 0x3]);
  }

  public get nr33() {
    return 0xff;
  }

  public set nr33(data: number) {
    if (!this.apu.isOn()) return;
    setPeriodLSB(this.channels[2], data);
  }

  public get nr34() {
    let data = 0xbf;
    data |= this.channels[2].getLengthEnable() ? 0x40 : 0;
    return data;
  }

  public set nr34(data: number) {
    if (!this.apu.isOn()) return;

    setPeriodMSB(this.channels[2], data);

    this.channels[2].setLengthEnable((data & 0x40) !== 0);

    if (data & (1 << 7)) {
      this.channels[2].trigger();
    }
  }

  public get nr41() {
    return 0xff;
  }

  public set nr41(data: number) {
    if (!this.apu.isOn()) return;
    this.channels[3].setLengthTimer(data & 0x3f);
  }

  public get nr42() {
    return convertEnvelopeOptionsToBits(this.channels[3].getEnvelopeOptions());
  }

  public set nr42(data: number) {
    if (!this.apu.isOn()) return;
    this.channels[3].setEnvelopeOptions(convertBitsToEnvelopeOptions(data));
  }

  public get nr43() {
    const options = this.channels[3].getRandomOptions();

    let data = options.clockShift << 4;
    data |= options.lfsrWidth === 7 ? 0x8 : 0;
    data |= options.clockDivider;

    return data;
  }

  public set nr43(data: number) {
    if (!this.apu.isOn()) return;

    this.channels[3].setRandomOptions({
      clockShift: data >> 4,
      lfsrWidth: (data & 0x8) !== 0 ? 7 : 15,
      clockDivider: data & 0x7,
    });
  }

  public get nr44() {
    let data = 0xbf;
    data |= this.channels[3].getLengthEnable() ? 0x40 : 0;
    return data;
  }

  public set nr44(data: number) {
    if (!this.apu.isOn()) return;

    this.channels[3].setLengthEnable((data & 0x40) !== 0);

    if (data & (1 << 7)) {
      this.channels[3].trigger();
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
      data |= 1 << 7;

      for (let i = 0; i < this.channels.length; i++) {
        if (this.channels[i].isOn()) data |= 1 << i;
      }
    }

    return data;
  }

  public set nr52(data: number) {
    if ((data & (1 << 7)) !== 0 && !this.apu.isOn()) {
      this.apu.turnOn();
    } else if ((data & (1 << 7)) === 0 && this.apu.isOn()) {
      this.nr50 = 0;
      this.nr51 = 0;

      this.channels[0].reset();
      this.channels[1].reset();
      this.channels[2].reset();
      this.channels[3].reset();

      this.apu.turnOff();
    }
  }

  public readWaveRAM(offset: number) {
    return this.channels[2].readWaveRAM(offset);
  }

  public writeWaveRAM(offset: number, data: number) {
    this.channels[2].writeWaveRAM(offset, data);
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
