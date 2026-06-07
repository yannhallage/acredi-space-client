let audioContext: AudioContext | null = null;
let isUnlocked = false;

function canUseAudio() {
  return typeof window !== "undefined" && "AudioContext" in window;
}

function getAudioContext() {
  if (!canUseAudio()) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContext();
  }

  return audioContext;
}

export async function unlockNotificationSound() {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  if (context.state === "suspended") {
    await context.resume();
  }

  isUnlocked = true;
}

export function playNotificationSound() {
  const context = getAudioContext();

  if (!context || !isUnlocked || context.state !== "running") {
    return;
  }

  const now = context.currentTime;
  const gain = context.createGain();
  const firstTone = context.createOscillator();
  const secondTone = context.createOscillator();

  gain.connect(context.destination);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

  firstTone.type = "sine";
  firstTone.frequency.setValueAtTime(880, now);
  firstTone.frequency.exponentialRampToValueAtTime(1046.5, now + 0.16);
  firstTone.connect(gain);
  firstTone.start(now);
  firstTone.stop(now + 0.22);

  secondTone.type = "sine";
  secondTone.frequency.setValueAtTime(1318.5, now + 0.12);
  secondTone.connect(gain);
  secondTone.start(now + 0.12);
  secondTone.stop(now + 0.42);
}
