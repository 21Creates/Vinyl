import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { supabase, type Profile } from '@/lib/supabase';

export type Track = {
  id: string;
  title: string;
  artist: string;
  duration_seconds: number;
  audio_path: string;
  tier: 'free' | 'premium';
  is_public: boolean;
  source_note: string;
  created_at: string;
};

type PlayerState = {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
};

type PlayerContextValue = PlayerState & {
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
};

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onDuration = () => setDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      nextRef.current();
    };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onDuration);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onDuration);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, []);

  const playTrack = useCallback((track: Track, newQueue?: Track[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
      const idx = newQueue.findIndex((t) => t.id === track.id);
      setQueueIndex(idx >= 0 ? idx : 0);
    } else if (newQueue === undefined) {
      setQueue([track]);
      setQueueIndex(0);
    }

    setCurrentTrack(track);
    audio.src = track.audio_path;
    audio.play().catch(() => {
      setIsPlaying(false);
    });

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: 'Vinyl — unreleased. first.',
      });
      navigator.mediaSession.setActionHandler('play', () => audio.play());
      navigator.mediaSession.setActionHandler('pause', () => audio.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => prevRef.current());
      navigator.mediaSession.setActionHandler('nexttrack', () => nextRef.current());
    }
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [currentTrack]);

  const next = useCallback(() => {
    if (queueIndex < 0 || queueIndex >= queue.length - 1) return;
    const nextIdx = queueIndex + 1;
    const track = queue[nextIdx];
    setQueueIndex(nextIdx);
    setCurrentTrack(track);
    const audio = audioRef.current;
    if (audio) {
      audio.src = track.audio_path;
      audio.play().catch(() => {});
    }
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: 'Vinyl — unreleased. first.',
      });
    }
  }, [queue, queueIndex]);

  const prev = useCallback(() => {
    if (queueIndex <= 0) return;
    const prevIdx = queueIndex - 1;
    const track = queue[prevIdx];
    setQueueIndex(prevIdx);
    setCurrentTrack(track);
    const audio = audioRef.current;
    if (audio) {
      audio.src = track.audio_path;
      audio.play().catch(() => {});
    }
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: 'Vinyl — unreleased. first.',
      });
    }
  }, [queue, queueIndex]);

  const nextRef = useRef(next);
  const prevRef = useRef(prev);
  nextRef.current = next;
  prevRef.current = prev;

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = vol;
      setVolumeState(vol);
      if (vol > 0) setIsMuted(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.muted = false;
      setIsMuted(false);
    } else {
      audio.muted = true;
      setIsMuted(true);
    }
  }, [isMuted]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        queue,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        playTrack,
        togglePlay,
        next,
        prev,
        seek,
        setVolume,
        toggleMute,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}

export function canPlayTrack(track: Track, profile: Profile | null): boolean {
  if (track.tier === 'free') return true;
  return profile?.tier === 'premium' || profile?.is_admin === true;
}

export async function fetchTracks(): Promise<{ data: Track[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data as Track[], error: null };
}
