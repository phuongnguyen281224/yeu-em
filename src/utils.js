export function sr(i, s) {
  const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return v - Math.floor(v);
}

let actx = null;
let aTimer = null;
const SCALE = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25];
const MEL = [0, 2, 4, 7, 4, 2, 5, 7, 3, 5, 7, 5, 4, 2, 0, 2];
let mIdx = 0;

export function initAudio() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === 'suspended') actx.resume();
  return actx;
}

export function playNote() {
  if (!actx) return;
  const f = SCALE[MEL[mIdx % MEL.length]];
  mIdx++;
  const t = actx.currentTime;
  [[f, 0.085], [f * 2, 0.032]].forEach(([freq, vol]) => {
    const o = actx.createOscillator(), g = actx.createGain();
    o.connect(g);
    g.connect(actx.destination);
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.1);
    o.start(t);
    o.stop(t + 2.3);
  });
}

export function startMusic() {
  initAudio();
  playNote();
  if (aTimer) clearInterval(aTimer);
  aTimer = setInterval(playNote, 730);
}

export function stopMusic() {
  if (aTimer) clearInterval(aTimer);
}

export function playOpenSound() {
  if (!actx) return;
  const n = actx.sampleRate * 0.25;
  const buf = actx.createBuffer(1, n, actx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.5) * 0.25;
  const src = actx.createBufferSource();
  src.buffer = buf;
  const g = actx.createGain(), f = actx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 280;
  src.connect(f);
  f.connect(g);
  g.connect(actx.destination);
  g.gain.setValueAtTime(0.5, actx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.3);
  src.start();
}
