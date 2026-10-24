import { AuthProvider } from '@/context/AuthContext';
import { PlayerProvider } from '@/context/PlayerContext';
import { AppRoutes } from '@/AppRoutes';

function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <AppRoutes />
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App;
