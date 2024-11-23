export class WebAudio {
  private audioContext = new AudioContext();

  public channel1 = new AudioChannel(this.audioContext);
  public channel2 = new AudioChannel(this.audioContext);
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

    const real = new Float32Array(128);
    const imag = new Float32Array(128); // defaults to zeros

    for (let n = 1; n < 128; n++) {
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

  public setPeriod(period: number) {
    this.oscillator.frequency.value = 131072 / (2048 - period);
  }

  public setVolume(volume: number) {
    this.gainNode.gain.value = volume / 100;
  }
}
