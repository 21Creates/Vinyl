import { RefreshCw, X } from 'lucide-react';
import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate';

export function UpdateBanner() {
  const { needsUpdate, applyUpdate, dismiss } = useServiceWorkerUpdate();

  if (!needsUpdate) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-up">
      <div className="bg-white-label-acid text-vinyl-black px-4 py-3 flex items-center gap-3 shadow-lg">
        <RefreshCw className="w-4 h-4 flex-shrink-0" />
        <p className="text-xs font-medium flex-1">A new version of Vinyl is ready.</p>
        <button onClick={applyUpdate} className="px-3 py-1.5 rounded-lg bg-vinyl-black text-white-label-acid text-xs font-bold whitespace-nowrap">
          Refresh
        </button>
        <button onClick={dismiss} className="p-1 rounded-lg hover:bg-vinyl-black/10 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
