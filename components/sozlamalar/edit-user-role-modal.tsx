"use client";

import { useEffect, useState, useTransition } from "react";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { updateUserAction } from "@/lib/actions/users";
import type { User, UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EditUserRoleModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

type UserStatus = User["status"];

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Administrator" },
  { value: "omborchi", label: "Omborchi" },
  { value: "buxgalter", label: "Buxgalter" },
  { value: "kassir", label: "Kassir" },
  { value: "auditor", label: "Auditor" },
  { value: "firma", label: "Firma operatori" },
];

const STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: "active", label: "Faol" },
  { value: "blocked", label: "Bloklangan" },
  { value: "pending", label: "Kutilmoqda" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function EditUserRoleModal({
  open,
  onClose,
  user,
}: EditUserRoleModalProps) {
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();
  const [role, setRole] = useState<UserRole>("kassir");
  const [status, setStatus] = useState<UserStatus>("active");

  useEffect(() => {
    if (open && user) {
      setRole(user.role);
      setStatus(user.status);
    }
  }, [open, user]);

  if (!user) {
    return (
      <Modal open={open} onClose={onClose} title="Foydalanuvchini tahrirlash" size="md">
        <ModalBody>
          <p className="text-[13px] text-ink-500">Foydalanuvchi topilmadi.</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Yopish
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (role === user.role && status === user.status) {
      onClose();
      return;
    }

    startTransition(async () => {
      try {
        const res = await updateUserAction(user.id, { role, status });
        if (res.ok) {
          success("Foydalanuvchi saqlandi", user.fullName);
          onClose();
        } else {
          error("Xatolik yuz berdi", "O'zgartirishlarni saqlab bo'lmadi");
        }
      } catch {
        error("Xatolik yuz berdi", "Server bilan aloqa uzildi");
      }
    });
  };

  return (
    <Modal
      open={open}
      onClose={pending ? () => {} : onClose}
      title="Foydalanuvchini tahrirlash"
      description="Rol va statusni o'zgartirish"
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {/* User header card */}
          <div className="flex items-center gap-3 rounded-md border border-border bg-ink-100/60 px-3 py-2.5">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-navy-700 text-[12px] font-bold text-white">
              {getInitials(user.fullName)}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-[13px] font-semibold text-ink-900">
                {user.fullName}
              </div>
              <div className="truncate font-mono text-[11px] text-ink-500">
                {user.email}
              </div>
            </div>
          </div>

          {/* Role */}
          <div>
            <Label htmlFor="edit-role">Rol</Label>
            <select
              id="edit-role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={pending}
              className={cn(
                "h-9 w-full rounded-sm border border-border-strong bg-surface-card px-3 text-sm text-ink-900",
                "focus:outline-2 focus:outline-navy-700 focus:-outline-offset-1 focus:border-navy-700"
              )}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="edit-status">Status</Label>
            <select
              id="edit-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as UserStatus)}
              disabled={pending}
              className={cn(
                "h-9 w-full rounded-sm border border-border-strong bg-surface-card px-3 text-sm text-ink-900",
                "focus:outline-2 focus:outline-navy-700 focus:-outline-offset-1 focus:border-navy-700"
              )}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
