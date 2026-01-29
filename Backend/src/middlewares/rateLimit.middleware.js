import rateLimit from "express-rate-limit";

/**
 * Rate limiter for job listing endpoint
 * Limits: 100 requests per 15 minutes per IP
 */
const jobListingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        statusCode: 429,
        message: "Too many requests from this IP, please try again after 15 minutes"
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests: false,
    skipFailedRequests: false
});

/**
 * Rate limiter for job redirect endpoint
 * Limits: 50 requests per 15 minutes per IP
 */
const jobRedirectLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    message: {
        statusCode: 429,
        message: "Too many redirect requests from this IP, please try again after 15 minutes"
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * General API rate limiter
 * Limits: 200 requests per 15 minutes per IP
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: {
        statusCode: 429,
        message: "Too many requests from this IP, please try again later"
    },
    standardHeaders: true,
    legacyHeaders: false
});

export { jobListingLimiter, jobRedirectLimiter, generalLimiter };
