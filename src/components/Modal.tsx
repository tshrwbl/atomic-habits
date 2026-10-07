import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  /** Tailwind max-width class, e.g. "max-w-lg" */
  size?: string;
  /** Optional sticky footer (actions) */
  footer?: React.ReactNode;
  /** Optional content rendered directly under the header (e.g. tabs) */
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Flip7 Accessible Modal Shell
 * - Esc and backdrop click close it
 * - Locks body scroll while open
 * - Moves focus into dialog
 * - Retro rounded 32px corners, dashed headers, tactile dismiss
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  size = 'max-w-xl',
  footer,
  headerExtra,
  children,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the first focusable field
    requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const target =
        panel.querySelector<HTMLElement>('[data-autofocus]') ||
        panel.querySelector<HTMLElement>('input:not([type=hidden]):not([type=checkbox]), textarea, select') ||
        panel;
      target.focus({ preventScroll: true });
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
      }
      // Simple focus trap
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 animate-fade-in"
      style={{ backgroundColor: 'var(--backdrop)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`w-full ${size} bg-surface text-ink border-2 border-line shadow-2xl rounded-t-[32px] sm:rounded-[32px] flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-modal-in outline-none`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4.5 border-b-2 border-dashed border-line">
          <div className="flex items-start gap-3.5 min-w-0">
            {icon && (
              <div className="w-10 h-10 rounded-2xl bg-f7-gold/25 text-f7-teal-dark border-2 border-f7-gold shadow-accent-glow flex items-center justify-center flex-shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h2 id={titleId} className="text-base sm:text-lg font-black text-ink leading-tight">
                {title}
              </h2>
              {subtitle && <p className="text-xs text-ink-3 font-semibold mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-2 border border-line flex items-center justify-center text-ink-3 hover:text-ink hover:bg-surface shadow-xs transition-colors cursor-pointer -mr-1.5 -mt-1"
            aria-label="Close dialog"
            title="Close (Esc)"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {headerExtra}

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4.5 border-t-2 border-dashed border-line bg-surface-2 flex items-center justify-end gap-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
