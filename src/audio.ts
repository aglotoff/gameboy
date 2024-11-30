export class WebAudio {
  private audioContext = new AudioContext();

  public channel1 = new AudioChannel(this.audioContext);
  public channel2 = new AudioChannel(this.audioContext);
  public channel3 = new AudioChannel(this.audioContext);

  public turnOn() {
    this.audioContext.resume();
  }

  public turnOff() {
    this.audioContext.suspend();
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

export class AudioChannel {
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

    this.gainNode.connect(audioContext.destination);

    this.oscillator.start();
  }

  private getPeriodicWave(duty: number) {
    const existingWave = AudioChannel.waves[duty];
    if (existingWave != null) {
      return existingWave;
    }

    const real = new Float32Array(256);
    const imag = new Float32Array(256); // defaults to zeros

    for (let n = 1; n < 256; n++) {
      real[n] = (2 * Math.sin(Math.PI * n * duty)) / (Math.PI * n);
    }

    const wave = this.audioContext.createPeriodicWave(real, imag);
    AudioChannel.waves[duty] = wave;
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

  public setPeriod2(period: number) {
    this.oscillator.frequency.value = 65536 / (2048 - period);
  }

  public setVolume(volume: number) {
    this.gainNode.gain.value = volume && volume / 10;
  }
}
