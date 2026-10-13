import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface Props {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  badge?: ReactNode;   // contoh: <StatusBadge status="draft" />
  action?: ReactNode;  // contoh: <Button variant="outline">Submit</Button>
  footer?: ReactNode;  // contoh: alasan reject
  onClick?: () => void;
  className?: string;
  children?: ReactNode; // baris meta tambahan
}

export default function ListItemCard({
  icon,
  title,
  subtitle,
  badge,
  action,
  footer,
  onClick,
  className,
  children,
}: Props) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border border-gray-100 bg-white p-3 shadow-sm',
        onClick && 'cursor-pointer hover:bg-gray-50',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-gray-900">{title}</p>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          {children && <div className="mt-1 text-xs text-gray-500">{children}</div>}
        </div>
        {(badge || action) && (
          <div className="flex shrink-0 flex-col items-end gap-2">
            {badge}
            {action}
          </div>
        )}
      </div>
      {footer && <div className="mt-2">{footer}</div>}
    </div>
  );
}