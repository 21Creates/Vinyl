import { useAuth } from '@/context/AuthContext';
import { AuthPage } from '@/pages/AuthPage';
import { Dashboard } from '@/pages/Dashboard';

export function AppRoutes() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-vinyl-black flex items-center justify-center">
        <div className="animate-fade-in">
          <p className="text-sm font-mono text-groove-gray tracking-widest lowercase">
            loading...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return <Dashboard />;
}
