import { useEffect, useState, useCallback } from 'react';
import { Check, X, Loader2, Shield, Clock, Users, Settings as SettingsIcon, Copy, Check as CheckIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

type Payment = {
  id: string;
  user_id: string;
  amount: string;
  proof_path: string | null;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

type AdminTab = 'payments' | 'settings' | 'apps-script';

export function AdminPage({ onBack }: { onBack: () => void }) {
  const { profile } = useAuth();
  const [tab, setTab] = useState<AdminTab>('payments');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadPayments = useCallback(async () => {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .order('submitted_at', { ascending: false });
    setPayments((data as Payment[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleApprove = async (paymentId: string) => {
    setActionId(paymentId);
    const { error } = await supabase.rpc('admin_update_payment_status', {
      p_id: paymentId,
      p_status: 'approved',
    });
    if (!error) {
      await loadPayments();
    }
    setActionId(null);
  };

  const handleReject = async (paymentId: string) => {
    setActionId(paymentId);
    const { error } = await supabase.rpc('admin_update_payment_status', {
      p_id: paymentId,
      p_status: 'rejected',
    });
    if (!error) {
      await loadPayments();
    }
    setActionId(null);
  };

  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const reviewedPayments = payments.filter((p) => p.status !== 'pending');

  const appsScriptTemplate = `/**\n * Vinyl Payment Webhook — Google Apps Script Template\n *\n * 1. Deploy this as a Web App (Execute as: Me, Access: Anyone)\n * 2. Copy the deployment URL into Vinyl Admin > Settings > webhook_url\n * 3. Set VINYL_WEBHOOK_SECRET in both Apps Script and Supabase Edge Function secrets\n *\n * When a payment is confirmed (e.g. via Stripe, PayPal, or manual review),\n * call sendWebhook() with the user_id and payment_id.\n */\n\nconst VINYL_WEBHOOK_SECRET = 'YOUR_SECRET_HERE';\nconst VINYL_WEBHOOK_ENDPOINT = 'YOUR_SUPABASE_EDGE_FUNCTION_URL';\n\nfunction signBody(body, secret) {\n  var rawBytes = Utilities.computeHmacSha256Signature(body, secret);\n  return rawBytes.map(function(b) {\n    return ('0' + (b & 0xFF).toString(16)).slice(-2);\n  }).join('');\n}\n\nfunction sendWebhook(userId, paymentId, status) {\n  var payload = JSON.stringify({\n    user_id: userId,\n    payment_id: paymentId,\n    status: status\n  });\n\n  var signature = signBody(payload, VINYL_WEBHOOK_SECRET);\n\n  var response = UrlFetchApp.fetch(VINYL_WEBHOOK_ENDPOINT, {\n    method: 'post',\n    contentType: 'application/json',\n    headers: {\n      'X-Vinyl-Signature': signature\n    },\n    payload: payload,\n    muteHttpExceptions: true\n  });\n\n  Logger.log('Webhook response: ' + response.getResponseCode());\n  Logger.log(response.getContentText());\n}\n\nfunction onPaymentConfirmed(userId, paymentId) {\n  sendWebhook(userId, paymentId, 'approved');\n}\n\nfunction onPaymentRejected(userId, paymentId) {\n  sendWebhook(userId, paymentId, 'rejected');\n}`;

  const copyTemplate = () => {
    navigator.clipboard.writeText(appsScriptTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!profile?.is_admin) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-test-pressing-red">Admin access required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-groove-gray animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide pb-32">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-white-label-acid" />
          <h1 className="text-3xl font-bold text-sleeve-cream">Admin</h1>
        </div>

        <div className="flex gap-2 mb-6">
          {([
            { id: 'payments' as const, label: 'Payments', icon: Clock },
            { id: 'settings' as const, label: 'Settings', icon: SettingsIcon },
            { id: 'apps-script' as const, label: 'Webhook', icon: Copy },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                tab === id
                  ? 'bg-white-label-acid text-vinyl-black'
                  : 'bg-groove-charcoal text-groove-gray hover:text-sleeve-cream'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {tab === 'payments' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-sleeve-cream mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-white-label-acid" />
                Pending Approval ({pendingPayments.length})
              </h2>
              {pendingPayments.length === 0 ? (
                <p className="text-sm text-groove-gray">No pending payments.</p>
              ) : (
                <div className="space-y-2">
                  {pendingPayments.map((payment) => (
                    <div key={payment.id} className="bg-groove-charcoal rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-sleeve-cream">{payment.amount}</p>
                          <p className="text-xs text-groove-gray">
                            {new Date(payment.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(payment.id)}
                            disabled={actionId === payment.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white-label-acid text-vinyl-black text-xs font-bold disabled:opacity-50"
                          >
                            {actionId === payment.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(payment.id)}
                            disabled={actionId === payment.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-test-pressing-red/20 text-test-pressing-red text-xs font-bold disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      </div>
                      {payment.proof_path && (
                        <a
                          href={`https://supabase.co/storage/v1/object/payment-proofs/${payment.proof_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-white-label-acid hover:underline"
                        >
                          View proof
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {reviewedPayments.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-sleeve-cream mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-groove-gray" />
                  Reviewed ({reviewedPayments.length})
                </h2>
                <div className="space-y-2">
                  {reviewedPayments.slice(0, 10).map((payment) => (
                    <div key={payment.id} className="bg-groove-charcoal/50 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-sleeve-cream">{payment.amount}</p>
                        <p className="text-xs text-groove-gray">
                          {payment.status} — {payment.reviewed_at ? new Date(payment.reviewed_at).toLocaleDateString() : ''}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        payment.status === 'approved'
                          ? 'bg-white-label-acid/20 text-white-label-acid'
                          : 'bg-test-pressing-red/20 text-test-pressing-red'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div className="bg-groove-charcoal rounded-xl p-5">
            <p className="text-sm text-groove-gray">
              Full settings management arrives in Phase 9. For now, manage payments above and use the Webhook tab for the Apps Script template.
            </p>
          </div>
        )}

        {tab === 'apps-script' && (
          <div className="space-y-4">
            <div className="bg-groove-charcoal rounded-xl p-5">
              <h2 className="text-sm font-bold text-sleeve-cream mb-2">Google Apps Script Webhook Template</h2>
              <p className="text-xs text-groove-gray mb-4">
                Copy this into a Google Apps Script project, deploy as a Web App, and paste the deployment URL into Settings.
                The HMAC signature must match the VINYL_WEBHOOK_SECRET in Supabase.
              </p>
              <button
                onClick={copyTemplate}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white-label-acid text-vinyl-black text-xs font-bold mb-4"
              >
                {copied ? <CheckIcon className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy template'}
              </button>
              <pre className="bg-vinyl-black rounded-lg p-4 text-xs text-sleeve-cream font-mono overflow-x-auto max-h-96 overflow-y-auto">
                {appsScriptTemplate}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
