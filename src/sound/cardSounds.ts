import { isSoundOn } from './soundPreference';

const RIFFLE_FLICKS = 14;
const RIFFLE_SECONDS = 0.75;
const NOISE_SECONDS = 0.3;
/** Seconds into a flip when the card settles back onto the stack. */
const FLIP_LANDS_AT = 0.62;

let context: AudioContext | null = null;

function noiseBuffer(audio: BaseAudioContext) {
  const buffer = audio.createBuffer(
    1,
    Math.ceil(audio.sampleRate * NOISE_SECONDS),
    audio.sampleRate,
  );
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  return buffer;
}

/** One card edge flicking past: a very short, filtered burst of noise. */
function playBurst(
  audio: BaseAudioContext,
  noise: AudioBuffer,
  at: number,
  options: { filter: BiquadFilterType; frequency: number; level: number; decay: number },
) {
  const source = audio.createBufferSource();
  source.buffer = noise;

  const filter = audio.createBiquadFilter();
  filter.type = options.filter;
  filter.frequency.value = options.frequency;
  filter.Q.value = 0.8;

  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(options.level, at + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + options.decay);

  source.connect(filter).connect(gain).connect(audio.destination);
  source.start(at, Math.random() * (NOISE_SECONDS / 2), options.decay + 0.02);
}

/** Schedules the whole riffle: quick paper flicks that slow down, then the stack settling. */
export function scheduleRiffle(audio: BaseAudioContext, start: number) {
  const noise = noiseBuffer(audio);
  for (let i = 0; i < RIFFLE_FLICKS; i++) {
    const progress = i / (RIFFLE_FLICKS - 1);
    const at = start + Math.pow(progress, 1.35) * RIFFLE_SECONDS + Math.random() * 0.012;
    playBurst(audio, noise, at, {
      filter: 'bandpass',
      frequency: 2600 + Math.random() * 2200,
      level: 0.2 + Math.random() * 0.16,
      decay: 0.05 + Math.random() * 0.03,
    });
  }
  playBurst(audio, noise, start + RIFFLE_SECONDS + 0.09, {
    filter: 'lowpass',
    frequency: 520,
    level: 0.42,
    decay: 0.11,
  });
}

/** A tiny, soft pluck: the small cute note under the paper sound. */
function playPluck(audio: BaseAudioContext, at: number, frequency: number, level: number) {
  const tone = audio.createOscillator();
  tone.type = 'sine';
  tone.frequency.setValueAtTime(frequency, at);
  tone.frequency.exponentialRampToValueAtTime(frequency * 0.82, at + 0.09);

  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(level, at + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.11);

  tone.connect(gain).connect(audio.destination);
  tone.start(at);
  tone.stop(at + 0.13);
}

/** One card flip: a light paper flick, then a soft little tap as it lands. */
export function scheduleFlip(audio: BaseAudioContext, start: number) {
  const noise = noiseBuffer(audio);
  playBurst(audio, noise, start, {
    filter: 'bandpass',
    frequency: 3400,
    level: 0.12,
    decay: 0.05,
  });
  playBurst(audio, noise, start + 0.045, {
    filter: 'bandpass',
    frequency: 2300,
    level: 0.08,
    decay: 0.06,
  });
  playBurst(audio, noise, start + FLIP_LANDS_AT, {
    filter: 'lowpass',
    frequency: 640,
    level: 0.22,
    decay: 0.07,
  });
  playPluck(audio, start + FLIP_LANDS_AT, 880, 0.055);
}

/** Sound is a nice extra, so anything that blocks it is ignored. */
function playSound(schedule: (audio: BaseAudioContext, start: number) => void) {
  if (!isSoundOn()) return;
  try {
    context ??= new AudioContext();
    void context.resume();
    schedule(context, context.currentTime + 0.01);
  } catch {
    // This browser does not allow audio here.
  }
}

export const playShuffleSound = () => playSound(scheduleRiffle);
export const playFlipSound = () => playSound(scheduleFlip);
