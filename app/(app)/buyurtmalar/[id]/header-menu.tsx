"use client";

import { useRouter } from "next/navigation";
import {
  Dropdown,
  DropdownItem,
  DropdownDivider,
} from "@/components/ui/dropdown";
import { useToast } from "@/components/ui/toast";
import { Pencil, Send, Ban, FileDown } from "lucide-react";

interface OrderHeaderMenuProps {
  orderId: string;
  cancellable: boolean;
}

export function OrderHeaderMenu({ orderId, cancellable }: OrderHeaderMenuProps) {
  const router = useRouter();
  const { success, info } = useToast();

  return (
    <Dropdown>
      <DropdownItem
        onClick={() => info("Tahrir", "Buyurtma tahrir oynasi demo bosqichida")}
        icon={<Pencil className="size-3.5" />}
      >
        Tahrir
      </DropdownItem>
      <DropdownItem
        onClick={() => success("Ulashildi", `Buyurtma ${orderId} havolasi nusxalandi`)}
        icon={<Send className="size-3.5" />}
      >
        Telegram orqali ulashish
      </DropdownItem>
      <DropdownItem
        onClick={() => info("Eksport", "PDF tayyorlanmoqda…")}
        icon={<FileDown className="size-3.5" />}
      >
        PDF eksport
      </DropdownItem>
      {cancellable && (
        <>
          <DropdownDivider />
          <DropdownItem
            variant="danger"
            onClick={() => {
              success("Buyurtma bekor qilindi", orderId);
              router.push("/buyurtmalar");
            }}
            icon={<Ban className="size-3.5" />}
          >
            Bekor qilish
          </DropdownItem>
        </>
      )}
    </Dropdown>
  );
}
