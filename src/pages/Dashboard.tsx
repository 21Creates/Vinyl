import { useState } from 'react';
import { Disc3, Compass, LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePlayer } from '@/context/PlayerContext';
import { BrowsePage } from '@/pages/BrowsePage';
import { NowPlayingBar } from '@/components/NowPlayingBar';

type View = 'browse' | 'profile';

export function Dashboard() {
  const { profile, signOut } = useAuth();
  const { currentTrack } = usePlayer();
  const [view, setView] = useState<View>('browse');

  return (
    <div className="min-h-screen bg-vinyl-black flex flex-col">
      <header className="safe-top safe-left safe-right sticky top-0 z-40 border-b"
        style={{ backgroundColor: '#0D0C0B', borderColor: '#1B1917' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Disc3 className="w-6 h-6 text-white-label-acid" />
            <span className="text-lg font-bold text-sleeve-cream">Vinyl</span>
            <span className="text-[10px] font-mono text-groove-gray ml-1 lowercase hidden sm:inline">
              unreleased. first.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                profile?.tier === 'premium'
                  ? 'bg-white-label-acid text-vinyl-black'
                  : 'bg-groove-charcoal text-sleeve-cream'
              }`}
            >
              {profile?.tier === 'premium' ? 'Premium' : 'Free'}
            </span>
            <button
              onClick={signOut}
              className="text-groove-gray hover:text-test-pressing-red transition-colors p-1"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col">
        {view === 'browse' && <BrowsePage />}
        {view === 'profile' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-md">
              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-groove-charcoal flex items-center justify-center mb-3">
                  <User className="w-8 h-8 text-groove-gray" />
                </div>
                <h2 className="text-xl font-bold text-sleeve-cream">
                  {profile?.display_name || profile?.email?.split('@')[0]}
                </h2>
                <p className="text-sm text-groove-gray">{profile?.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t"
        style={{
          backgroundColor: '#0D0C0B',
          borderColor: '#1B1917',
          paddingBottom: currentTrack ? '0px' : 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-around">
          <button
            onClick={() => setView('browse')}
            className={`flex flex-col items-center gap-1 py-1 px-4 transition-colors ${
              view === 'browse' ? 'text-white-label-acid' : 'text-groove-gray hover:text-sleeve-cream'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] font-medium">Browse</span>
          </button>
          <button
            onClick={() => setView('profile')}
            className={`flex flex-col items-center gap-1 py-1 px-4 transition-colors ${
              view === 'profile' ? 'text-white-label-acid' : 'text-groove-gray hover:text-sleeve-cream'
            }`
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: currentTrack ? '52px' : '0px',
          left: 0,
          right: 0,
          zIndex: 45,
        }}
      >
        <NowPlayingBar />
      </div>
    </div>
  );
}
