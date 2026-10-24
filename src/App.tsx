import { AuthProvider, useAuth } from '@/context/AuthContext';
import { PlayerProvider } from '@/context/PlayerContext';
import { OfflineProvider } from '@/context/OfflineContext';
import { AppRoutes } from '@/AppRoutes';

function AppShell() {
  const { profile } = useAuth();
  const tier = profile?.tier ?? 'free';

  return (
    <PlayerProvider>
      <OfflineProvider tier={tier}>
        <AppRoutes />
      </OfflineProvider>
    </PlayerProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
