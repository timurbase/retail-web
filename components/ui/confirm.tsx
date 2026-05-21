"use client";

import { AlertTriangle } from "lucide-react";
import { Modal, ModalBody, ModalFooter } from "./modal";
import { Button } from "./button";

interface ConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  loading?: boolean;
}

export function Confirm({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Tasdiqlash",
  cancelLabel = "Bekor qilish",
  variant = "danger",
  loading,
}: ConfirmProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <ModalBody className="flex gap-3 pt-5">
        <div
          className={
            variant === "danger"
              ? "grid size-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-700 dark:text-red-300"
              : "grid size-10 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-600 dark:text-amber-300"
          }
        >
          <AlertTriangle className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold text-ink-900">{title}</h2>
          {description && (
            <p className="mt-1 text-[13px] leading-relaxed text-ink-600">{description}</p>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant === "danger" ? "danger" : "primary"}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Bajarilmoqda..." : confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
