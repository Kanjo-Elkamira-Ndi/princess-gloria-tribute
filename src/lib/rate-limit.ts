/**
 * In-memory rate limiter for the public tribute submission endpoint.
 *
 * Since the form is open without login, we apply a simple sliding-window
 * limit per IP+email pair. The limit is intentionally generous to allow
 * genuine family & friends to submit, but blocks flood attacks.
 *
 * Bound: max 3 submissions per 10 minutes per IP.
 */

type Bucket = { count: number; firstAt: number };
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_HITS = 3;

const buckets = new Map<string, Bucket>();

// Periodically prune expired buckets to keep memory bounded
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now - bucket.firstAt > WINDOW_MS) buckets.delete(key);
  }
}, 5 * 60 * 1000).unref?.();

export function rateLimit(key: string): { ok: boolean; retryAfterMs: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.firstAt > WINDOW_MS) {
    buckets.set(key, { count: 1, firstAt: now });
    return { ok: true, retryAfterMs: 0 };
  }

  if (bucket.count >= MAX_HITS) {
    const retryAfterMs = WINDOW_MS - (now - bucket.firstAt);
    return { ok: false, retryAfterMs };
  }

  bucket.count += 1;
  return { ok: true, retryAfterMs: 0 };
}
