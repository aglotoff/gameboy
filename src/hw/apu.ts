import { getLSB, getMSB, makeWord, testBit, wrapIncrementByte } from "../utils";
import { PulseChannel } from "./pulse-channel";
import { IDivider } from "./timer";

export enum APURegister {
  NR11,
  NR12,
  NR13,
  NR14,
  NR21,
  NR22,
  NR23,
  NR24,
}

const writeOnlyBitMasks: Record<APURegister, number> = {
  [APURegister.NR11]: 0x1f,
  [APURegister.NR12]: 0x00,
  [APURegister.NR13]: 0x1f,
  [APURegister.NR14]: 0xff,
  [APURegister.NR21]: 0xbf,
  [APURegister.NR22]: 0x00,
  [APURegister.NR23]: 0xff,
  [APURegister.NR24]: 0xbf,
};

export class APU {
  private audioContext = new AudioContext();

  private divApu = 0;
  private lastDividerBit = false;

  private nr51 = 0;
  private nr52 = 0;

  private channel1 = new PulseChannel(this.audioContext);
  private channel2 = new PulseChannel(this.audioContext);

  public constructor(private divider: IDivider) {}

  public readRegister(register: APURegister) {
    let data = 0;

    switch (register) {
      case APURegister.NR12:
        data = this.channel1.getEnvelopeDirection() === 1 ? 0x08 : 0x00;
        data |= this.channel1.getInitialVolume() << 4;
        break;
      case APURegister.NR14:
        if (this.channel1.getLengthEnable()) {
          data |= 0x40;
        }
        break;
      case APURegister.NR22:
        data = this.channel2.getEnvelopeDirection() === 1 ? 0x08 : 0x00;
        data |= this.channel2.getInitialVolume() << 4;
        break;
      case APURegister.NR24:
        if (this.channel2.getLengthEnable()) {
          data |= 0x40;
        }
        break;
    }

    return data | writeOnlyBitMasks[register];
  }

  public writeRegister(register: APURegister, data: number) {
    switch (register) {
      case APURegister.NR11:
        this.channel1.setInitialLengthTimer(data & 0x1f);
        break;
      case APURegister.NR12:
        this.channel1.setEnvelopeDirection(data & 0x8 ? 1 : -1);
        this.channel1.setInitialVolume(data >> 4);
        this.channel1.setEnvelopeSweepPace(data & 0x7);
        break;
      case APURegister.NR13:
        this.channel1.setFrequency(
          makeWord(getMSB(this.channel1.getFrequency()), data)
        );
        break;
      case APURegister.NR14:
        this.channel1.setFrequency(
          makeWord(data & 0x7, getLSB(this.channel1.getFrequency()))
        );
        this.channel1.setLengthEnable((data & 0x40) !== 0);
        if (data & 0x80) {
          this.channel1.trigger();
        }
        break;
      case APURegister.NR21:
        this.channel2.setInitialLengthTimer(data & 0x1f);
        break;
      case APURegister.NR22:
        this.channel2.setEnvelopeDirection(data & 0x8 ? 1 : -1);
        this.channel2.setInitialVolume(data >> 4);
        this.channel2.setEnvelopeSweepPace(data & 0x7);
        break;
      case APURegister.NR23:
        this.channel2.setFrequency(
          makeWord(getMSB(this.channel2.getFrequency()), data)
        );
        break;
      case APURegister.NR24:
        this.channel2.setFrequency(
          makeWord(data & 0x7, getLSB(this.channel2.getFrequency()))
        );
        this.channel2.setLengthEnable((data & 0x40) !== 0);
        if (data & 0x80) {
          this.channel2.trigger();
        }
        break;
    }
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
      this.divApu = wrapIncrementByte(this.divApu);

      if (this.divApu % 2 === 0) {
        this.channel1.lengthIncrementTick();
        this.channel2.lengthIncrementTick();

        if (this.divApu % 4 === 0) {
          // CH1 freq sweep

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
    return testBit(this.divider.getDividerRegister(), 4);
  }
}
