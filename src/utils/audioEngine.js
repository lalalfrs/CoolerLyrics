/**
 * Audio Engine menggunakan Web Audio API.
 * Menghasilkan ambient synth chord progression bertema sinematik/lo-fi
 * sehingga Audio Mode dapat langsung berbunyi merdu tanpa memerlukan file mp3 eksternal,
 * sekaligus mendukung audio element saat user mengunggah file musik mereka sendiri.
 */

class AmbientSynthEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.gainNode = null;
    this.oscillators = [];
    this.intervalId = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.15, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playChord(frequencies, duration = 3.8) {
    if (!this.ctx || !this.isPlaying) return;

    const now = this.ctx.currentTime;
    frequencies.forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      // Filter halus
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(600, now);

      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(0.06, now + 0.8);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(this.gainNode);

      osc.start(now);
      osc.stop(now + duration);
    });
  }

  startAmbientTrack() {
    this.init();
    this.isPlaying = true;

    // Chord progression: Am9 -> Fmaj7 -> Cmaj7 -> Gsus4
    const chords = [
      [220, 261.63, 329.63, 392], // Am9
      [174.61, 220, 261.63, 329.63], // Fmaj7
      [130.81, 196, 261.63, 329.63], // Cmaj7
      [196, 246.94, 293.66, 392], // G
    ];

    let chordIndex = 0;
    this.playChord(chords[chordIndex]);

    this.intervalId = setInterval(() => {
      if (!this.isPlaying) return;
      chordIndex = (chordIndex + 1) % chords.length;
      this.playChord(chords[chordIndex]);
    }, 4000);
  }

  stopAmbientTrack() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }
}

export const synthEngine = new AmbientSynthEngine();
