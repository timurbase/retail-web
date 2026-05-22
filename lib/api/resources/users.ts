/**
 * Users resource — members of the active store/supplier.
 *
 * Endpoint prefix: /api/auth/users/
 */

import "server-only";
import { apiFetch } from "../client";
import { camelize, snakeify } from "../transform";
import type { User } from "@/lib/types";

export interface UserInviteInput {
  phone?: string;
  fullName?: string;
  full_name?: string;
  email?: string;
  role?: User["role"] | string;
  [k: string]: unknown;
}

export interface UsersListResult {
  count: number;
  results: User[];
}

export type UserPatch = Partial<
  Omit<User, "id" | "storeId" | "orgId" | "createdAt" | "lastLogin">
>;

export const users = {
  async list(): Promise<UsersListResult> {
    const raw = await apiFetch<unknown>("/api/auth/users/");
    if (Array.isArray(raw)) {
      const camel = camelize(raw) as User[];
      return { count: camel.length, results: camel };
    }
    const obj = camelize(raw) as { count?: number; results?: User[] };
    return { count: obj.count ?? 0, results: obj.results ?? [] };
  },

  async invite(input: UserInviteInput): Promise<User> {
    const raw = await apiFetch<unknown>("/api/auth/users/invite/", {
      method: "POST",
      body: snakeify(input) as Record<string, unknown>,
    });
    return camelize(raw) as User;
  },

  async update(id: string, patch: UserPatch): Promise<User> {
    const raw = await apiFetch<unknown>(`/api/auth/users/${id}/`, {
      method: "PATCH",
      body: snakeify(patch) as Record<string, unknown>,
    });
    return camelize(raw) as User;
  },

  async remove(id: string): Promise<void> {
    await apiFetch<void>(`/api/auth/users/${id}/`, { method: "DELETE" });
  },

  async toggleStatus(id: string): Promise<User> {
    const raw = await apiFetch<unknown>(
      `/api/auth/users/${id}/toggle-status/`,
      { method: "POST" },
    );
    return camelize(raw) as User;
  },
};
