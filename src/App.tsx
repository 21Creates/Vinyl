import { AuthProvider, useAuth } from '@/context/AuthContext';
import { PlayerProvider } from '@/context/PlayerContext';
import { OfflineProvider } from '@/context/OfflineContext';
import { AppRoutes } from '@/AppRoutes';
import { InstallBanner } from '@/components/InstallBanner';
import { UpdateBanner } from '@/components/UpdateBanner';

function AppShell() {
  const { profile } = useAuth();
  const tier = profile?.tier ?? 'free';

  return (
    <PlayerProvider>
      <OfflineProvider tier={tier}>
        <UpdateBanner />
        <AppRoutes />
        <InstallBanner />
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
