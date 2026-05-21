"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dropdown,
  DropdownItem,
  DropdownDivider,
} from "@/components/ui/dropdown";
import { Confirm } from "@/components/ui/confirm";
import { useToast } from "@/components/ui/toast";
import {
  rejectDocumentAction,
  deleteDocumentAction,
} from "@/lib/actions/documents";
import { Download, ScrollText, Ban, Trash2 } from "lucide-react";

interface DocHeaderMenuProps {
  docId: string;
  docNumber: string;
}

type ConfirmKind = "reject" | "delete" | null;

export function DocHeaderMenu({ docId, docNumber }: DocHeaderMenuProps) {
  const router = useRouter();
  const { success, error, info } = useToast();
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<ConfirmKind>(null);

  function handleDownload() {
    info("Yuklab olish", "Bu demo da hali ishlamaydi");
  }

  function handleAuditLog() {
    router.push("/audit-log");
  }

  function performReject() {
    startTransition(async () => {
      const res = await rejectDocumentAction(docId, "Operator rad etdi");
      if (res.ok) {
        success("Hujjat rad etildi", `№${docNumber}`);
        setConfirm(null);
        router.push("/hujjatlar");
      } else {
        error("Xatolik", "Hujjatni rad eta olmadik");
      }
    });
  }

  function performDelete() {
    startTransition(async () => {
      const res = await deleteDocumentAction(docId);
      if (res.ok) {
        success("Hujjat o'chirildi", `№${docNumber}`);
        setConfirm(null);
        router.push("/hujjatlar");
      } else {
        error("Xatolik", "Hujjatni o'chirib bo'lmadi");
      }
    });
  }

  return (
    <>
      <Dropdown>
        <DropdownItem onClick={handleDownload} icon={<Download className="size-3.5" />}>
          Yuklab olish
        </DropdownItem>
        <DropdownItem
          onClick={handleAuditLog}
          icon={<ScrollText className="size-3.5" />}
        >
          Audit log
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem
          variant="danger"
          onClick={() => setConfirm("reject")}
          icon={<Ban className="size-3.5" />}
        >
          Rad etish
        </DropdownItem>
        <DropdownItem
          variant="danger"
          onClick={() => setConfirm("delete")}
          icon={<Trash2 className="size-3.5" />}
        >
          Hujjatni o'chirish
        </DropdownItem>
      </Dropdown>

      <Confirm
        open={confirm === "reject"}
        onClose={() => !pending && setConfirm(null)}
        onConfirm={performReject}
        title={`Hujjat №${docNumber} ni rad etmoqchimisiz?`}
        description="Bu amal hujjatni Rad etilgan holatiga o'tkazadi. Audit logga yoziladi."
        confirmLabel="Rad etish"
        variant="danger"
        loading={pending}
      />

      <Confirm
        open={confirm === "delete"}
        onClose={() => !pending && setConfirm(null)}
        onConfirm={performDelete}
        title={`Hujjat №${docNumber} ni o'chirmoqchimisiz?`}
        description="Bu amalni qaytarib bo'lmaydi. Hujjat butunlay o'chiriladi va siz hujjatlar ro'yxatiga qaytasiz."
        confirmLabel="O'chirish"
        variant="danger"
        loading={pending}
      />
    </>
  );
}
