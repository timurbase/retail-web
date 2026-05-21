"use client";

import { useState } from "react";
import { FileSpreadsheet, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { Supplier } from "@/lib/types";

import { NewDocModal } from "./new-doc-modal";
import { ExcelImportModal } from "./excel-import-modal";

interface NewDocButtonProps {
  suppliers: Supplier[];
}

export function NewDocButton({ suppliers }: NewDocButtonProps) {
  const [newDocOpen, setNewDocOpen] = useState(false);
  const [excelOpen, setExcelOpen] = useState(false);
  const { error } = useToast();

  const guardSuppliers = (next: () => void) => {
    if (suppliers.length === 0) {
      error(
        "Yetkazib beruvchi yo'q",
        "Avval kamida bitta yetkazib beruvchi qo'shing"
      );
      return;
    }
    next();
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => guardSuppliers(() => setExcelOpen(true))}
      >
        <FileSpreadsheet className="size-4" />
        Excel import
      </Button>
      <Button onClick={() => guardSuppliers(() => setNewDocOpen(true))}>
        <Plus className="size-4" />
        Yangi hujjat
      </Button>

      <NewDocModal
        open={newDocOpen}
        onClose={() => setNewDocOpen(false)}
        suppliers={suppliers}
      />

      <ExcelImportModal
        open={excelOpen}
        onClose={() => setExcelOpen(false)}
        suppliers={suppliers}
      />
    </>
  );
}
