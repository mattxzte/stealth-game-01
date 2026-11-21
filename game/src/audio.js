// Shadow Courier — all sound is synthesized with WebAudio, no audio files.
// A guard's footsteps get louder as it gets closer, so you can hear a patrol
// coming around a corner before you see its cone.

let ctx = null;
let master = null;
let muted = false;

function ensure() {
  if (ctx) return true;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.16;
    master.connect(ctx.destination);
    return true;
  } catch {
    return false;
  }
}

function tone(freq, dur, type, vol, when = 0, slideTo = null) {
  if (!ensure() || muted) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  unlock() {
    ensure();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  },
  setMuted(m) {
    muted = m;
  },
  isMuted() {
    return muted;
  },
  click() {
    tone(660, 0.07, 'triangle', 0.5);
  },
  // A soft tick. `closeness` 0..1 scales the volume: near guards are loud.
  footstep(closeness) {
    if (closeness <= 0.02) return;
    tone(150 + Math.random() * 40, 0.05, 'sine', 0.25 * closeness);
  },
  playerStep() {
    tone(120, 0.04, 'sine', 0.12);
  },
  pickup() {
    tone(880, 0.1, 'triangle', 0.5);
    tone(1318, 0.16, 'triangle', 0.5, 0.08);
  },
  suspicious() {
    tone(392, 0.14, 'square', 0.22);
    tone(392, 0.14, 'square', 0.22, 0.16);
  },
  alert() {
    tone(220, 0.5, 'sawtooth', 0.5, 0, 440);
    tone(440, 0.4, 'sawtooth', 0.35, 0.1, 660);
  },
  caught() {
    tone(330, 0.7, 'sawtooth', 0.5, 0, 110);
    tone(165, 0.9, 'square', 0.3, 0.15, 82);
  },
  levelClear() {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, 'triangle', 0.5, i * 0.11));
  },
  victory() {
    [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => tone(f, 0.25, 'triangle', 0.5, i * 0.13));
  },
  exitOpen() {
    tone(784, 0.12, 'triangle', 0.45);
    tone(1046, 0.2, 'triangle', 0.45, 0.1);
  },
};
