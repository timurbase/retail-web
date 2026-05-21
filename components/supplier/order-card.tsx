"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Check,
  X,
  FileText,
  Truck,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  acceptOrderAction,
  rejectOrderAction,
} from "@/lib/actions/supplier";
import type { IncomingOrder } from "@/lib/types";
import { formatSom, cn } from "@/lib/utils";

const STATUS_META: Record<
  IncomingOrder["status"],
  { label: string; bg: string; text: string; border: string }
> = {
  pending: {
    label: "Kutilmoqda",
    bg: "bg-amber-50",
    text: "text-amber-600 dark:text-amber-300",
    border: "border-amber-600",
  },
  accepted: {
    label: "Qabul qilindi",
    bg: "bg-emerald-50",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-600",
  },
  rejected: {
    label: "Rad etildi",
    bg: "bg-red-50",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-600",
  },
  fulfilled: {
    label: "Yetkazib berildi",
    bg: "bg-navy-50",
    text: "text-navy-700 dark:text-navy-300",
    border: "border-navy-700",
  },
};

function timeAgo(iso: string, now: number): string {
  const t = new Date(iso).getTime();
  const diff = now - t;
  const h = Math.floor(diff / 3600000);
  if (h < 1) {
    const m = Math.max(1, Math.floor(diff / 60000));
    return `${m} daq oldin`;
  }
  if (h < 24) return `${h} soat oldin`;
  const d = Math.floor(h / 24);
  return `${d} kun oldin`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}

interface OrderCardProps {
  order: IncomingOrder;
  nowMs: number;
}

