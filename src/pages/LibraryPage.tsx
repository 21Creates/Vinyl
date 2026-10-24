import { useEffect, useState } from 'react';
import { Play, Trash2, Music2 } from 'lucide-react';
import { usePlayer, type Track } from '@/context/PlayerContext';
import { useOffline } from '@/context/OfflineContext';
import { getCachedTracks, removeTrackOffline, type CachedTrack } from '@/lib/offlineCache';
import { supabase } from '@/lib/supabase';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function LibraryPage() {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const { toggleOffline, offlineCap, isCached } = useOffline();
  const [cachedTracks, setCachedTracks] = useState<CachedTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackMeta, setTrackMeta] = useState<Record<string, Track>>({});

  useEffect(() => {
    loadCached();
  }, []);

  const loadCached = async () => {
    const cached = await getCachedTracks();
    setCachedTracks(cached);

    if (cached.length > 0) {
      const ids = cached.map((c) => c.trackId);
      const { data } = await supabase
        .from('tracks')
        .select('*')
        .in('id', ids);

      if (data) {
        const map: Record<string, Track> = {};
        for (const t of data as Track[]) {
          map[t.id] = t;
        }
        setTrackMeta(map);
      }
    }
    setLoading(false);
  };

  const handleRemove = async (trackId: string) => {
    const track = trackMeta[trackId];
    if (track) {
      await toggleOffline(track);
    } else {
      await removeTrackOffline(trackId);
    }
    loadCached();
  };

  const handlePlay = (cached: CachedTrack) => {
    const track = trackMeta[cached.trackId];
    if (track) {
      playTrack(track);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm font-mono text-groove-gray lowercase tracking-widest">loading...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide pb-32">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-sleeve-cream">Library</h1>
          <span className="text-xs text-groove-gray font-mono">
            {cachedTracks.length} / {offlineCap} available offline
          </span>
        </div>

        {cachedTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Music2 className="w-12 h-12 text-groove-gray mb-4" />
            <p className="text-sm text-groove-gray">
              No tracks available offline yet.
            </p>
            <p className="text-xs text-groove-gray mt-1">
              Tap the download icon on any track to save it.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {cachedTracks.map((cached) => {
              const track = trackMeta[cached.trackId];
              const isCurrent = currentTrack?.id === cached.trackId;
              const currentlyPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={cached.trackId}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    isCurrent ? 'bg-groove-charcoal' : 'hover:bg-groove-charcoal/50'
                  }`}
                  style={{ backgroundColor: isCurrent ? '#1B1917' : undefined }}
                >
                  <button
                    onClick={() => {
                      if (isCurrent) {
                        togglePlay();
                      } else {
                        handlePlay(cached);
                      }
                    }}
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: currentlyPlaying ? '#DFFF3F' : '#1B1917',
                      color: currentlyPlaying ? '#0D0C0B' : '#DFFF3F',
                      border: '1px solid #3a3733',
                    }}
                  >
                    {currentlyPlaying ? (
                      <span className="text-xs font-bold">||</span>
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sleeve-cream truncate">
                      {track?.title || cached.title}
                    </p>
                    <p className="text-xs text-groove-gray truncate">
                      {track?.artist || cached.artist}
                    </p>
                  </div>

                  <span className="text-xs text-white-label-acid font-mono flex-shrink-0 hidden sm:inline">
                    offline
                  </span>

                  {track && (
                    <span className="text-xs text-groove-gray font-mono flex-shrink-0">
                      {formatDuration(track.duration_seconds)}
                    </span>
                  )}

                  <button
                    onClick={() => handleRemove(cached.trackId)}
                    className="flex-shrink-0 p-1.5 text-groove-gray hover:text-test-pressing-red transition-colors"
                    title="Remove from offline"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
