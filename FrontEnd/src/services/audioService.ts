class AudioService {
  private static instance: AudioService;
  private alarmAudio: HTMLAudioElement | null = null;
  private ambientSounds: Map<string, HTMLAudioElement> = new Map();

  private constructor() {}

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  // --- Alarm methods ---

  playAlarm(src: string = '/sounds/alarm.wav'): void {
    this.stopAlarm();

    this.alarmAudio = new Audio(src);
    this.alarmAudio.loop = true;
    this.alarmAudio.volume = 1.0;

    this.alarmAudio.play().catch((err) => {
      console.warn('[AudioService] Alarm autoplay blocked:', err.message);
    });
  }

  stopAlarm(): void {
    if (this.alarmAudio) {
      this.alarmAudio.pause();
      this.alarmAudio.currentTime = 0;
      this.alarmAudio = null;
    }
  }

  isPlaying(): boolean {
    return this.alarmAudio !== null && !this.alarmAudio.paused;
  }

  // --- Ambient sound methods ---

  playAmbient(id: string, src: string, volume: number = 0.5): void {
    if (this.ambientSounds.has(id)) {
      this.setAmbientVolume(id, volume);
      return;
    }

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = volume;

    audio.play().catch((err) => {
      console.warn(`[AudioService] Ambient "${id}" autoplay blocked:`, err.message);
    });

    this.ambientSounds.set(id, audio);
  }

  stopAmbient(id: string): void {
    const audio = this.ambientSounds.get(id);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      this.ambientSounds.delete(id);
    }
  }

  stopAllAmbient(): void {
    for (const [, audio] of this.ambientSounds) {
      audio.pause();
      audio.currentTime = 0;
    }
    this.ambientSounds.clear();
  }

  setAmbientVolume(id: string, volume: number): void {
    const audio = this.ambientSounds.get(id);
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  isAmbientPlaying(id: string): boolean {
    const audio = this.ambientSounds.get(id);
    return audio !== undefined && !audio.paused;
  }
}

export const audioService = AudioService.getInstance();
