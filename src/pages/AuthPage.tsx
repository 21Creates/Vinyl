import { useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setBusy(false);
      return;
    }

    const result =
      mode === 'login'
        ? await signIn(email, password)
        : await signUp(email, password, displayName || undefined);

    if (result.error) {
      setError(result.error);
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-vinyl-black flex flex-col items-center justify-center px-6 safe-top safe-bottom">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-sleeve-cream select-none">Vinyl</h1>
          <p className="mt-2 text-sm font-mono text-white-label-acid tracking-widest lowercase">
            unreleased. first.
          </p>
        </div>

        <div className="groove-charcoal rounded-2xl p-8 border border-groove-charcoal" style={{ backgroundColor: '#1B1917' }}>
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                mode === 'login'
                  ? 'bg-white-label-acid text-vinyl-black'
                  : 'text-groove-gray hover:text-sleeve-cream'
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                mode === 'signup'
                  ? 'bg-white-label-acid text-vinyl-black'
                  : 'text-groove-gray hover:text-sleeve-cream'
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'signup' && (
              <input
                type="text"
                placeholder="Display name (optional)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-vinyl-black text-sleeve-cream rounded-lg px-4 py-3 text-sm border border-groove-charcoal focus:border-white-label-acid focus:outline-none transition-colors placeholder:text-groove-gray"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-vinyl-black text-sleeve-cream rounded-lg px-4 py-3 text-sm border border-groove-charcoal focus:border-white-label-acid focus:outline-none transition-colors placeholder:text-groove-gray"
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-vinyl-black text-sleeve-cream rounded-lg px-4 py-3 text-sm border border-groove-charcoal focus:border-white-label-acid focus:outline-none transition-colors placeholder:text-groove-gray"
            />

            {error && (
              <p className="text-sm text-test-pressing-red">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-white-label-acid text-vinyl-black rounded-lg py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {busy ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-groove-gray">
          {mode === 'login'
            ? "Don't have an account? "
            : 'Already have an account? '}
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
            }}
            className="text-white-label-acid hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}
