import { Check, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import FormField, { inputClass } from '../../components/ui/FormField';
import { cn } from '../../lib/cn';
import type { ApprovalDecision } from '../../types/approval';
import { MAX_REASON } from './constants';

interface Props {
  fieldId: string;
  reason: string;
  onReasonChange: (reason: string) => void;
  error?: string;
  busy: boolean; // ada keputusan yang sedang dikirim: kunci kedua tombol
  loadingDecision: ApprovalDecision | null; // tombol yang sedang memproses kartu ini
  onApprove: () => void;
  onReject: () => void;
}

export default function ApprovalDecisionForm({
  fieldId, reason, onReasonChange, error, busy, loadingDecision, onApprove, onReject,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <FormField label="Alasan" hint="wajib jika reject" htmlFor={fieldId} error={error}>
        <div className="relative">
          <textarea
            id={fieldId}
            value={reason}
            maxLength={MAX_REASON}
            disabled={busy}
            placeholder="Tuliskan alasan penolakan..."
            aria-invalid={error != null}
            onChange={(e) => onReasonChange(e.target.value)}
            className={cn(
              inputClass(error),
              'h-24! resize-none pb-5 pt-2 text-sm! placeholder:text-slate-400 disabled:bg-gray-50',
            )}
          />
          <span
            aria-live="polite"
            className="pointer-events-none absolute bottom-1.5 right-2.5 text-[10px] text-gray-500"
          >
            {reason.length}/{MAX_REASON}
          </span>
        </div>
      </FormField>

      <div className="grid grid-cols-2 gap-2.5">
        <Button className="text-sm!" loading={loadingDecision === 'approved'} disabled={busy} onClick={onApprove}>
          <Check size={17} strokeWidth={2.5} />
          Approve
        </Button>
        <Button
          variant="danger-outline"
          className="text-sm!"
          loading={loadingDecision === 'rejected'}
          disabled={busy}
          onClick={onReject}
        >
          <X size={17} strokeWidth={2.5} />
          Reject
        </Button>
      </div>
    </div>
  );
}
