import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';
import { findByPrefix, firstEnabled, lastEnabled, moveEnabled } from './selectNavigation';
import { useSelectPosition } from './useSelectPosition';

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
  disabled?: boolean;
  hint?: string; // keterangan kecil di kanan opsi, mis. "Sudah ada"
}

export interface SelectProps<T extends string | number = string> {
  id?: string;
  label?: string;
  value: T | null;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  leftIcon?: ReactNode;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
}

const TYPEAHEAD_RESET_MS = 600;

// Select kustom: daftar opsi berupa elemen HTML biasa (bukan <select> native),
// sehingga ikut tertangkap saat berbagi layar. Komponen ini controlled penuh.
export default function Select<T extends string | number = string>({
  id, label, value, onChange, options, placeholder = 'Pilih...', leftIcon,
  disabled = false, error, helperText, className,
}: SelectProps<T>) {
  const autoId = useId();
  const triggerId = id ?? `${autoId}-trigger`;
  const labelId = `${triggerId}-label`;
  const listId = `${triggerId}-list`;
  const messageId = `${triggerId}-message`;
  const optionId = (index: number) => `${listId}-option-${index}`;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ text: '', at: 0 });

  const [openState, setOpenState] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { position, measure } = useSelectPosition(triggerRef, options.length);

  const open = openState && !disabled;
  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;
  const message = error ?? helperText;

  const openPanel = (preferred?: number) => {
    if (disabled || !measure()) return;
    const start = selectedIndex >= 0 && !options[selectedIndex].disabled ? selectedIndex : firstEnabled(options);
    setActiveIndex(preferred ?? start);
    setOpenState(true);
  };

  const closePanel = () => setOpenState(false);

  const choose = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    closePanel();
    triggerRef.current?.focus();
  };

  // Selama terbuka: tutup saat klik di luar, dan ikuti pemicu saat scroll/resize
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!triggerRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        setOpenState(false);
      }
    };
    const reposition = (e: Event) => {
      // scroll di dalam daftar opsi sendiri tidak mengubah posisi panel
      if (e.target instanceof Node && panelRef.current?.contains(e.target)) return;
      if (!measure()) setOpenState(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('scroll', reposition, true); // capture: tangkap scroll di kontainer mana pun
    window.addEventListener('resize', reposition);
    window.visualViewport?.addEventListener('resize', reposition);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
      window.visualViewport?.removeEventListener('resize', reposition);
    };
  }, [open, measure]);

  // Opsi aktif selalu terlihat di dalam daftar
  useEffect(() => {
    if (open && activeIndex >= 0) {
      document.getElementById(`${listId}-option-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
    }
  }, [open, activeIndex, listId]);

  // Type-ahead: huruf yang diketik berdekatan digabung menjadi satu awalan
  const jumpByTyping = (char: string) => {
    const now = Date.now();
    const buffer = typeahead.current;
    buffer.text = now - buffer.at > TYPEAHEAD_RESET_MS ? char : buffer.text + char;
    buffer.at = now;
    // satu huruf: cari mulai setelah opsi aktif, agar huruf yang sama diulang berpindah ke berikutnya
    const from = buffer.text.length === 1 ? activeIndex : activeIndex - 1;
    const match = findByPrefix(options, buffer.text, open ? from : -1);
    if (match < 0) return;
    if (open) setActiveIndex(match);
    else openPanel(match);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const isTyping = e.key.length === 1 && e.key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey;

    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        openPanel();
      } else if (isTyping) {
        jumpByTyping(e.key);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => moveEnabled(options, i, 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => moveEnabled(options, i, -1));
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(firstEnabled(options));
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(lastEnabled(options));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        choose(activeIndex);
        break;
      case 'Escape':
        e.preventDefault();
        closePanel();
        break;
      case 'Tab':
        closePanel(); // tanpa preventDefault: fokus lanjut ke elemen berikutnya
        break;
      default:
        if (isTyping) jumpByTyping(e.key);
    }
  };

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label != null && (
        <label
          id={labelId}
          htmlFor={triggerId}
          className="text-sm font-semibold text-gray-800"
          // klik label hanya memfokuskan pemicu (seperti <select>), tidak membuka panel
          onClick={(e) => {
            e.preventDefault();
            triggerRef.current?.focus();
          }}
        >
          {label}
        </label>
      )}

      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={label != null ? labelId : undefined}
        aria-activedescendant={open && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        aria-invalid={error != null}
        aria-describedby={message != null ? messageId : undefined}
        disabled={disabled}
        onClick={() => (open ? closePanel() : openPanel())}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex min-h-11 w-full items-center gap-2.5 rounded-lg border bg-white px-3 text-left text-sm outline-none transition',
          'focus-visible:ring-2 focus-visible:ring-teal-600',
          'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
          error != null ? 'border-red-500' : 'border-gray-300',
          open && 'ring-2 ring-teal-600',
        )}
      >
        {leftIcon != null && <span className="flex shrink-0 text-slate-500">{leftIcon}</span>}
        <span className={cn('min-w-0 flex-1 truncate', selected == null && 'text-slate-400')}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={2.5}
          aria-hidden="true"
          className={cn('shrink-0 text-slate-700 transition-transform', open && 'rotate-180')}
        />
      </button>

      {message != null && (
        <p id={messageId} className={cn('text-sm', error != null ? 'text-red-600' : 'text-gray-600')}>
          {message}
        </p>
      )}

      {/* Portal ke body: panel tidak terpotong kartu dan berada di atas navigasi bawah */}
      {open && position != null &&
        createPortal(
          <ul
            ref={panelRef}
            id={listId}
            role="listbox"
            aria-labelledby={label != null ? labelId : undefined}
            style={position}
            className="fixed z-50 overflow-y-auto overscroll-contain rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          >
            {options.map((option, index) => {
              const isSelected = index === selectedIndex;
              const isActive = index === activeIndex;
              return (
                <li
                  key={option.value}
                  id={optionId(index)}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled === true}
                  // mousedown dicegah agar fokus tetap di pemicu (opsi tidak pernah mengambil fokus)
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseMove={() => {
                    if (!option.disabled && !isActive) setActiveIndex(index);
                  }}
                  onClick={() => choose(index)}
                  className={cn(
                    'flex min-h-11 items-center gap-2 px-3 text-sm',
                    option.disabled ? 'cursor-not-allowed text-gray-400' : 'cursor-pointer text-gray-900',
                    isSelected && 'font-semibold text-teal-800',
                    isActive ? (isSelected ? 'bg-teal-100' : 'bg-gray-100') : isSelected && 'bg-teal-50',
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {option.hint != null && (
                    <span className="shrink-0 text-xs font-normal text-gray-400">{option.hint}</span>
                  )}
                  {isSelected && <Check size={16} strokeWidth={2.5} aria-hidden="true" className="shrink-0 text-teal-700" />}
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </div>
  );
}
