import { useEffect, useState, useCallback } from 'react';
import { Check, X, Loader2, Shield, Clock, Users, Settings as SettingsIcon, Copy, Check as CheckIcon, Save, History } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

type Payment = { id: string; user_id: string; amount: string; proof_path: string | null; status: string; submitted_at: string; reviewed_at: string | null; reviewed_by: string | null };
type AppSettings = { premium_price: string; bank_details: string; payment_instructions: string; webhook_url: string; free_offline_cap: number; premium_offline_cap: number; rooms_enabled: boolean; discovery_enabled: boolean; rooms_free_join_requires_approval: boolean; rooms_rejection_cooldown_days: number; webhook_secret_configured: boolean };
type AuditEntry = { id: string; changed_by: string | null; changed_at: string; old_values: Record<string, unknown>; new_values: Record<string, unknown> };

const DEFAULT_SETTINGS: AppSettings = { premium_price: '$9.99/month', bank_details: '', payment_instructions: 'Transfer to the bank account above, then upload a screenshot of the receipt.', webhook_url: '', free_offline_cap: 3, premium_offline_cap: 50, rooms_enabled: true, discovery_enabled: true, rooms_free_join_requires_approval: true, rooms_rejection_cooldown_days: 7, webhook_secret_configured: false };

type AdminTab = 'payments' | 'settings' | 'audit' | 'apps-script';

