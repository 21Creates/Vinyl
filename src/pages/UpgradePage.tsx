import { useEffect, useState, useCallback } from 'react';
import { Upload, Check, Loader2, Music, Crown, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

type AppSettings = {
  premium_price: string;
  bank_details: string;
  payment_instructions: string;
};

const DEFAULT_SETTINGS: AppSettings = {
  premium_price: '$9.99/month',
  bank_details: '',
  payment_instructions: 'Transfer to the bank account above, then upload a screenshot of the receipt.',
};

export function UpgradePage({ onBack }: { onBack: () => void }) {
  const { profile } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    const { data } = await supabase.from('app_settings').select('settings').maybeSingle();
    if (data?.settings) {
      setSettings({
        premium_price: data.settings.premium_price ?? DEFAULT_SETTINGS.premium_price,
        bank_details: data.settings.bank_details ?? '',
        payment_instructions: data.settings.payment_instructions ?? DEFAULT_SETTINGS.payment_instructions,
      });
    }
    setLoading(false);
  }, []);

  const loadExistingPayment = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('payments')
      .select('id, status')
      .eq('user_id', profile.id)
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setSubmitted(true);
    }
  }, [profile]);

  useEffect(() => {
    loadSettings();
    loadExistingPayment();
  }, [loadSettings, loadExistingPayment]);

  const handleUpload = async () => {
    if (!file || !profile) return;
    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, file);

      if (uploadError) throw new Error(uploadError.message);

      const { data: paymentData, error: insertError } = await supabase
        .from('payments')
        .insert({
          user_id: profile.id,
          amount: settings.premium_price,
          proof_path: filePath,
          status: 'pending',
        })
        .select('id')
        .single();

      if (insertError || !paymentData) throw new Error(insertError?.message ?? 'Failed to submit');

      setSubmitted(true);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload proof');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-groove-gray animate-spin" />
      </div>
    );
  }

  if (profile?.tier === 'premium') {
    return (
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-32">
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <button onClick={onBack} className="flex items-center gap-2 text-groove-gray hover:text-sleeve-cream transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex flex-col items-center py-16 text-center">
            <Crown className="w-16 h-16 text-white-label-acid mb-4" />
            <h1 className="text-2xl font-bold text-sleeve-cream mb-2">You're Premium</h1>
            <p className="text-sm text-groove-gray">Full access to all tracks and offline listening.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide pb-32">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <button onClick={onBack} className="flex items-center gap-2 text-groove-gray hover:text-sleeve-cream transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Crown className="w-8 h-8 text-white-label-acid" />
          <h1 className="text-3xl font-bold text-sleeve-cream">Upgrade to Premium</h1>
        </div>

        <div className="bg-groove-charcoal rounded-xl p-5 mb-6 border border-groove-charcoal">
          <h2 className="text-sm font-bold text-sleeve-cream mb-3 flex items-center gap-2">
            <Music className="w-4 h-4 text-white-label-acid" /> What you get
          </h2>
          <ul className="space-y-2 text-sm text-groove-gray">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-white-label-acid flex-shrink-0" /> Access to all premium tracks
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-white-label-acid flex-shrink-0" /> 50 tracks available offline (up from 3)
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-white-label-acid flex-shrink-0" /> Join private rooms without approval
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-white-label-acid flex-shrink-0" /> Support unreleased music
            </li>
          </ul>
        </div>

        <div className="bg-vinyl-black rounded-xl p-5 mb-6 border border-white-label-acid/30">
          <p className="text-xs text-groove-gray font-mono uppercase tracking-widest mb-1">Price</p>
          <p className="text-3xl font-bold text-white-label-acid">{settings.premium_price}</p>
        </div>

        <div className="bg-groove-charcoal rounded-xl p-5 mb-6">
          <h2 className="text-sm font-bold text-sleeve-cream mb-3">How to pay</h2>
          {settings.bank_details ? (
            <div className="bg-vinyl-black rounded-lg p-4 mb-3 border border-groove-charcoal">
              <pre className="text-sm text-sleeve-cream whitespace-pre-wrap font-mono">{settings.bank_details}</pre>
            </div>
          ) : (
            <p className="text-sm text-groove-gray mb-3">Bank details not yet configured by admin.</p>
          )}
          <p className="text-sm text-groove-gray">{settings.payment_instructions}</p>
        </div>

        {submitted ? (
          <div className="bg-groove-charcoal rounded-xl p-5 border border-white-label-acid/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white-label-acid/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-white-label-acid" />
              </div>
              <div>
                <p className="text-sm font-bold text-sleeve-cream">Proof submitted</p>
                <p className="text-xs text-groove-gray">Your payment is pending review. You'll be upgraded once approved.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-groove-charcoal rounded-xl p-5">
            <h2 className="text-sm font-bold text-sleeve-cream mb-3">Upload payment proof</h2>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-groove-gray/50 rounded-lg p-6 cursor-pointer hover:border-white-label-acid/50 transition-colors">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-groove-gray mb-2" />
              <p className="text-sm text-groove-gray">
                {file ? file.name : 'Tap to select a screenshot or receipt'}
              </p>
            </label>
            {file && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full mt-4 bg-white-label-acid text-vinyl-black font-bold py-3 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading ? 'Uploading...' : 'Submit proof'}
              </button>
            )}
            {error && <p className="text-xs text-test-pressing-red mt-3">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
