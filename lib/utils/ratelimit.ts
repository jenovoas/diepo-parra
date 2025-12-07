import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiting utility for API protection
 * Prevents brute force attacks and API abuse
 */

// Initialize Redis client (uses env variables UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN)
const redis = process.env.UPSTASH_REDIS_REST_URL
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
    })
    : null;

// Create rate limiters with different limits for different endpoints
export const authRateLimiter = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 requests per 15 minutes
        analytics: true,
        prefix: "@upstash/ratelimit/auth",
    })
    : null;

export const apiRateLimiter = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
        analytics: true,
        prefix: "@upstash/ratelimit/api",
    })
    : null;

export const contactRateLimiter = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 requests per hour
        analytics: true,
        prefix: "@upstash/ratelimit/contact",
    })
    : null;

/**
 * Get client identifier from request (IP address)
 */
export function getClientIdentifier(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");

    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }

    return realIp || "unknown";
}

/**
 * Check rate limit and return appropriate response
 */
export async function checkRateLimit(
    request: Request,
    limiter: Ratelimit | null
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
    if (!limiter) {
        // If Redis is not configured, allow all requests (development mode)
        return { success: true };
    }

    const identifier = getClientIdentifier(request);
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    return { success, limit, remaining, reset };
}
