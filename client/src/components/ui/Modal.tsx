import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
interface ModalProps { isOpen: boolean; onClose: () => void; title?: string; children: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl'; }
export default function Modal({ isOpen, onClose, title = 'Details', children, size = 'md' }: ModalProps) {
  const dialog = useRef<HTMLDialogElement>(null), titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    if (!isOpen || !element) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    element.showModal(); document.body.style.overflow = 'hidden';
    return () => { element.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, [isOpen]);
  const trapTab = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Tab') return;
    const nodes = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(node => node.getClientRects().length > 0);
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (!first) { event.preventDefault(); event.currentTarget.focus(); return; }
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  return createPortal(<dialog ref={dialog} tabIndex={-1} aria-labelledby={titleId} onKeyDown={trapTab}
    className={'app-dialog ' + { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size]}
    onCancel={e => { e.preventDefault(); onClose(); }}>
    <div className="flex items-center justify-between gap-4 border-b p-5"><h2 id={titleId} className="text-xl font-semibold">{title}</h2><button type="button" onClick={onClose} className="p-2 rounded-lg" aria-label="Close dialog"><FiX /></button></div>
    <div className="p-5">{children}</div>
  </dialog>, document.body);
}
