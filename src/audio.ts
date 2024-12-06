export class WebAudio {
  private audioContext = new AudioContext();

  public channel1 = new WebAudioChannel(this.audioContext);
  public channel2 = new WebAudioChannel(this.audioContext);
  public channel3 = new WebWaveChannel(this.audioContext);
  public channel4 = new WebNoiseChannel(this.audioContext);

  public left = this.audioContext.createGain();
  public right = this.audioContext.createGain();

  private merger = this.audioContext.createChannelMerger(2);

  public constructor() {
    this.left.gain.value = 1;
    this.left.connect(this.merger, 0, 0);

    this.right.gain.value = 1;
    this.right.connect(this.merger, 0, 1);

    this.merger.connect(this.audioContext.destination);

    // this.channel1.connect(this.left);
    // this.channel1.connect(this.right);

    // this.channel2.connect(this.left);
    // this.channel2.connect(this.right);

    // this.channel3.connect(this.left);
    // this.channel3.connect(this.right);

    // this.channel4.connect(this.left);
    // this.channel4.connect(this.right);
  }

  public turnOn() {
    this.audioContext.resume();
  }

  public turnOff() {
    this.audioContext.suspend();
  }

  private getChannel(no: number) {
    switch (no) {
      case 0:
        return this.channel1;
      case 1:
        return this.channel2;
      case 2:
        return this.channel3;
      case 3:
        return this.channel4;
    }
  }

  public connectChannelLeft(chan: number) {
    this.getChannel(chan)!.connect(this.left);
  }

  public connectChannelRight(chan: number) {
    this.getChannel(chan)!.connect(this.right);
  }

  public disconnectChannelLeft(chan: number) {
    this.getChannel(chan)!.disconnect(this.left);
  }

  public disconnectChannelRight(chan: number) {
    this.getChannel(chan)!.disconnect(this.right);
  }
}

export interface IAudioChannel {
  setVolume(volume: number): void;
}

export class WebWaveChannel implements IAudioChannel {
  private oscillator: OscillatorNode;
  private gainNode: GainNode;

  public constructor(private audioContext: AudioContext) {
    this.oscillator = audioContext.createOscillator();
    this.oscillator.frequency.value = 0;

    this.gainNode = audioContext.createGain();
    this.gainNode.gain.value = 0;

    this.oscillator.connect(this.gainNode);

    this.oscillator.start();
  }

  public connect(destination: GainNode) {
    this.gainNode.connect(destination);
  }

  public disconnect(destination: GainNode) {
    this.gainNode.disconnect(destination);
  }

  public setWave(ram: Uint8Array) {
    const x: number[] = [];

    for (let i = 0; i < ram.length; i++) {
      const hi = (ram[i] >> 4) & 0xf;
      const lo = ram[i] & 0xf;

      x[i * 16] = hi;
      x[i * 16 + 1] = hi;
      x[i * 16 + 2] = hi;
      x[i * 16 + 3] = hi;
      x[i * 16 + 4] = hi;
      x[i * 16 + 5] = hi;
      x[i * 16 + 6] = hi;
      x[i * 16 + 7] = hi;
      x[i * 16 + 8] = lo;
      x[i * 16 + 9] = lo;
      x[i * 16 + 10] = lo;
      x[i * 16 + 11] = lo;
      x[i * 16 + 12] = lo;
      x[i * 16 + 13] = lo;
      x[i * 16 + 14] = lo;
      x[i * 16 + 15] = lo;
    }

    const result = fft(x);

    const real = result.map((c) => c.getReal());
    const imag = result.map((c) => c.getImag());

    const wave = this.audioContext.createPeriodicWave(real, imag);

    this.oscillator.setPeriodicWave(wave);
  }

  public setPeriod(period: number) {
    this.oscillator.frequency.value = 65536 / (2048 - period);
  }

  public setVolume(volume: number) {
    this.gainNode.gain.value = volume && volume / 10;
  }
}

class Complex {
  public constructor(private real: number, private imag: number) {}

  public getReal() {
    return this.real;
  }

  public getImag() {
    return this.imag;
  }

  public plus(b: Complex) {
    return new Complex(this.real + b.real, this.imag + b.imag);
  }

  public minus(b: Complex) {
    return new Complex(this.real - b.real, this.imag - b.imag);
  }

  public times(b: Complex) {
    const real = this.real * b.real - this.imag * b.imag;
    const imag = this.real * b.imag + this.imag * b.real;
    return new Complex(real, imag);
  }
}

function fft(x: number[]): Complex[] {
  const n = x.length;

  if (n == 1) return [new Complex(x[0], 0)];

  const even: number[] = [];
  for (let k = 0; k < n / 2; k++) {
    even.push(x[k * 2]);
  }
  const evenFFT = fft(even);

  const odd: number[] = [];
  for (let k = 0; k < n / 2; k++) {
    odd.push(x[k * 2 + 1]);
  }
  const oddFFT = fft(odd);

  const y: Complex[] = [];
  for (let k = 0; k < n / 2; k++) {
    const kth = (-2 * k * Math.PI) / n;
    const wk = new Complex(Math.cos(kth), Math.sin(kth));
    y[k] = evenFFT[k].plus(wk.times(oddFFT[k]));
    y[k + n / 2] = evenFFT[k].minus(wk.times(oddFFT[k]));
  }
  return y;
}

