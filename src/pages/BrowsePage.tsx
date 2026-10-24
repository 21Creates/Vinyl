import { useEffect, useState, useMemo } from 'react';
import { Search, Play, Lock, Music2, Download, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePlayer, canPlayTrack, fetchTracks, type Track } from '@/context/PlayerContext';
import { useOffline } from '@/context/OfflineContext';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function BrowsePage() {
  const { profile } = useAuth();
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const { isCached, toggleOffline, isSaving, error: offlineError } = useOffline();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'free' | 'premium'>('all');

  useEffect(() => {
    fetchTracks().then(({ data, error: err }) => {
      if (err) {
        setError(err);
      } else if (data) {
        setTracks(data);
      }
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return tracks.filter((t) => {
      const matchesSearch =
        search === '' ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.artist.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || t.tier === filter;
      return matchesSearch && matchesFilter;
    });
  }, [tracks, search, filter]);

  const handlePlay = (track: Track) => {
    if (!canPlayTrack(track, profile)) return;
    playTrack(track, filtered);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm font-mono text-groove-gray lowercase tracking-widest">loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <p className="text-sm text-test-pressing-red">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide pb-32">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <h1 className="text-3xl font-bold text-sleeve-cream mb-6">Browse</h1>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-groove-gray" />
          <input
            type="text"
            placeholder="Search tracks or artists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-groove-charcoal text-sleeve-cream rounded-lg pl-10 pr-4 py-3 text-sm border border-groove-charcoal focus:border-white-label-acid focus:outline-none transition-colors placeholder:text-groove-gray"
          />
        </div>

        <div className="flex gap-2 mb-4">
          {(['all', 'free', 'premium'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                filter === f
                  ? 'bg-white-label-acid text-vinyl-black'
                  : 'bg-groove-charcoal text-groove-gray hover:text-sleeve-cream'
              }`
            }
          >
            {f}
          </button>
        </div>

        {offlineError && (
          <p className="text-xs text-test-pressing-red mb-3">{offlineError}</p>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Music2 className="w-12 h-12 text-groove-gray mb-4" />
            <p className="text-sm text-groove-gray">No tracks found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              const playable = canPlayTrack(track, profile);
              const cached = isCached(track.id);
              const saving = isSaving === track.id;

              return (
                <div
                  key={track.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    isCurrent ? 'bg-groove-charcoal' : 'hover:bg-groove-charcoal/50'
                  }`
                }
                >
                  <button
                    onClick={() => {
                      if (isCurrent) {
                        togglePlay();
                      } else {
                        handlePlay(track);
                      }
                    }}
                    disabled={!playable}
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: isCurrent && isPlaying ? '#DFFF3F' : '#1B1917',
                      color: isCurrent && isPlaying ? '#0D0C0B' : '#DFFF3F',
                      border: '1px solid #3a3733',
                    }}
                  >
                    {isCurrent && isPlaying ? (
                      <span className="text-xs font-bold">||</span>
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-sleeve-cream truncate">{track.title}</p>
                      {track.tier === 'premium' && (
                        <span className="flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-white-label-acid/20 text-white-label-acid">
                          PREMIUM
                        </span>
                      )}
                      {cached && (
                        <span className="flex-shrink-0 text-[10px] font-medium text-white-label-acid flex items-center gap-0.5">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-groove-gray truncate">{track.artist}</p>
                  </div>

                  {playable && (
                    <button
                      onClick={() => toggleOffline(track)}
                      disabled={saving}
                      className={`flex-shrink-0 p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                        cached
                          ? 'text-white-label-acid hover:text-sleeve-cream'
                          : 'text-groove-gray hover:text-sleeve-cream'
                      }`
                      title={cached ? 'Available offline in Vinyl' : 'Make available offline in Vinyl'}
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {!playable && (
                    <Lock className="w-4 h-4 text-groove-gray flex-shrink-0" />
                  )}

                  <span className="text-xs text-groove-gray font-mono flex-shrink-0">
                    {formatDuration(track.duration_seconds)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
