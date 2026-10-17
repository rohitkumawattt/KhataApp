import rateLimit from 'express-rate-limit';

// 1. Strict Limiter for Sensitive Routes (Login & OTP)
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Minutes window
    max: 5, // Per IP max 5 requests allowed per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes.',
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

// 2. General Limiter for Other API Routes
export const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Minutes
    max: 100, // Per IP max 100 requests
    message: {
        success: false,
        message: 'Too many requests, please now wait for 15 mins.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});