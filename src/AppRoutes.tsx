import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthPage } from '@/pages/AuthPage';
import { Dashboard } from '@/pages/Dashboard';

export function AppRoutes() {
  const { session, loading } = useAuth();
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('invite');
    if (code && code.length >= 10) {
      setInviteCode(code);
    }
  }, []);

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

  return <Dashboard initialInviteCode={inviteCode} />;
}
