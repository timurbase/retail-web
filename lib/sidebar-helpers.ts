/**
 * Server-safe helpers for assembling the sidebar user widget.
 *
 * These can't live next to the client `Sidebar` component because Next.js
 * forbids importing functions from `"use client"` modules into server
 * components — even pure helpers.
 */

import type { SidebarUser } from "@/components/layout/sidebar";
import type { SupplierSidebarUser } from "@/components/supplier/supplier-sidebar";

const STORE_ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  omborchi: "Omborchi",
  buxgalter: "Buxgalter",
  kassir: "Kassir",
  auditor: "Auditor",
  firma: "Firma operatori",
  supplier_admin: "Distribyutor admin",
  supplier_sales: "Sotuv menejer",
  supplier_logistics: "Logistika",
  supplier_buxgalter: "Distribyutor buxgalter",
  soliq_inspector: "Inspektor",
  soliq_admin: "Soliq admin",
};

const SUPPLIER_ROLE_LABELS: Record<string, string> = {
  supplier_admin: "Distribyutor admin",
  supplier_sales: "Sotuv menejer",
  supplier_logistics: "Logistika",
  supplier_buxgalter: "Buxgalter",
};

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "??";
  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
    .padEnd(2, "?")
    .slice(0, 2);
}

export function buildSidebarUser(input: {
  fullName?: string | null;
  phone?: string | null;
  role?: string | null;
}): SidebarUser {
  const fullName = (input.fullName ?? "").trim() || input.phone || "Foydalanuvchi";
  const role = input.role ?? "";
  const roleLabel = STORE_ROLE_LABELS[role] || (role ? role : "Foydalanuvchi");
  return {
    fullName,
    roleLabel,
    initials: getInitials(fullName),
  };
}

export function buildSupplierSidebarUser(input: {
  fullName?: string | null;
  phone?: string | null;
  role?: string | null;
  companyName?: string | null;
}): SupplierSidebarUser {
  const fullName =
    (input.fullName ?? "").trim() ||
    (input.companyName ?? "").trim() ||
    input.phone ||
    "Foydalanuvchi";
  const role = input.role ?? "";
  const roleLabel = SUPPLIER_ROLE_LABELS[role] || (role ? role : "Distribyutor");
  return {
    fullName,
    roleLabel,
    initials: getInitials(fullName),
  };
}