export class WebAudioChannel implements IAudioChannel {
  private static waves: Partial<Record<number, PeriodicWave>> = {};

  private oscillator: OscillatorNode;
  private gainNode: GainNode;

  public constructor(private audioContext: AudioContext) {
    this.oscillator = audioContext.createOscillator();
    this.oscillator.setPeriodicWave(this.getPeriodicWave(0.125));
    this.oscillator.frequency.value = 0;

    this.gainNode = audioContext.createGain();
    this.gainNode.gain.value = 0;

    this.oscillator.connect(this.gainNode);

    this.oscillator.start();
  }

  public connect(destination: GainNode) {
    this.gainNode.connect(destination);
  }

  public disconnect(destination: GainNode) {
    this.gainNode.disconnect(destination);
  }

  private getPeriodicWave(duty: number) {
    const existingWave = WebAudioChannel.waves[duty];
    if (existingWave != null) {
      return existingWave;
    }

    const real = new Float32Array(256);
    const imag = new Float32Array(256); // defaults to zeros

    for (let n = 1; n < 256; n++) {
      real[n] = (2 * Math.sin(Math.PI * n * duty)) / (Math.PI * n);
    }

    const wave = this.audioContext.createPeriodicWave(real, imag);
    WebAudioChannel.waves[duty] = wave;
    return wave;
  }

  public setWaveDuty(waveDuty: number) {
    this.oscillator.setPeriodicWave(
      this.getPeriodicWave([0.125, 0.25, 0.5, 0.75][waveDuty])
    );
  }

  public setWave(ram: Uint8Array) {
    const x: number[] = [];

    for (let i = 0; i < ram.length; i++) {
      const hi = (ram[i] >> 4) & 0xf;
      const lo = ram[i] & 0xf;

      x[i * 16] = hi;
      x[i * 16 + 1] = hi;
      x[i * 16 + 2] = hi;
      x[i * 16 + 3] = hi;
      x[i * 16 + 4] = hi;
      x[i * 16 + 5] = hi;
      x[i * 16 + 6] = hi;
      x[i * 16 + 7] = hi;
      x[i * 16 + 8] = lo;
      x[i * 16 + 9] = lo;
      x[i * 16 + 10] = lo;
      x[i * 16 + 11] = lo;
      x[i * 16 + 12] = lo;
      x[i * 16 + 13] = lo;
      x[i * 16 + 14] = lo;
      x[i * 16 + 15] = lo;
    }

    const result = fft(x);

    const real = result.map((c) => c.getReal());
    const imag = result.map((c) => c.getImag());

    const wave = this.audioContext.createPeriodicWave(real, imag);

    this.oscillator.setPeriodicWave(wave);
  }

  public setPeriod(period: number) {
    this.oscillator.frequency.value = 131072 / (2048 - period);
  }

  public setVolume(volume: number) {
    this.gainNode.gain.value = volume && volume / 150;
  }
}

export class WebNoiseChannel implements IAudioChannel {
  private source: AudioBufferSourceNode;
  private gainNode: GainNode;

  private buffer7: AudioBuffer | null = null;
  private buffer15: AudioBuffer | null = null;

  private createBuffer(width: number) {
    let lfsr = 127;

    const myArrayBuffer = this.audioContext.createBuffer(
      1,
      width === 7 ? 128 : 32768,
      524288
    );

    for (let channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
      const nowBuffering = myArrayBuffer.getChannelData(channel);

      for (let i = 0; i < myArrayBuffer.length; i++) {
        let bit15 = lfsr % 2 !== (lfsr >> 1) % 2 ? 1 : 0;

        lfsr &= ~(1 << 15);
        lfsr |= bit15 << 15;

        if (width === 7) {
          lfsr &= ~(1 << 7);
          lfsr |= bit15 << 7;
        }

        lfsr >>= 1;

        nowBuffering[i] = bit15 ? 1 : -0.5;
      }
    }

    return myArrayBuffer;
  }

  public constructor(private audioContext: AudioContext) {
    this.source = audioContext.createBufferSource();

    this.gainNode = audioContext.createGain();
    this.gainNode.gain.value = 0;

    this.source.connect(this.gainNode);

    this.source.start();
  }

  public connect(destination: GainNode) {
    this.gainNode.connect(destination);
  }

  public disconnect(destination: GainNode) {
    this.gainNode.disconnect(destination);
  }

  public setRate(rate: number) {
    this.source.playbackRate.value = rate;
  }

  public setWidth(width: number) {
    this.source.stop();
    this.source.disconnect(this.gainNode);
    this.source = this.audioContext.createBufferSource();

    switch (width) {
      case 7:
        if (this.buffer7 == null) {
          this.buffer7 = this.createBuffer(7);
        }
        this.source.buffer = this.buffer7;
        break;
      case 15:
        if (this.buffer15 == null) {
          this.buffer15 = this.createBuffer(15);
        }
        this.source.buffer = this.buffer15;
        break;
    }

    this.source.loop = true;
    this.source.connect(this.gainNode);
    this.source.start();
  }

  public setVolume(volume: number) {
    this.gainNode.gain.value = volume && volume / 150;
  }
}