export function OrderCard({ order, nowMs }: OrderCardProps) {
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  const st = STATUS_META[order.status];
  const topItems = order.items.slice(0, 3);

  const handleAccept = () => {
    startTransition(async () => {
      try {
        const res = await acceptOrderAction(order.id);
        if (res.ok) {
          success(
            "Buyurtma tasdiqlandi",
            `${order.number} — invoice yaratildi`,
          );
        } else {
          error("Xatolik yuz berdi", "Buyurtmani tasdiqlab bo'lmadi");
        }
      } catch {
        error("Xatolik yuz berdi", "Server bilan aloqa uzildi");
      }
    });
  };

  const handleReject = () => {
    if (!reason.trim()) {
      error("Sabab kiriting", "Rad etish sababi kerak");
      return;
    }
    startTransition(async () => {
      try {
        const res = await rejectOrderAction(order.id, reason.trim());
        if (res.ok) {
          success("Buyurtma rad etildi", order.number);
          setRejectOpen(false);
          setReason("");
        } else {
          error("Xatolik yuz berdi", "Buyurtmani rad etib bo'lmadi");
        }
      } catch {
        error("Xatolik yuz berdi", "Server bilan aloqa uzildi");
      }
    });
  };

  return (
    <>
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <span
              className={cn(
                "shrink-0 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-mono font-semibold uppercase",
                st.bg,
                st.border,
                st.text,
              )}
            >
              {st.label}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[14px] font-semibold text-ink-900">
                  {order.number}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-ink-500">
                <Link
                  href={`/supplier/do-konlar/${order.storeId}`}
                  className="font-medium text-ink-700 hover:text-navy-700 dark:hover:text-navy-300 hover:underline"
                >
                  {order.storeName}
                </Link>
                <span className="text-ink-300">&middot;</span>
                <span className="font-mono inline-flex items-center gap-1">
                  <Clock className="size-3" />
                  {timeAgo(order.requestedAt, nowMs)}
                </span>
                <span className="text-ink-300">&middot;</span>
                <span className="font-mono">
                  {order.items.length} mahsulot
                </span>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-mono text-[18px] font-bold text-ink-900 leading-none">
              {formatSom(order.totalAmount)}
            </div>
            <div className="mt-0.5 font-mono text-[10px] text-ink-500 uppercase tracking-wider">
              Jami summa
            </div>
          </div>
        </div>

        {/* Top items */}
        <div className="mt-4 grid grid-cols-1 gap-1.5 border-t border-border pt-3 sm:grid-cols-3">
          {topItems.map((it) => (
            <div
              key={it.productId}
              className="flex items-center gap-2 rounded-sm bg-ink-100/50 px-2 py-1.5"
            >
              <span className="truncate text-[12px] text-ink-700">
                {it.name}
              </span>
              <span className="ml-auto shrink-0 font-mono text-[11px] font-semibold text-ink-900">
                {it.quantity} {it.unit}
              </span>
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="flex items-center justify-center rounded-sm border border-dashed border-border px-2 py-1.5 font-mono text-[11px] text-ink-500">
              + {order.items.length - 3} mahsulot
            </div>
          )}
        </div>

        {/* Action row */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          {order.status === "pending" && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="emerald"
                size="sm"
                onClick={handleAccept}
                disabled={pending}
              >
                <Check className="size-4" />
                Tasdiqlash
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRejectOpen(true)}
                disabled={pending}
                className="text-red-700 dark:text-red-300 hover:bg-red-50"
              >
                <X className="size-4" />
                Rad etish
              </Button>
              <Link
                href={`/supplier/buyurtmalar/${order.id}`}
                className="inline-flex h-8 items-center gap-1.5 rounded-sm px-3 text-[13px] font-medium text-ink-600 hover:bg-ink-100 hover:text-ink-900"
              >
                <FileText className="size-4" />
                Tafsilot
              </Link>
            </div>
          )}

          {order.status === "accepted" && (
            <>
              <span className="inline-flex items-center gap-1.5 font-mono text-[12px] text-emerald-700 dark:text-emerald-300">
                <Truck className="size-3.5" />
                Yetkazib berish: 22.05.2026
              </span>
              <Link
                href={`/supplier/buyurtmalar/${order.id}`}
                className="inline-flex h-8 items-center gap-1.5 rounded-sm px-3 text-[13px] font-medium text-ink-600 hover:bg-ink-100 hover:text-ink-900"
              >
                <FileText className="size-4" />
                Tafsilot
              </Link>
            </>
          )}

          {order.status === "rejected" && (
            <div className="text-[12px] text-red-700 dark:text-red-300">
              <span className="font-semibold">Rad etildi:</span>{" "}
              <span className="text-ink-600">
                {order.rejectionReason ?? "Sabab ko'rsatilmagan"}
              </span>
            </div>
          )}

          {order.status === "fulfilled" && (
            <>
              <span className="inline-flex items-center gap-1.5 font-mono text-[12px] text-navy-700 dark:text-navy-300">
                <Check className="size-3.5" />
                Yopildi: {formatDateTime(order.requestedAt)}
              </span>
              <Link
                href={`/supplier/hujjatlar`}
                className="inline-flex h-8 items-center gap-1.5 rounded-sm px-3 text-[13px] font-medium text-navy-700 dark:text-navy-300 hover:bg-navy-50"
              >
                <FileText className="size-4" />
                Hujjat ko&apos;rish
              </Link>
            </>
          )}
        </div>
      </Card>

      <Modal
        open={rejectOpen}
        onClose={() => (pending ? undefined : setRejectOpen(false))}
        title="Buyurtmani rad etish"
        description={`${order.number} — ${order.storeName}`}
        size="sm"
      >
        <ModalBody>
          <Label htmlFor="reject-reason">Rad etish sababi</Label>
          <textarea
            id="reject-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Masalan: Mahsulot omborda yo'q, eski mijoz qarzi, ..."
            rows={4}
            className="block w-full rounded-sm border border-border-strong bg-surface-card px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-2 focus:outline-navy-700 focus:-outline-offset-1 focus:border-navy-700"
          />
          <p className="mt-2 text-[11px] text-ink-500">
            Mijozga sabab bilan birga avtomatik xabar yuboriladi.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setRejectOpen(false)}
            disabled={pending}
          >
            Bekor qilish
          </Button>
          <Button variant="danger" onClick={handleReject} disabled={pending}>
            {pending ? "Yuborilmoqda..." : "Rad etish"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
