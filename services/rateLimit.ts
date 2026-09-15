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

// Memory safeguard: bound in-memory rate-limit buckets to prevent memory exhaustion DoS
const MAX_BUCKETS = 10_000;
let lastPrune = Date.now();
const PRUNE_INTERVAL_MS = 60_000; // prune at most once every 60 seconds

export function pruneExpiredBuckets(now = Date.now()): void {
  if (now - lastPrune < PRUNE_INTERVAL_MS && buckets.size < MAX_BUCKETS) {
    return;
  }
  lastPrune = now;

  for (const [key, bucket] of buckets.entries()) {
    if (now >= bucket.resetAt) {
      buckets.delete(key);
    }
  }

  // Hard eviction safeguard if still over cap
  if (buckets.size > MAX_BUCKETS) {
    let toDelete = buckets.size - MAX_BUCKETS;
    for (const key of buckets.keys()) {
      buckets.delete(key);
      if (--toDelete <= 0) break;
    }
  }
}

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
  if (value) {
    const clientIp = value.split(',')[0]?.trim();
    if (clientIp) return clientIp;
  }

  const realIp = req.headers['x-real-ip'];
  const realValue = Array.isArray(realIp) ? realIp[0] : realIp;
  if (realValue && typeof realValue === 'string' && realValue.trim()) {
    return realValue.trim();
  }

  const cfIp = req.headers['cf-connecting-ip'];
  const cfValue = Array.isArray(cfIp) ? cfIp[0] : cfIp;
  if (cfValue && typeof cfValue === 'string' && cfValue.trim()) {
    return cfValue.trim();
  }

  return 'fallback-ip';
}

function check(bucketKey: string, windowMs: number, max: number) {
  const now = Date.now();
  pruneExpiredBuckets(now);

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

/**
 * Verifies that the request originates from the same site / host, protecting
 * API endpoints against unauthorized cross-site requests (CSRF / cross-site quota draining).
 * Returns true if the request was blocked (403 sent), false if allowed.
 */
export function enforceSameOrigin(
  req: MinimalRequest,
  res: MinimalResponse
): boolean {
  // 1. Check Sec-Fetch-Site (supported by modern Chromium, Firefox, and Safari browsers)
  const secFetchSite = req.headers['sec-fetch-site'];
  const fetchSiteValue = Array.isArray(secFetchSite) ? secFetchSite[0] : secFetchSite;
  if (fetchSiteValue === 'cross-site') {
    res.status(403).json({
      error: 'Cross-site requests to AI endpoints are forbidden.',
      status: 403,
    });
    return true;
  }

  // 2. If Origin header is present (POST/PUT/DELETE requests in browsers), validate domain
  const origin = req.headers['origin'];
  const originValue = Array.isArray(origin) ? origin[0] : origin;
  if (originValue && typeof originValue === 'string') {
    try {
      const url = new URL(originValue);
      const hostHeader = req.headers['host'];
      const hostValue = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;

      const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
      const isHostMatch = hostValue && (url.host === hostValue || hostValue.startsWith(`${url.host}:`));
      const isVercelDeploy = url.hostname.endsWith('.vercel.app');

      if (!isLocalhost && !isHostMatch && !isVercelDeploy) {
        res.status(403).json({
          error: 'Unauthorized origin for API requests.',
          status: 403,
        });
        return true;
      }
    } catch {
      res.status(403).json({
        error: 'Invalid request origin header.',
        status: 403,
      });
      return true;
    }
  }

  return false;
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
