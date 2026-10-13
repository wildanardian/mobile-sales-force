import { useEffect, useRef } from 'react';
import Button from '../../components/ui/Button';

interface Props {
  title: string;
  description?: string;
  confirmLabel: string;
  tone: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

// Dialog konfirmasi memakai <dialog> bawaan: fokus terkunci di dalamnya dan Esc menutup.
// Komponen ini dipasang hanya selama dialog perlu tampil.
export default function ConfirmDialog({ title, description, confirmLabel, tone, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-dialog-title"
      aria-describedby={description != null ? 'confirm-dialog-description' : undefined}
      // Esc memicu `cancel`; dicegah agar penutupan tetap lewat state induk
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      className="m-auto w-[calc(100%-36px)] max-w-sm rounded-xl bg-white p-4 shadow-xl backdrop:bg-black/40"
    >
      <h2 id="confirm-dialog-title" className="text-base font-bold text-gray-900">
        {title}
      </h2>
      {description != null && (
        <p id="confirm-dialog-description" className="mt-1.5 text-sm text-gray-600">
          {description}
        </p>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <Button variant="outline" className="text-sm!" onClick={onCancel}>
          Batal
        </Button>
        <Button variant={tone === 'danger' ? 'danger' : 'primary'} className="text-sm!" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
