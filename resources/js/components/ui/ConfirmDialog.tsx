import { useEffect } from "react";
import { Button } from "./Button";
import { Icon } from "./Icon";
import type { IconName } from "../../types";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "secondary" | "danger" | "warning";
  icon?: IconName;
  notice?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  confirmVariant = "primary",
  icon = "alertTriangle",
  notice,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isDanger = confirmVariant === "danger";

  return (
    <div
      className="confirm-dialog-backdrop"
      onMouseDown={onCancel}
      role="presentation"
    >
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="confirm-dialog__header">
          <div
            className={`confirm-dialog__icon-wrapper ${
              isDanger ? "confirm-dialog__icon-wrapper--danger" : ""
            }`}
          >
            <Icon name={icon} size={20} />
          </div>
          <div className="confirm-dialog__header-text">
            <h3 id="confirm-dialog-title">{title}</h3>
          </div>
          <button
            type="button"
            className="confirm-dialog__close"
            onClick={onCancel}
            aria-label="Close dialog"
            title="Close dialog"
          >
            <Icon name="close" size={14} />
          </button>
        </div>

        <div className="confirm-dialog__body">
          <p className="confirm-dialog__message">{message}</p>
          {notice && (
            <div className="confirm-dialog__notice">
              <Icon name="alertTriangle" size={15} />
              <span>{notice}</span>
            </div>
          )}
        </div>

        <div className="confirm-dialog__footer">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
