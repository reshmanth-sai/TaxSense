// This lives outside api/ (Vercel's own recommendation) so it's never at risk
// of being picked up as its own Serverless Function.
//
// Request routing on Vercel is filesystem-first: a rewrite in vercel.json can
// never override a request path that already matches a real file, so a
// request to /api/chat is served directly by api/chat.ts, not by the
// vercel.json rewrite to api/index.ts (and therefore not by server.ts). That
// means this is the layer that actually has to carry request throttling for
// it to do anything in production -- express-rate-limit in server.ts only
// ever runs for local dev / local Node hosting.
//
// This is a plain in-memory counter, not a distributed store: a cold
// serverless instance starts back at zero, and warm instances only share
// state with requests that happen to land on the same one. That's a real gap
// under multi-instance scaling, but it's strictly better than the previous
// state, which was no throttling at all on the endpoints Vercel actually
// serves.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

interface MinimalRequest {
  headers: Record<string, string | string[] | undefined>;
}

interface MinimalResponse {
  setHeader(name: string, value: string): void;
  status(code: number): { json(body: unknown): void };
}

function clientKey(req: MinimalRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return value?.split(',')[0]?.trim() || 'unknown';
}

function check(bucketKey: string, windowMs: number, max: number) {
  const now = Date.now();
  const bucket = buckets.get(bucketKey);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return { limited: false, remaining: max - 1, resetAt: now + windowMs };
  }
  bucket.count += 1;
  return {
    limited: bucket.count > max,
    remaining: Math.max(0, max - bucket.count),
    resetAt: bucket.resetAt,
  };
}

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  message: string;
}

// Mirrors the two-tier policy server.ts already applies for local/Node hosting:
// a general per-IP cap on all API traffic, and a stricter cap on the
// Gemini-backed endpoints specifically.
export const API_RATE_LIMIT: RateLimitOptions = {
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes.',
};

export const AI_RATE_LIMIT: RateLimitOptions = {
  windowMs: 60 * 1000,
  max: 20,
  message: 'Too many AI requests from this IP. Please wait a minute before sending more requests.',
};

/**
 * Enforces a rate limit for this request. Returns true if the request was
 * blocked (a 429 response has already been sent, and the caller should
 * return immediately without doing any further work); false if it may
 * proceed.
 */
export function enforceRateLimit(
  req: MinimalRequest,
  res: MinimalResponse,
  name: string,
  options: RateLimitOptions
): boolean {
  const key = `${name}:${clientKey(req)}`;
  const result = check(key, options.windowMs, options.max);

  res.setHeader('RateLimit-Limit', String(options.max));
  res.setHeader('RateLimit-Remaining', String(result.remaining));
  res.setHeader('RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));

  if (result.limited) {
    res.status(429).json({ error: options.message, status: 429 });
    return true;
  }
  return false;
}
