/**
 * ApiError — normalises DRF-style error envelopes.
 *
 * Backend returns one of:
 *   - { error: "...", code?: "..." }     custom errors
 *   - { detail: "..." }                  DRF default
 *   - { field_name: ["msg1", ...], ... } serializer field errors
 *
 * All shapes funnel through this class so callers can `catch (e) { if (e instanceof ApiError) ... }`.
 */

export interface ApiErrorBody {
  error?: string;
  detail?: string;
  code?: string;
  [field: string]: unknown;
}

const RESERVED_KEYS = new Set(["error", "detail", "code", "fields"]);

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly fields?: Record<string, string[]>;
  readonly body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody | string | null) {
    const normalised: ApiErrorBody =
      body == null
        ? {}
        : typeof body === "string"
          ? { error: body }
          : body;

    // Extract field errors (any non-reserved key whose value is string[])
    let fields: Record<string, string[]> | undefined;
    for (const [k, v] of Object.entries(normalised)) {
      if (RESERVED_KEYS.has(k)) continue;
      if (Array.isArray(v) && v.every((x) => typeof x === "string")) {
        fields = fields ?? {};
        fields[k] = v as string[];
      }
    }

    const message =
      normalised.error ||
      normalised.detail ||
      (fields ? Object.values(fields).flat().join("; ") : undefined) ||
      `HTTP ${status}`;

    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = typeof normalised.code === "string" ? normalised.code : undefined;
    this.fields = fields;
    this.body = normalised;
  }

  /** Convenience predicate for 401 cases. */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}
