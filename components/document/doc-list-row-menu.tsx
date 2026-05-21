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
import { deleteDocumentAction } from "@/lib/actions/documents";
import { ExternalLink, Trash2 } from "lucide-react";

interface DocListRowMenuProps {
  docId: string;
  docNumber: string;
}

export function DocListRowMenu({ docId, docNumber }: DocListRowMenuProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleOpen() {
    router.push(`/hujjatlar/${docId}`);
  }

  function performDelete() {
    startTransition(async () => {
      const res = await deleteDocumentAction(docId);
      if (res.ok) {
        success("Hujjat o'chirildi", `№${docNumber}`);
        setConfirmOpen(false);
      } else {
        error("Xatolik", "Hujjatni o'chirib bo'lmadi");
      }
    });
  }

  return (
    <div
      onClick={(e) => {
        // Prevent the wrapping Link from navigating when clicking the menu
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Dropdown>
        <DropdownItem
          onClick={handleOpen}
          icon={<ExternalLink className="size-3.5" />}
        >
          Ochish
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem
          variant="danger"
          onClick={() => setConfirmOpen(true)}
          icon={<Trash2 className="size-3.5" />}
        >
          O'chirish
        </DropdownItem>
      </Dropdown>

      <Confirm
        open={confirmOpen}
        onClose={() => !pending && setConfirmOpen(false)}
        onConfirm={performDelete}
        title={`Hujjat №${docNumber} ni o'chirmoqchimisiz?`}
        description="Bu amalni qaytarib bo'lmaydi. Hujjat butunlay o'chiriladi."
        confirmLabel="O'chirish"
        variant="danger"
        loading={pending}
      />
    </div>
  );
}
