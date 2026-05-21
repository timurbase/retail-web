"use client";

import { useState } from "react";
import { ClipboardList, Loader2, X } from "lucide-react";

import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type CountType = "full" | "department" | "group" | "selected";

const COUNT_TYPES: { value: CountType; label: string; hint: string }[] = [
  {
    value: "full",
    label: "To'liq inventarizatsiya",
    hint: "Barcha bo'limlar va mahsulotlar (~3-5 kun)",
  },
  {
    value: "department",
    label: "Bo'lim bo'yicha",
    hint: "Bitta bo'lim — oziq-ovqat, ichimliklar, va h.k.",
  },
  {
    value: "group",
    label: "Mahsulot guruhi",
    hint: "Tanlangan guruh — sigaret, sut, go'sht, v.h.",
  },
  {
    value: "selected",
    label: "Tanlangan mahsulotlar",
    hint: "Faqat ko'rsatilgan mahsulotlar — tezkor tekshiruv",
  },
];

const OPERATOR_OPTIONS = [
  { id: "user_aziz", name: "Aziz Karimov", role: "omborchi" },
  { id: "user_sevara", name: "Sevara Yusupova", role: "buxgalter" },
  { id: "user_jasur", name: "Jasur Toshmatov", role: "kassir" },
  { id: "user_rustam", name: "Rustam Karimov", role: "admin" },
  { id: "user_malika", name: "Malika Ergasheva", role: "omborchi" },
];

interface NewCountModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewCountModal(props: NewCountModalProps) {
  // Only mount inner form while modal is open — fresh state on every open
  if (!props.open) return null;
  return <NewCountModalInner {...props} />;
}

function NewCountModalInner({ open, onClose }: NewCountModalProps) {
  const { success } = useToast();
  const [pending, setPending] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const [type, setType] = useState<CountType>("full");
  const [date, setDate] = useState(today);
  const [operators, setOperators] = useState<string[]>(["user_aziz"]);
  const [note, setNote] = useState("");

  const toggleOperator = (id: string) => {
    setOperators((xs) =>
      xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (operators.length === 0) return;
    setPending(true);
    // Mock submit
    setTimeout(() => {
      setPending(false);
      success(
        "Inventarizatsiya boshlandi",
        `${COUNT_TYPES.find((t) => t.value === type)?.label} · ${operators.length} operator`
      );
      onClose();
    }, 500);
  };

  return (
    <Modal
      open={open}
      onClose={pending ? () => {} : onClose}
      title="Yangi inventarizatsiya"
      description="Davriy ombor hisobi — operatorlar va parametrlarni tanlang"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-5">
          {/* Type */}
          <div>
            <Label>Tur</Label>
            <div className="grid grid-cols-2 gap-2">
              {COUNT_TYPES.map((t) => {
                const active = type === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    disabled={pending}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-sm border px-3 py-2.5 text-left transition-colors",
                      active
                        ? "border-navy-700 bg-navy-50 text-navy-700 dark:text-navy-300"
                        : "border-border-strong bg-surface-card text-ink-700 hover:bg-ink-100"
                    )}
                  >
                    <div className="flex items-center gap-2 text-[13px] font-semibold">
                      <span
                        className={cn(
                          "grid size-3.5 place-items-center rounded-full border",
                          active
                            ? "border-navy-700 bg-navy-700"
                            : "border-border-strong bg-surface-card"
                        )}
                      >
                        {active && (
                          <span className="block size-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      {t.label}
                    </div>
                    <p className="ml-5 text-[11px] text-ink-500">{t.hint}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="inv-date">Boshlash sanasi</Label>
            <Input
              id="inv-date"
              mono
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={pending}
              min={today}
            />
          </div>

          {/* Operators */}
          <div>
            <Label>Operatorlar ({operators.length})</Label>
            <div className="flex flex-wrap gap-1.5">
              {OPERATOR_OPTIONS.map((op) => {
                const selected = operators.includes(op.id);
                return (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => toggleOperator(op.id)}
                    disabled={pending}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors",
                      selected
                        ? "border-navy-700 bg-navy-50 text-navy-700 dark:text-navy-300"
                        : "border-border-strong bg-surface-card text-ink-600 hover:bg-ink-100"
                    )}
                  >
                    {op.name}
                    <span className="font-mono text-[10px] uppercase tracking-wider text-ink-400">
                      {op.role}
                    </span>
                    {selected && <X className="size-3" />}
                  </button>
                );
              })}
            </div>
            {operators.length === 0 && (
              <p className="mt-1.5 text-[11px] text-red-700 dark:text-red-300">
                Kamida bitta operator tanlang
              </p>
            )}
          </div>

          {/* Note */}
          <div>
            <Label htmlFor="inv-note">Eslatma (ixtiyoriy)</Label>
            <textarea
              id="inv-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={pending}
              placeholder="Masalan: chorak yakuni — to'liq tekshiruv. Tafovutlar nazoratchiga yuborilsin."
              maxLength={300}
              className={cn(
                "w-full resize-none rounded-sm border border-border-strong bg-surface-card px-3 py-2 text-sm text-ink-900",
                "placeholder:text-ink-400",
                "focus:outline-2 focus:outline-navy-700 focus:-outline-offset-1 focus:border-navy-700"
              )}
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
            Bekor qilish
          </Button>
          <Button
            type="submit"
            variant="emerald"
            disabled={pending || operators.length === 0}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Boshlanmoqda…
              </>
            ) : (
              <>
                <ClipboardList className="size-4" />
                Boshlash
              </>
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
