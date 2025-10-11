/**
 * T127 - AudioController: Global audio playback management
 * Prevents overlapping TTS playback and manages audio state
 */

export type AudioState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface AudioControllerConfig {
  debounceMs?: number;
  onStateChange?: (state: AudioState) => void;
  onPlaybackComplete?: () => void;
  onError?: (error: Error) => void;
}

class AudioController {
  private currentAudio: HTMLAudioElement | null = null;
  private currentUrl: string | null = null;
  private state: AudioState = 'idle';
  private lastPlayTime: number = 0;
  private config: AudioControllerConfig;

  constructor(config: AudioControllerConfig = {}) {
    this.config = {
      debounceMs: 500,
      ...config,
    };
  }

  /**
   * Stop any currently playing audio
   */
  stop(): void {
    if (this.currentAudio) {
      console.log('[TTS] Cancelled previous playback');
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    // Also stop browser speech synthesis if active
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    this.setState('idle');
  }

  /**
   * Play audio from a URL with debouncing and state management
   */
  async play(
    audioUrl: string,
    options: {
      onPlay?: () => void;
      onEnd?: () => void;
      onError?: (error: Error) => void;
    } = {}
  ): Promise<void> {
    // Debounce: prevent double-plays within configured time window
    const now = Date.now();
    if (now - this.lastPlayTime < (this.config.debounceMs || 500)) {
      console.warn(
        `[TTS] Debounced: ${now - this.lastPlayTime}ms since last play (< ${this.config.debounceMs}ms)`
      );
      return;
    }

    // Stop any existing playback
    this.stop();

    // Update timestamp
    this.lastPlayTime = now;
    this.currentUrl = audioUrl;

    // Create new audio element
    const audio = new Audio(audioUrl);
    this.currentAudio = audio;
    this.setState('loading');

    // Event listeners
    audio.onloadeddata = () => {
      console.log('[TTS] Audio loaded, ready to play');
    };

    audio.onplay = () => {
      console.log('[TTS] Playback started');
      this.setState('playing');
      options.onPlay?.();
    };

    audio.onended = () => {
      console.log('[TTS] Playback ended');
      this.setState('idle');
      this.currentAudio = null;
      this.currentUrl = null;
      options.onEnd?.();
      this.config.onPlaybackComplete?.();
    };

    audio.onerror = (event) => {
      const error = new Error('Audio playback failed');
      console.error('[TTS] Playback error:', error);
      this.setState('error');
      this.currentAudio = null;
      options.onError?.(error);
      this.config.onError?.(error);
    };

    // Start playback
    try {
      await audio.play();
    } catch (playError: any) {
      if (playError.name === 'NotAllowedError') {
        console.warn('[TTS] Autoplay blocked by browser');
        this.setState('paused');
        throw playError; // Let caller handle autoplay blocks
      } else {
        const error =
          playError instanceof Error ? playError : new Error(String(playError));
        console.error('[TTS] Play error:', error);
        this.setState('error');
        throw error;
      }
    }
  }

  /**
   * Replay the current audio (if any)
   */
  async replay(): Promise<void> {
    if (this.currentAudio && this.currentUrl) {
      this.currentAudio.currentTime = 0;
      try {
        await this.currentAudio.play();
        console.log('[TTS] Replaying current audio');
      } catch (error) {
        console.error('[TTS] Replay failed:', error);
        throw error;
      }
    } else {
      console.warn('[TTS] No audio to replay');
    }
  }

  /**
   * Get current audio state
   */
  getState(): AudioState {
    return this.state;
  }

  /**
   * Get current audio URL (if playing)
   */
  getCurrentUrl(): string | null {
    return this.currentUrl;
  }

  /**
   * Check if audio is currently playing
   */
  isPlaying(): boolean {
    return this.state === 'playing';
  }

  /**
   * Update state and notify listeners
   */
  private setState(newState: AudioState): void {
    if (this.state !== newState) {
      console.log(`[TTS] State: ${this.state} → ${newState}`);
      this.state = newState;
      this.config.onStateChange?.(newState);
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stop();
    this.currentAudio = null;
    this.currentUrl = null;
  }
}

// Export singleton instance for use across the app
export const audioController = new AudioController();

// Export class for custom instances if needed
export default AudioController;
