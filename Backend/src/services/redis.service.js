import Redis from "ioredis";

let redisClient = null;
let redisAvailable = true; // Track if Redis is available

/**
 * Initialize Redis client
 */
const initRedis = () => {
    try {
        const config = {
            host: process.env.REDIS_HOST || "localhost",
            port: parseInt(process.env.REDIS_PORT) || 6379,
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
                // Stop retrying after 3 attempts
                if (times > 3) {
                    redisAvailable = false;
                    return null;
                }
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            lazyConnect: true,
            enableOfflineQueue: false // Don't queue commands when disconnected
        };

        // Add password if provided
        if (process.env.REDIS_PASSWORD) {
            config.password = process.env.REDIS_PASSWORD;
        }

        redisClient = new Redis(config);

        // Suppress error logging after first error
        let errorLogged = false;
        redisClient.on("error", (err) => {
            if (!errorLogged) {
                errorLogged = true;
                redisAvailable = false;
            }
        });

        redisClient.on("connect", () => {
            redisAvailable = true;
        });

        return redisClient;
    } catch (error) {
        redisAvailable = false;
        return null;
    }
};

/**
 * Get Redis client instance
 */
const getRedisClient = () => {
    if (!redisClient) {
        initRedis();
    }
    return redisClient;
};

// In-memory fallback cache for when Redis is unavailable
const memoryCache = new Map();
const memoryExpiry = new Map();

/**
 * Get internal cached data
 */
const _getMemoryData = (key) => {
    const data = memoryCache.get(key);
    const expiry = memoryExpiry.get(key);

    if (data && expiry && Date.now() < expiry) {
        return JSON.parse(data);
    }

    // Cleanup expired data
    if (expiry && Date.now() >= expiry) {
        memoryCache.delete(key);
        memoryExpiry.delete(key);
    }
    return null;
};

/**
 * Set internal cached data
 */
const _setMemoryData = (key, data, ttl) => {
    memoryCache.set(key, JSON.stringify(data));
    memoryExpiry.set(key, Date.now() + (ttl * 1000));
};

/**
 * Get cached data
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} - Cached data or null
 */
const getCachedData = async (key) => {
    try {
        if (!redisAvailable) {
            return _getMemoryData(key);
        }

        const client = getRedisClient();
        if (!client) {
            return _getMemoryData(key);
        }

        const data = await client.get(key);
        if (!data) return _getMemoryData(key);

        return JSON.parse(data);
    } catch (error) {
        return _getMemoryData(key);
    }
};

/**
 * Set cached data
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in seconds (default: 3600 = 1 hour)
 * @returns {Promise<boolean>} - Success status
 */
const setCachedData = async (key, data, ttl = parseInt(process.env.CACHE_TTL) || 3600) => {
    try {
        // Always store in memory as a secondary/primary fallback
        _setMemoryData(key, data, ttl);

        if (!redisAvailable) return true;

        const client = getRedisClient();
        if (!client) return true;

        await client.setex(key, ttl, JSON.stringify(data));
        return true;
    } catch (error) {
        return true;
    }
};

/**
 * Delete cached data
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} - Success status
 */
const deleteCachedData = async (key) => {
    try {
        // Clear memory cache
        memoryCache.delete(key);
        memoryExpiry.delete(key);

        if (!redisAvailable) return true;

        const client = getRedisClient();
        if (!client) return true;

        await client.del(key);
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Generate cache key from query parameters
 * @param {object} params - Query parameters
 * @returns {string} - Cache key
 */
const generateCacheKey = (params) => {
    const { keyword = "", location = "", type = "", source = "", page = 1, limit = 20 } = params;
    return `jobs:${keyword}:${location}:${type}:${source}:${page}:${limit}`;
};

/**
 * Close Redis connection
 */
const closeRedis = async () => {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
    }
};

export {
    initRedis,
    getRedisClient,
    getCachedData,
    setCachedData,
    deleteCachedData,
    generateCacheKey,
    closeRedis
};
