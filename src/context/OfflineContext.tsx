import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import {
  saveTrackOffline,
  removeTrackOffline,
  getCachedTrackIds,
  getCachedTrackBlob,
  getCachedTrackCount,
} from '@/lib/offlineCache';
import type { Track } from '@/context/PlayerContext';

type OfflineSettings = {
  free_offline_cap: number;
  premium_offline_cap: number;
};

type OfflineContextValue = {
  cachedTrackIds: Set<string>;
  isSaving: string | null;
  error: string | null;
  toggleOffline: (track: Track) => Promise<void>;
  isCached: (trackId: string) => boolean;
  getOfflineUrl: (trackId: string, originalUrl: string) => Promise<string>;
  offlineCap: number;
  refreshSettings: () => Promise<void>;
};

const OfflineContext = createContext<OfflineContextValue | undefined>(undefined);

const DEFAULT_SETTINGS: OfflineSettings = {
  free_offline_cap: 3,
  premium_offline_cap: 50,
};

export function OfflineProvider({
  children,
  tier,
}: {
  children: ReactNode;
  tier: 'free' | 'premium';
}) {
  const [cachedTrackIds, setCachedTrackIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<OfflineSettings>(DEFAULT_SETTINGS);

  const refreshSettings = useCallback(async () => {
    const { data } = await supabase.from('app_settings').select('settings').maybeSingle();
    if (data?.settings) {
      setSettings({
        free_offline_cap: data.settings.free_offline_cap ?? 3,
        premium_offline_cap: data.settings.premium_offline_cap ?? 50,
      });
    }
  }, []);

  useEffect(() => {
    getCachedTrackIds().then(setCachedTrackIds).catch(() => {});
    refreshSettings();
  }, [refreshSettings]);

  const offlineCap = tier === 'premium' ? settings.premium_offline_cap : settings.free_offline_cap;

  const toggleOffline = useCallback(
    async (track: Track) => {
      setError(null);

      if (cachedTrackIds.has(track.id)) {
        try {
          await removeTrackOffline(track.id);
          const newSet = new Set(cachedTrackIds);
          newSet.delete(track.id);
          setCachedTrackIds(newSet);
        } catch {
          setError('Failed to remove from offline storage.');
        }
        return;
      }

      const count = await getCachedTrackCount();
      if (count >= offlineCap) {
        setError(
          `Offline limit reached (${offlineCap}). Remove a track to add another.`,
        );
        return;
      }

      setIsSaving(track.id);
      try {
        await saveTrackOffline({
          id: track.id,
          title: track.title,
          artist: track.artist,
          audio_path: track.audio_path,
        });
        const newSet = new Set(cachedTrackIds);
        newSet.add(track.id);
        setCachedTrackIds(newSet);
      } catch {
        setError('Failed to save track for offline listening.');
      } finally {
        setIsSaving(null);
      }
    },
    [cachedTrackIds, offlineCap],
  );

  const isCached = useCallback((trackId: string) => cachedTrackIds.has(trackId), [cachedTrackIds]);

  const getOfflineUrl = useCallback(
    async (trackId: string, originalUrl: string): Promise<string> => {
      if (cachedTrackIds.has(trackId)) {
        const blob = await getCachedTrackBlob(trackId);
        if (blob) return URL.createObjectURL(blob);
      }
      return originalUrl;
    },
    [cachedTrackIds],
  );

  return (
    <OfflineContext.Provider
      value={{
        cachedTrackIds,
        isSaving,
        error,
        toggleOffline,
        isCached,
        getOfflineUrl,
        offlineCap,
        refreshSettings,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOffline must be used within OfflineProvider');
  return ctx;
}
