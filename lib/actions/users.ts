"use server";

import { revalidatePath } from "next/cache";
import * as store from "../store";
import type { User } from "../types";

function revalidate() {
  revalidatePath("/sozlamalar");
  revalidatePath("/audit-log");
}

export async function createUserAction(
  data: Omit<User, "id" | "storeId" | "orgId" | "lastLogin" | "createdAt">
) {
  const u = store.createUser(data);
  revalidate();
  return { ok: true, user: u };
}

export async function updateUserAction(
  id: string,
  patch: Partial<Omit<User, "id" | "storeId">>
) {
  const u = store.updateUser(id, patch);
  revalidate();
  return { ok: !!u, user: u };
}

export async function deleteUserAction(id: string) {
  const ok = store.deleteUser(id);
  revalidate();
  return { ok };
}

export async function toggleUserStatusAction(id: string) {
  const u = store.toggleUserStatus(id);
  revalidate();
  return { ok: !!u, user: u };
}
