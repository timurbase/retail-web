"use client";

import { useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Sparkles,
  Settings,
  Bell,
  BellOff,
  Plug,
  Users,
  TrendingUp,
  RefreshCw,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NotifKind = "critical" | "warning" | "approval" | "system" | "ai" | "document";
type NotifCategory = "all" | "unread" | "important" | "documents" | "ai" | "system";

interface Notification {
  id: string;
  kind: NotifKind;
  icon: typeof Bell;
  title: string;
  body: string;
  time: string;
  unread?: boolean;
  important?: boolean;
  category: Exclude<NotifCategory, "all" | "unread" | "important">;
  href?: string;
}

const notifications: Notification[] = [
  {
    id: "n1",
    kind: "critical",
    icon: AlertTriangle,
    title: "Coca-Cola 0.5L qoldig'i 3 ta",
    body: "AI buyurtma tavsiyasini ko'ring",
    time: "12 daq oldin",
    unread: true,
    important: true,
    category: "ai",
    href: "/insights",
  },
  {
    id: "n2",
    kind: "warning",
    icon: FileText,
    title: "Alpha Distribution'dan yangi hujjat",
    body: "№12345, 8 mahsulot, 4 567 800 so'm",
    time: "42 daq oldin",
    unread: true,
    important: true,
    category: "documents",
    href: "/hujjatlar",
  },
  {
    id: "n3",
    kind: "system",
    icon: RefreshCw,
    title: "MXIK katalog yangilandi",
    body: "461 950 ta kod (+150)",
    time: "1 soat oldin",
    unread: true,
    category: "system",
  },
  {
    id: "n4",
    kind: "approval",
    icon: CheckCircle2,
    title: "Sevara Yusupova kirimni tasdiqladi",
    body: "Hujjat №12346, 2 845 000 so'm",
    time: "3 soat oldin",
    category: "documents",
    href: "/hujjatlar",
  },
  {
    id: "n5",
    kind: "ai",
    icon: Sparkles,
    title: "AI: 3 ta dublikat shubha aniqlandi",
    body: "Mol go'shti turlari — ko'rib chiqing",
    time: "5 soat oldin",
    category: "ai",
    href: "/insights",
  },
  {
    id: "n6",
    kind: "system",
    icon: TrendingUp,
    title: "Tizim yangilandi",
    body: "v0.1.4 — yangi tafovutlar oynasi",
    time: "Kecha 18:00",
    category: "system",
  },
  {
    id: "n7",
    kind: "critical",
    icon: AlertTriangle,
    title: "Sigaret Esse Light kritik darajada",
    body: "2 blok qoldi (min 5)",
    time: "Kecha 15:23",
    category: "ai",
  },
  {
    id: "n8",
    kind: "approval",
    icon: Plug,
    title: "Didox webhook ulanishi tiklandi",
    body: "23 daq uzilishdan keyin",
    time: "Kecha 12:45",
    category: "system",
  },
  {
    id: "n9",
    kind: "document",
    icon: Pencil,
    title: "Aziz Karimov MXIK 0902200000 → 0902100000 o'zgartirdi",
    body: "Hindiston choyi (Hujjat №12345)",
    time: "Kecha 11:20",
    category: "documents",
    href: "/audit-log",
  },
  {
    id: "n10",
    kind: "ai",
    icon: TrendingUp,
    title: "Haftalik hisobot tayyor",
    body: "21 hujjat, 28.4M so'm aylanma",
    time: "2 kun oldin",
    category: "ai",
    href: "/hisobotlar",
  },
  {
    id: "n11",
    kind: "approval",
    icon: Users,
    title: "Yangi foydalanuvchi qo'shildi",
    body: "Jasur Toshmatov (kassir)",
    time: "2 kun oldin",
    category: "system",
  },
  {
    id: "n12",
    kind: "approval",
    icon: RefreshCw,
    title: "Soliq.uz tasnif sync muvaffaqiyatli",
    body: "Yangi 89 ta kod qabul qilindi",
    time: "3 kun oldin",
    category: "system",
  },
];

const KIND_STYLES: Record<NotifKind, { bg: string; text: string }> = {
  critical: { bg: "bg-red-50", text: "text-red-700 dark:text-red-300" },
  warning: { bg: "bg-amber-50", text: "text-amber-600 dark:text-amber-300" },
  approval: { bg: "bg-emerald-50", text: "text-emerald-700 dark:text-emerald-300" },
  system: { bg: "bg-navy-50", text: "text-navy-700 dark:text-navy-300" },
  ai: { bg: "bg-emerald-50", text: "text-emerald-700 dark:text-emerald-300" },
  document: { bg: "bg-navy-50", text: "text-navy-700 dark:text-navy-300" },
};

interface FilterTab {
  id: NotifCategory;
  label: string;
}

export function NotificationsView() {
  const { info, success } = useToast();
  const [activeFilter, setActiveFilter] = useState<NotifCategory>("all");
  const [items, setItems] = useState(notifications);

  const unreadCount = items.filter((n) => n.unread).length;
  const importantCount = items.filter((n) => n.important).length;
  const documentsCount = items.filter((n) => n.category === "documents").length;
  const aiCount = items.filter((n) => n.category === "ai").length;
  const systemCount = items.filter((n) => n.category === "system").length;

  const filters: FilterTab[] = [
    { id: "all", label: `Hammasi (${items.length})` },
    { id: "unread", label: `O'qilmagan (${unreadCount})` },
    { id: "important", label: `Muhim (${importantCount})` },
    { id: "documents", label: `Hujjatlar (${documentsCount})` },
    { id: "ai", label: `AI Insights (${aiCount})` },
    { id: "system", label: `Tizim (${systemCount})` },
  ];

  const filtered = items.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return n.unread;
    if (activeFilter === "important") return n.important;
    return n.category === activeFilter;
  });

  const markAllRead = () => {
    setItems((xs) => xs.map((n) => ({ ...n, unread: false })));
    success("Hammasi o'qilgan deb belgilandi", `${unreadCount} ta bildirishnoma`);
  };

  const handleClick = (n: Notification) => {
    setItems((xs) =>
      xs.map((x) => (x.id === n.id ? { ...x, unread: false } : x))
    );
    if (!n.href) {
      info("Tafsilotlar", n.title);
    }
  };

  return (
    <>
      <Topbar breadcrumb={[{ label: "Bildirishnomalar" }]} />

      <main className="flex-1 overflow-y-auto bg-surface px-8 py-8">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                Bildirishnomalar
              </h1>
              <p className="mt-1 text-[13px] text-ink-500">
                Tizim, hujjat va AI bildirishnomalari
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={markAllRead}
                disabled={unreadCount === 0}
              >
                Hammasini o&apos;qilgan deb belgilash
              </Button>
              <Link
                href="/sozlamalar"
                className="inline-flex h-9 items-center gap-1.5 rounded-sm px-3 text-[13px] font-medium text-ink-600 hover:bg-ink-100 hover:text-ink-900"
              >
                <Settings className="size-4" />
                Sozlamalar
              </Link>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="mb-4 flex flex-wrap items-center gap-1 rounded-md border border-border bg-surface-card p-1 w-fit">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={cn(
                  "rounded-sm px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                  activeFilter === f.id
                    ? "bg-navy-700 text-white"
                    : "text-ink-600 hover:bg-ink-100"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <Card>
              <div className="grid place-items-center px-5 py-16 text-center">
                <div className="mb-3 grid size-14 place-items-center rounded-full bg-ink-100 text-ink-400">
                  <BellOff className="size-7" />
                </div>
                <div className="text-[15px] font-semibold text-ink-700">
                  Bildirishnoma yo&apos;q
                </div>
                <div className="mt-1 text-[12px] text-ink-500">
                  Yangi xabarlar paydo bo&apos;lganda shu yerda ko&apos;rinadi
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              {filtered.map((n) => {
                const Icon = n.icon;
                const style = KIND_STYLES[n.kind];
                const content = (
                  <>
                    <div
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-full",
                        style.bg,
                        style.text
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-medium text-ink-900">
                          {n.title}
                        </span>
                        {n.unread && (
                          <span className="shrink-0 rounded-full border border-emerald-600 bg-emerald-50 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase text-emerald-700 dark:text-emerald-300">
                            Yangi
                          </span>
                        )}
                        {n.important && !n.unread && (
                          <span className="shrink-0 rounded-full border border-amber-600 bg-amber-50 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase text-amber-600 dark:text-amber-300">
                            Muhim
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-[13px] text-ink-600">
                        {n.body}
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-ink-500">
                      {n.time}
                    </span>
                  </>
                );

                const rowClasses = cn(
                  "flex items-start gap-4 border-b border-border px-5 py-4 last:border-0 text-left w-full transition-colors",
                  n.unread ? "bg-emerald-50/30 hover:bg-emerald-50/50" : "hover:bg-ink-100/40"
                );

                if (n.href) {
                  return (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={() => handleClick(n)}
                      className={rowClasses}
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={rowClasses}
                  >
                    {content}
                  </button>
                );
              })}
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
