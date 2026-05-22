/**
 * Snake_case ↔ camelCase deep object transforms.
 *
 * Backend serializers emit snake_case; frontend domain types use camelCase.
 * Resource modules call `camelize(server)` on responses and `snakeify(client)`
 * on request bodies so the boundary is clean.
 *
 * Notes:
 * - Recursive over plain objects + arrays. Primitives, Date, null, undefined pass through.
 * - Class instances (anything with non-Object prototype) are NOT traversed — returned as-is.
 *   This avoids mangling things like FormData / Blob in request bodies.
 * - Object keys are converted; values are recursed.
 */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function snakeKey(key: string): string {
  return key
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .replace(/([a-z\d])([A-Z])/g, "$1_$2")
    .toLowerCase();
}

export function camelKey(key: string): string {
  // Preserve all-uppercase short tokens (e.g. "IP", "ID") only when isolated.
  if (!key.includes("_")) return key;
  return key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

function transform(value: unknown, keyFn: (k: string) => string): unknown {
  if (Array.isArray(value)) {
    return value.map((v) => transform(v, keyFn));
  }
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[keyFn(k)] = transform(v, keyFn);
    }
    return out;
  }
  return value;
}

export function snakeify<T = unknown>(input: T): unknown {
  return transform(input, snakeKey);
}

export function camelize<T = unknown>(input: T): unknown {
  return transform(input, camelKey);
}
