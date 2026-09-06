import type { NextFunction, Request, Response } from "express";

/**
 * Lightweight security middleware implemented without extra dependencies so the
 * template stays install-free. Covers two of the biggest gaps flagged in the
 * project audit: missing security headers and no rate limiting.
 */

/**
 * Sets a conservative set of security headers on every response. Mirrors the
 * most impactful subset of what `helmet` would apply.
 */
export function securityHeaders() {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-DNS-Prefetch-Control", "off");
    res.setHeader(
      "Permissions-Policy",
      "geolocation=(self), camera=(), microphone=()"
    );
    // Only advertise HSTS over HTTPS to avoid breaking local http dev.
    if (req_isSecure(_req)) {
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=15552000; includeSubDomains"
      );
    }
    next();
  };
}

function req_isSecure(req: Request): boolean {
  return (
    req.secure || req.headers["x-forwarded-proto"] === "https"
  );
}

type Bucket = { count: number; resetAt: number };

export type RateLimitOptions = {
  windowMs: number;
  max: number;
  message?: string;
};

/**
 * Fixed-window in-memory rate limiter keyed by client IP. Sufficient for a
 * single-instance deployment; swap for a shared store (Redis) when scaling out.
 */
export function rateLimit(options: RateLimitOptions) {
  const { windowMs, max, message = "Too many requests, please try again later." } =
    options;
  const buckets = new Map<string, Bucket>();

  // Periodically evict expired buckets so the map does not grow unbounded.
  const sweep = setInterval(() => {
    const now = Date.now();
    buckets.forEach((bucket, key) => {
      if (bucket.resetAt <= now) buckets.delete(key);
    });
  }, windowMs);
  // Do not keep the process alive just for the sweeper.
  if (typeof sweep.unref === "function") sweep.unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = clientKey(req);
    const now = Date.now();
    let bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;

    const remaining = Math.max(0, max - bucket.count);
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      res.setHeader("Retry-After", String(Math.ceil((bucket.resetAt - now) / 1000)));
      res.status(429).json({ error: message });
      return;
    }

    next();
  };
}

function clientKey(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "unknown";
}
