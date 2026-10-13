import { cn } from '../../lib/cn';

const MAP: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'bg-gray-200 text-gray-700' },
  submitted: { label: 'Submitted', cls: 'bg-blue-100 text-blue-700' },
  pending_approval: { label: 'Pending Approval', cls: 'bg-orange-100 text-orange-700' },
  approved: { label: 'Approved', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700' },
  planned: { label: 'Planned', cls: 'bg-teal-100 text-teal-700' },
  in_progress: { label: 'In Progress', cls: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Completed', cls: 'bg-green-100 text-green-700' },
  unplan: { label: 'Unplan', cls: 'bg-blue-100 text-blue-700' },
  non_target: { label: 'Non Target', cls: 'bg-purple-100 text-purple-700' },
};

export default function StatusBadge({ status, className }: { status: string; className?: string }) {
  const key = status.toLowerCase().replace(/[\s-]+/g, '_');
  const item = MAP[key] ?? { label: status, cls: 'bg-gray-100 text-gray-700' };

  return (
    <span
      className={cn(
        'inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold',
        item.cls,
        className,
      )}
    >
      {item.label}
    </span>
  );
}