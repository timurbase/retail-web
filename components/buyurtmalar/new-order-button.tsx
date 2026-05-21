"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { Product, Supplier } from "@/lib/types";

import { NewOrderModal } from "./new-order-modal";

interface NewOrderButtonProps {
  suppliers: Supplier[];
  products: Product[];
}

export function NewOrderButton({ suppliers, products }: NewOrderButtonProps) {
  const [open, setOpen] = useState(false);
  const { error } = useToast();

  const handleClick = () => {
    if (suppliers.length === 0) {
      error(
        "Yetkazib beruvchi yo'q",
        "Avval kamida bitta yetkazib beruvchi qo'shing"
      );
      return;
    }
    if (products.length === 0) {
      error("Mahsulot yo'q", "Avval kamida bitta mahsulot qo'shing");
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <Button onClick={handleClick}>
        <Plus className="size-4" />
        Yangi buyurtma
      </Button>

      <NewOrderModal
        open={open}
        onClose={() => setOpen(false)}
        suppliers={suppliers}
        products={products}
      />
    </>
  );
}