export function AdminPage({ onBack }: { onBack: () => void }) {
  const { profile } = useAuth();
  const [tab, setTab] = useState<AdminTab>('payments');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);

  const loadPayments = useCallback(async () => { const { data } = await supabase.from('payments').select('*').order('submitted_at', { ascending: false }); setPayments((data as Payment[]) ?? []); setLoading(false); }, []);
  const loadSettings = useCallback(async () => { const { data } = await supabase.from('app_settings').select('settings').maybeSingle(); if (data?.settings) { const s = { ...DEFAULT_SETTINGS, ...data.settings } as AppSettings; setSettings(s); setSavedSettings(s); } setSettingsLoading(false); }, []);
  const loadAuditLog = useCallback(async () => { const { data } = await supabase.from('settings_audit_log').select('*').order('changed_at', { ascending: false }).limit(20); setAuditLog((data as AuditEntry[]) ?? []); setAuditLoading(false); }, []);

  useEffect(() => { loadPayments(); loadSettings(); }, [loadPayments, loadSettings]);

  const isDirty = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  const handleSaveSettings = async () => {
    setSaving(true); setSettingsError(null);
    const { error } = await supabase.rpc('admin_update_settings', { p_settings: settings });
    if (error) { setSettingsError(error.message); } else { setSavedSettings(settings); setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 2000); await loadAuditLog(); }
    setSaving(false);
  };
  const handleResetSettings = () => { setSettings(savedSettings); setSettingsError(null); };
  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => { setSettings((prev) => ({ ...prev, [key]: value })); };
  const handleApprove = async (paymentId: string) => { setActionId(paymentId); const { error } = await supabase.rpc('admin_update_payment_status', { p_id: paymentId, p_status: 'approved' }); if (!error) await loadPayments(); setActionId(null); };
  const handleReject = async (paymentId: string) => { setActionId(paymentId); const { error } = await supabase.rpc('admin_update_payment_status', { p_id: paymentId, p_status: 'rejected' }); if (!error) await loadPayments(); setActionId(null); };

  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const reviewedPayments = payments.filter((p) => p.status !== 'pending');

  const appsScriptTemplate = `/**\n * Vinyl Payment Webhook — Google Apps Script Template\n *\n * 1. Deploy this as a Web App (Execute as: Me, Access: Anyone)\n * 2. Copy the deployment URL into Vinyl Admin > Settings > webhook_url\n * 3. Set VINYL_WEBHOOK_SECRET in both Apps Script and Supabase Edge Function secrets\n */\n\nconst VINYL_WEBHOOK_SECRET = 'YOUR_SECRET_HERE';\nconst VINYL_WEBHOOK_ENDPOINT = 'YOUR_SUPABASE_EDGE_FUNCTION_URL';\n\nfunction signBody(body, secret) {\n  var rawBytes = Utilities.computeHmacSha256Signature(body, secret);\n  return rawBytes.map(function(b) { return ('0' + (b & 0xFF).toString(16)).slice(-2); }).join('');\n}\n\nfunction sendWebhook(userId, paymentId, status) {\n  var payload = JSON.stringify({ user_id: userId, payment_id: paymentId, status: status });\n  var signature = signBody(payload, VINYL_WEBHOOK_SECRET);\n  var response = UrlFetchApp.fetch(VINYL_WEBHOOK_ENDPOINT, {\n    method: 'post', contentType: 'application/json',\n    headers: { 'X-Vinyl-Signature': signature },\n    payload: payload, muteHttpExceptions: true\n  });\n  Logger.log('Webhook response: ' + response.getResponseCode());\n}\n\nfunction onPaymentConfirmed(userId, paymentId) { sendWebhook(userId, paymentId, 'approved'); }\nfunction onPaymentRejected(userId, paymentId) { sendWebhook(userId, paymentId, 'rejected'); }\nfunction onPaymentSubmitted(userId, amount) { sendWebhook(userId, null, 'submitted'); }`;

  const copyTemplate = () => { navigator.clipboard.writeText(appsScriptTemplate); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (!profile?.is_admin) { return (<div className="flex-1 flex items-center justify-center"><p className="text-sm text-test-pressing-red">Admin access required.</p></div>); }
  if (loading) { return (<div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 text-groove-gray animate-spin" /></div>); }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide pb-32">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-6"><Shield className="w-8 h-8 text-white-label-acid" /><h1 className="text-3xl font-bold text-sleeve-cream">Admin</h1></div>
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
          {([ { id: 'payments' as const, label: 'Payments', icon: Clock }, { id: 'settings' as const, label: 'Settings', icon: SettingsIcon }, { id: 'audit' as const, label: 'Audit Log', icon: History }, { id: 'apps-script' as const, label: 'Webhook', icon: Copy } ]).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setTab(id); if (id === 'audit' && auditLoading) loadAuditLog(); }} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${tab === id ? 'bg-white-label-acid text-vinyl-black' : 'bg-groove-charcoal text-groove-gray hover:text-sleeve-cream'}`}><Icon className="w-3.5 h-3.5" />{label}</button>
          ))}
        </div>

        {tab === 'payments' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-sleeve-cream mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-white-label-acid" />Pending Approval ({pendingPayments.length})</h2>
              {pendingPayments.length === 0 ? (<p className="text-sm text-groove-gray">No pending payments.</p>) : (
                <div className="space-y-2">{pendingPayments.map((payment) => (
                  <div key={payment.id} className="bg-groove-charcoal rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2"><div><p className="text-sm font-medium text-sleeve-cream">{payment.amount}</p><p className="text-xs text-groove-gray">{new Date(payment.submitted_at).toLocaleDateString()}</p></div><div className="flex gap-2"><button onClick={() => handleApprove(payment.id)} disabled={actionId === payment.id} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white-label-acid text-vinyl-black text-xs font-bold disabled:opacity-50">{actionId === payment.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}Approve</button><button onClick={() => handleReject(payment.id)} disabled={actionId === payment.id} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-test-pressing-red/20 text-test-pressing-red text-xs font-bold disabled:opacity-50"><X className="w-3.5 h-3.5" /> Reject</button></div></div>
                    {payment.proof_path && (<a href={`https://supabase.co/storage/v1/object/payment-proofs/${payment.proof_path}`} target="_blank" rel="noopener noreferrer" className="text-xs text-white-label-acid hover:underline">View proof</a>)}
                  </div>
                ))}</div>
              )}
            </div>
            {reviewedPayments.length > 0 && (
              <div><h2 className="text-sm font-bold text-sleeve-cream mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-groove-gray" />Reviewed ({reviewedPayments.length})</h2><div className="space-y-2">{reviewedPayments.slice(0, 10).map((payment) => (<div key={payment.id} className="bg-groove-charcoal/50 rounded-xl p-3 flex items-center justify-between"><div><p className="text-sm text-sleeve-cream">{payment.amount}</p><p className="text-xs text-groove-gray">{payment.status} — {payment.reviewed_at ? new Date(payment.reviewed_at).toLocaleDateString() : ''}</p></div><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${payment.status === 'approved' ? 'bg-white-label-acid/20 text-white-label-acid' : 'bg-test-pressing-red/20 text-test-pressing-red'}`}>{payment.status}</span></div>))}</div></div>
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div className="space-y-4">
            {settingsLoading ? (<div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 text-groove-gray animate-spin" /></div>) : (<>
              <div className="sticky top-0 z-10 bg-vinyl-black/90 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between border border-groove-charcoal"><div className="flex items-center gap-2">{isDirty ? (<span className="flex items-center gap-1.5 text-xs text-white-label-acid font-medium"><span className="w-2 h-2 rounded-full bg-white-label-acid animate-pulse" />Unsaved changes</span>) : settingsSaved ? (<span className="flex items-center gap-1.5 text-xs text-white-label-acid"><Check className="w-3.5 h-3.5" /> Saved</span>) : (<span className="text-xs text-groove-gray">All changes saved</span>)}</div><div className="flex gap-2">{isDirty && (<button onClick={handleResetSettings} className="px-3 py-1.5 rounded-lg bg-groove-charcoal text-sleeve-cream text-xs font-medium hover:bg-groove-charcoal/70 transition-colors">Reset</button>)}<button onClick={handleSaveSettings} disabled={!isDirty || saving} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white-label-acid text-vinyl-black text-xs font-bold disabled:opacity-50">{saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}Save</button></div></div>
              {settingsError && <p className="text-xs text-test-pressing-red">{settingsError}</p>}
              <div className="bg-groove-charcoal rounded-xl p-5"><h2 className="text-sm font-bold text-sleeve-cream mb-4">Payment</h2><label className="block mb-3"><span className="text-xs text-groove-gray mb-1 block">Premium price</span><input type="text" value={settings.premium_price} onChange={(e) => update('premium_price', e.target.value)} className="w-full bg-vinyl-black text-sleeve-cream rounded-lg px-3 py-2 text-sm border border-groove-charcoal focus:border-white-label-acid focus:outline-none" /></label><label className="block mb-3"><span className="text-xs text-groove-gray mb-1 block">Bank details</span><textarea value={settings.bank_details} onChange={(e) => update('bank_details', e.target.value)} rows={4} className="w-full bg-vinyl-black text-sleeve-cream rounded-lg px-3 py-2 text-sm border border-groove-charcoal focus:border-white-label-acid focus:outline-none resize-none font-mono" placeholder="Bank Name&#10;Account Number&#10;Routing Number" /></label><label className="block"><span className="text-xs text-groove-gray mb-1 block">Payment instructions</span><textarea value={settings.payment_instructions} onChange={(e) => update('payment_instructions', e.target.value)} rows={2} className="w-full bg-vinyl-black text-sleeve-cream rounded-lg px-3 py-2 text-sm border border-groove-charcoal focus:border-white-label-acid focus:outline-none resize-none" /></label></div>
              <div className="bg-groove-charcoal rounded-xl p-5"><h2 className="text-sm font-bold text-sleeve-cream mb-4">Offline Limits</h2><label className="block mb-3"><span className="text-xs text-groove-gray mb-1 block">Free tier offline cap</span><input type="number" value={settings.free_offline_cap} onChange={(e) => update('free_offline_cap', parseInt(e.target.value) || 0)} min={0} className="w-full bg-vinyl-black text-sleeve-cream rounded-lg px-3 py-2 text-sm border border-groove-charcoal focus:border-white-label-acid focus:outline-none" /></label><label className="block"><span className="text-xs text-groove-gray mb-1 block">Premium tier offline cap</span><input type="number" value={settings.premium_offline_cap} onChange={(e) => update('premium_offline_cap', parseInt(e.target.value) || 0)} min={0} className="w-full bg-vinyl-black text-sleeve-cream rounded-lg px-3 py-2 text-sm border border-groove-charcoal focus:border-white-label-acid focus:outline-none" /></label></div>
              <div className="bg-groove-charcoal rounded-xl p-5"><h2 className="text-sm font-bold text-sleeve-cream mb-4">Rooms</h2><label className="flex items-center gap-2 mb-3 cursor-pointer"><input type="checkbox" checked={settings.rooms_enabled} onChange={(e) => update('rooms_enabled', e.target.checked)} className="accent-white-label-acid w-4 h-4" /><span className="text-sm text-sleeve-cream">Rooms enabled</span></label><label className="flex items-center gap-2 mb-3 cursor-pointer"><input type="checkbox" checked={settings.discovery_enabled} onChange={(e) => update('discovery_enabled', e.target.checked)} className="accent-white-label-acid w-4 h-4" /><span className="text-sm text-sleeve-cream">Room discovery enabled</span></label><label className="flex items-center gap-2 mb-3 cursor-pointer"><input type="checkbox" checked={settings.rooms_free_join_requires_approval} onChange={(e) => update('rooms_free_join_requires_approval', e.target.checked)} className="accent-white-label-acid w-4 h-4" /><span className="text-sm text-sleeve-cream">Free users need approval to join</span></label><label className="block"><span className="text-xs text-groove-gray mb-1 block">Rejection cooldown (days)</span><input type="number" value={settings.rooms_rejection_cooldown_days} onChange={(e) => update('rooms_rejection_cooldown_days', parseInt(e.target.value) || 0)} min={0} className="w-full bg-vinyl-black text-sleeve-cream rounded-lg px-3 py-2 text-sm border border-groove-charcoal focus:border-white-label-acid focus:outline-none" /></label></div>
              <div className="bg-groove-charcoal rounded-xl p-5"><h2 className="text-sm font-bold text-sleeve-cream mb-4">Webhook</h2><label className="block mb-3"><span className="text-xs text-groove-gray mb-1 block">Webhook URL (Apps Script deployment)</span><input type="url" value={settings.webhook_url} onChange={(e) => update('webhook_url', e.target.value)} className="w-full bg-vinyl-black text-sleeve-cream rounded-lg px-3 py-2 text-sm border border-groove-charcoal focus:border-white-label-acid focus:outline-none" placeholder="https://script.google.com/macros/s/..." /></label><div className="flex items-center gap-2"><span className={`text-xs px-2 py-1 rounded-full ${settings.webhook_secret_configured ? 'bg-white-label-acid/20 text-white-label-acid' : 'bg-test-pressing-red/20 text-test-pressing-red'}`}>{settings.webhook_secret_configured ? 'Secret configured' : 'Secret not configured'}</span></div></div>
            </>)}
          </div>
        )}

        {tab === 'audit' && (
          <div>{auditLoading ? (<div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 text-groove-gray animate-spin" /></div>) : auditLog.length === 0 ? (<p className="text-sm text-groove-gray">No settings changes recorded.</p>) : (<div className="space-y-2">{auditLog.map((entry) => (<div key={entry.id} className="bg-groove-charcoal rounded-xl p-4"><div className="flex items-center justify-between mb-2"><p className="text-xs text-groove-gray">{entry.changed_by ? `User ${entry.changed_by.slice(0, 8)}` : 'System'}</p><p className="text-xs text-groove-gray">{new Date(entry.changed_at).toLocaleString()}</p></div><div className="text-xs text-sleeve-cream font-mono overflow-x-auto">{Object.keys(entry.new_values).length > 0 && (<p className="text-white-label-acid">Changed: {Object.keys(entry.new_values).join(', ')}</p>)}</div></div>))}</div>)}</div>
        )}

        {tab === 'apps-script' && (
          <div className="bg-groove-charcoal rounded-xl p-5"><h2 className="text-sm font-bold text-sleeve-cream mb-2">Google Apps Script Webhook Template</h2><p className="text-xs text-groove-gray mb-4">Copy this into a Google Apps Script project, deploy as a Web App, and paste the deployment URL into Settings. The HMAC signature must match the VINYL_WEBHOOK_SECRET in Supabase.</p><button onClick={copyTemplate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white-label-acid text-vinyl-black text-xs font-bold mb-4">{copied ? <CheckIcon className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{copied ? 'Copied!' : 'Copy template'}</button><pre className="bg-vinyl-black rounded-lg p-4 text-xs text-sleeve-cream font-mono overflow-x-auto max-h-96 overflow-y-auto">{appsScriptTemplate}</pre></div>
        )}
      </div>
    </div>
  );
}
