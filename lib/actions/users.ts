"use server";

import { revalidatePath } from "next/cache";
import { users, ApiError } from "@/lib/api";
import type { User } from "../types";

function revalidate() {
  revalidatePath("/sozlamalar");
  revalidatePath("/audit-log");
}

export async function createUserAction(
  data: Omit<User, "id" | "storeId" | "orgId" | "lastLogin" | "createdAt">,
) {
  try {
    const u = await users.invite({
      phone: data.phone,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
    });
    revalidate();
    return { ok: true as const, user: u };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false as const, error: e.message, code: e.code };
    }
    return { ok: false as const, error: "Foydalanuvchi qo'shilmadi" };
  }
}

export async function updateUserAction(
  id: string,
  patch: Partial<Omit<User, "id" | "storeId">>,
) {
  try {
    const u = await users.update(id, patch);
    revalidate();
    return { ok: true as const, user: u };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false as const, error: e.message, code: e.code };
    }
    return { ok: false as const, error: "Tahrirlashda xato" };
  }
}

export async function deleteUserAction(id: string) {
  try {
    await users.remove(id);
    revalidate();
    return { ok: true as const };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false as const, error: e.message, code: e.code };
    }
    return { ok: false as const, error: "O'chirishda xato" };
  }
}

export async function toggleUserStatusAction(id: string) {
  try {
    const u = await users.toggleStatus(id);
    revalidate();
    return { ok: true as const, user: u };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false as const, error: e.message, code: e.code };
    }
    return { ok: false as const, error: "Status o'zgartirilmadi" };
  }
}
