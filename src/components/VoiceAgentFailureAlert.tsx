import React from 'react';
import { AlertCircle } from 'lucide-react';

type VoiceAgentFailureAlertProps = {
  message: string;
  onRetry: () => void;
  onDismiss: () => void;
};

export const VoiceAgentFailureAlert: React.FC<VoiceAgentFailureAlertProps> = ({
  message,
  onRetry,
  onDismiss,
}) => (
  <div
    role="alert"
    className="mx-4 mt-3 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100"
  >
    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
    <div className="min-w-0 flex-1">
      <p className="font-medium">Voice session needs attention</p>
      <p className="mt-1 text-xs text-rose-100/80">{message}</p>
    </div>
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md border border-rose-300/40 px-2 py-1 text-xs font-medium text-rose-100 transition-colors hover:bg-rose-400/10"
      >
        Retry
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-md px-2 py-1 text-xs font-medium text-rose-100/80 transition-colors hover:bg-rose-400/10 hover:text-rose-50"
      >
        Dismiss
      </button>
    </div>
  </div>
);
