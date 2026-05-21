"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NewCountModal } from "./new-count-modal";

export function NewCountButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Yangi inventarizatsiya
      </Button>
      <NewCountModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
