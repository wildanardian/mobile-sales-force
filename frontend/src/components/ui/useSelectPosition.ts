import { useCallback, useState, type RefObject } from 'react';

export interface SelectPosition {
  left: number;
  width: number;
  maxHeight: number;
  top?: number; // terisi bila panel membuka ke bawah
  bottom?: number; // terisi bila panel membuka ke atas (flip)
}

const OPTION_HEIGHT = 44;
const MAX_VISIBLE = 6;
const PANEL_PADDING = 8;
const GAP = 4; // jarak pemicu ke panel
const MARGIN = 8; // jarak minimum panel ke tepi layar

// Panel dirender lewat portal dengan position: fixed, jadi posisinya dihitung
// dari kotak pemicu di layar. measure() dipanggil saat membuka dan setiap kali
// halaman di-scroll atau ukuran layar berubah.
export function useSelectPosition(triggerRef: RefObject<HTMLElement | null>, optionCount: number) {
  const [position, setPosition] = useState<SelectPosition | null>(null);

  // Mengembalikan false bila pemicu sudah keluar dari layar (panel sebaiknya ditutup)
  const measure = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return false;

    const rect = trigger.getBoundingClientRect();
    // visualViewport ikut mengecil saat keyboard layar muncul
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    if (rect.bottom < 0 || rect.top > viewportHeight) return false;

    const wanted = Math.min(optionCount, MAX_VISIBLE) * OPTION_HEIGHT + PANEL_PADDING;
    const spaceBelow = viewportHeight - rect.bottom - GAP - MARGIN;
    const spaceAbove = rect.top - GAP - MARGIN;
    const openUp = spaceBelow < wanted && spaceAbove > spaceBelow;
    const space = openUp ? spaceAbove : spaceBelow;

    setPosition({
      left: rect.left,
      width: rect.width,
      maxHeight: Math.max(OPTION_HEIGHT * 2, Math.min(MAX_VISIBLE * OPTION_HEIGHT + PANEL_PADDING, space)),
      ...(openUp ? { bottom: window.innerHeight - rect.top + GAP } : { top: rect.bottom + GAP }),
    });
    return true;
  }, [triggerRef, optionCount]);

  return { position, measure };
}
