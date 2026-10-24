import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function NowPlayingBar() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    toggleMute,
  } = usePlayer();

  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 safe-left safe-right safe-bottom z-50">
      <div
        className="border-t"
        style={{ backgroundColor: '#1B1917', borderColor: '#2a2724' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-groove-gray w-8 text-right">
              {formatTime(currentTime)}
            </span>
            <div
              className="flex-1 h-1 rounded-full cursor-pointer relative group"
              style={{ backgroundColor: '#2a2724' }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                seek(pct * duration);
              }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, backgroundColor: '#DFFF3F' }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  left: `calc(${progress}% - 6px)`,
                  backgroundColor: '#DFFF3F',
                }}
              />
            </div>
            <span className="text-[10px] font-mono text-groove-gray w-8">
              {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sleeve-cream truncate">
                {currentTrack.title}
              </p>
              <p className="text-xs text-groove-gray truncate">{currentTrack.artist}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                className="text-groove-gray hover:text-sleeve-cream transition-colors p-1"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: '#DFFF3F', color: '#0D0C0B' }}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" fill="currentColor" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                )}
              </button>
              <button
                onClick={next}
                className="text-groove-gray hover:text-sleeve-cream transition-colors p-1"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleMute}
                className="text-groove-gray hover:text-sleeve-cream transition-colors p-1"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1 accent-white-label-acid cursor-pointer"
                style={{ accentColor: '#DFFF3F' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
