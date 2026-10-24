import { useAuth } from '@/context/AuthContext';

export function Dashboard() {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-vinyl-black flex flex-col items-center justify-center px-6 safe-top safe-bottom">
      <div className="w-full max-w-md animate-fade-in">
        <h1 className="text-4xl font-bold tracking-tight text-sleeve-cream mb-2">
          Welcome, {profile?.display_name || profile?.email?.split('@')[0]}
        </h1>
        <p className="text-sm text-groove-gray mb-8">
          You're signed in to Vinyl.
        </p>

        <div
          className="rounded-2xl p-6 border border-groove-charcoal"
          style={{ backgroundColor: '#1B1917' }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-groove-gray">Account</span>
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full ${
                profile?.tier === 'premium'
                  ? 'bg-white-label-acid text-vinyl-black'
                  : 'bg-groove-charcoal text-sleeve-cream'
              }`}
            >
              {profile?.tier === 'premium' ? 'Premium' : 'Free'}
            </span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-groove-gray">Email</span>
            <span className="text-sm text-sleeve-cream">{profile?.email}</span>
          </div>

          {profile?.is_admin && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-groove-gray">Role</span>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-test-pressing-red text-sleeve-cream">
                Admin
              </span>
            </div>
          )}
        </div>

        <button
          onClick={signOut}
          className="mt-6 w-full text-sm text-groove-gray hover:text-test-pressing-red transition-colors py-3"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
