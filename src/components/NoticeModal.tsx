import React, { useLayoutEffect, useId, useRef } from "react";
import { ArrowUpRight, X } from "lucide-react";

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  hint?: string;
  actionText?: string;
  onAction?: () => void;
}

export const NoticeModal: React.FC<NoticeModalProps> = ({
  isOpen, onClose, title, message, hint, actionText, onAction,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;

    // Native modal dialogs make the rest of the document inert and contain focus.
    dialog.showModal();
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus({ preventScroll: true });

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="notice-dialog"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )).filter((element) => element.getClientRects().length > 0 && !element.closest("[inert]"));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) {
          event.preventDefault();
          return;
        }
        if (event.shiftKey && (document.activeElement === first || document.activeElement === event.currentTarget)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom) {
          onClose();
        }
      }}
    >
      <div className="notice-dialog__topline">
        <span className="notice-dialog__eyebrow">Antônio Andreoli</span>
        <button ref={closeButtonRef} type="button" onClick={onClose}
          aria-label="Fechar aviso" className="notice-dialog__close">
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <h2 id={titleId} className="notice-dialog__title">{title}</h2>
      <div id={descriptionId}>
        <p className="notice-dialog__message">{message}</p>
        {hint && <p className="notice-dialog__hint">{hint}</p>}
      </div>
      <button type="button" className="notice-dialog__action"
        onClick={() => {
          if (actionText && onAction) onAction();
          onClose();
        }}>
        <span>{actionText && onAction ? actionText : "Entendido"}</span>
        <ArrowUpRight size={17} aria-hidden="true" />
      </button>
    </dialog>
  );
};

