import { APU, APURegister } from "./apu";

export class APURegisters {
  public constructor(private apu: APU) {}

  public get nr10() {
    return this.apu.readRegister(APURegister.NR10);
  }

  public set nr10(data: number) {
    this.apu.writeRegister(APURegister.NR10, data);
  }

  public get nr11() {
    return this.apu.readRegister(APURegister.NR11);
  }

  public set nr11(data: number) {
    this.apu.writeRegister(APURegister.NR11, data);
  }

  public get nr12() {
    return this.apu.readRegister(APURegister.NR12);
  }

  public set nr12(data: number) {
    this.apu.writeRegister(APURegister.NR12, data);
  }

  public get nr13() {
    return this.apu.readRegister(APURegister.NR13);
  }

  public set nr13(data: number) {
    this.apu.writeRegister(APURegister.NR13, data);
  }

  public get nr14() {
    return this.apu.readRegister(APURegister.NR14);
  }

  public set nr14(data: number) {
    this.apu.writeRegister(APURegister.NR14, data);
  }

  public get nr21() {
    return this.apu.readRegister(APURegister.NR21);
  }

  public set nr21(data: number) {
    this.apu.writeRegister(APURegister.NR21, data);
  }

  public get nr22() {
    return this.apu.readRegister(APURegister.NR22);
  }

  public set nr22(data: number) {
    this.apu.writeRegister(APURegister.NR22, data);
  }

  public get nr23() {
    return this.apu.readRegister(APURegister.NR23);
  }

  public set nr23(data: number) {
    this.apu.writeRegister(APURegister.NR23, data);
  }

  public get nr24() {
    return this.apu.readRegister(APURegister.NR24);
  }

  public set nr24(data: number) {
    this.apu.writeRegister(APURegister.NR24, data);
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
