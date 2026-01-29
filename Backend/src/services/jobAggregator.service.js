import Job from "../models/job.schema.js";
import * as adzunaService from "./providers/adzuna.service.js";
import * as jsearchService from "./providers/jsearch.service.js";
import * as remotiveService from "./providers/remotive.service.js";
import { getCachedData, setCachedData, generateCacheKey } from "./redis.service.js";
import { normalizeInternalJob, isValidJob, deduplicateJobs, sortJobsByDate } from "../utils/jobNormalizer.util.js";

/**
 * Main Job Aggregator Service
 * Combines internal DB jobs with external API jobs
 */

/**
 * Aggregate jobs from all sources
 * @param {object} filters - Filter parameters
 * @returns {Promise<object>} - Aggregated jobs with metadata
 */
const aggregateJobs = async (filters = {}) => {
    try {
        const {
            keyword = "",
            location = "",
            type = "",
            source = "",
            page = 1,
            limit = 20
        } = filters;

        // Ensure keyword is not empty for external APIs
        const searchKeyword = keyword.trim();

        // Check if external jobs are enabled (default to FALSE for safety)
        const externalJobsEnabled = process.env.ENABLE_EXTERNAL_JOBS === "true";



        // Generate cache key
        const cacheKey = generateCacheKey(filters);

        // Try to get from cache first
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            return cachedData;
        }



        // Fetch jobs from all sources in parallel
        const jobPromises = [];

        // 1. Fetch internal jobs
        jobPromises.push(fetchInternalJobs({ keyword, location, type }));

        // 2. Fetch external jobs (ONLY if enabled and not filtered to internal only)
        if (externalJobsEnabled && source !== "internal") {
            if (source === "" || source === "external" || source === "adzuna") {
                jobPromises.push(fetchExternalJobs("adzuna", { keyword: searchKeyword, location, limit }));
            }
            if (source === "" || source === "external" || source === "jsearch") {
                jobPromises.push(fetchExternalJobs("jsearch", { keyword: searchKeyword, location, limit }));
            }
            if (source === "" || source === "external" || source === "remotive") {
                jobPromises.push(fetchExternalJobs("remotive", { keyword: searchKeyword, location, limit }));
            }
        }

        // Wait for all promises to resolve
        const results = await Promise.allSettled(jobPromises);

        // Combine all jobs
        let allJobs = [];
        results.forEach((result, index) => {
            const providerNames = ["internal", "adzuna", "jsearch", "remotive"];
            const providerName = providerNames[index] || `Source ${index}`;

            if (result.status === "fulfilled" && Array.isArray(result.value)) {
                allJobs = allJobs.concat(result.value);
            } else if (result.status === "rejected") {
                // Not using console.error here to keep terminal clean as per previous tasks, 
                // but usually good for debugging. User wanted clean terminals.
            }
        });

        // Filter out invalid jobs
        allJobs = allJobs.filter(isValidJob);

        // Apply source filter if specified
        if (source && source !== "external") {
            allJobs = allJobs.filter(job => job.source === source);
        }

        // Deduplicate jobs
        allJobs = deduplicateJobs(allJobs);

        // Cache external jobs individually for Detail Page lookups
        if (externalJobsEnabled) {
            allJobs.forEach(job => {
                if (job.source !== "internal") {
                    const individualCacheKey = `job:${job.id}`;
                    setCachedData(individualCacheKey, job).catch(() => { });
                }
            });
        }

        // Sort by posted date (newest first)
        allJobs = sortJobsByDate(allJobs);

        // Optional: Interleave sources if we're on page 1 and no specific sort is applied
        if (page == 1 && !filters.sortBy) {
            const internalJobs = allJobs.filter(j => j.source === "internal");
            const adzunaJobs = allJobs.filter(j => j.source === "adzuna");
            const jsearchJobs = allJobs.filter(j => j.source === "jsearch");
            const remotiveJobs = allJobs.filter(j => j.source === "remotive");

            const mixed = [];
            let i = 0;
            while (mixed.length < allJobs.length) {
                if (internalJobs[i]) mixed.push(internalJobs[i]);
                if (adzunaJobs[i]) mixed.push(adzunaJobs[i]);
                if (jsearchJobs[i]) mixed.push(jsearchJobs[i]);
                if (remotiveJobs[i]) mixed.push(remotiveJobs[i]);
                i++;
                if (i > allJobs.length) break;
            }
            allJobs = mixed;
        }

        // Calculate pagination
        const total = allJobs.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        // Get paginated jobs
        const paginatedJobs = allJobs.slice(startIndex, endIndex);

        // Prepare response
        const response = {
            jobs: paginatedJobs,
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages
        };

        // Cache the response
        setCachedData(cacheKey, response).catch(() => { });

        return response;
    } catch (error) {
        console.error("💥 CRITICAL: Job aggregation error:", error);

        // Fallback: try to return at least internal jobs
        try {

            const internalJobs = await fetchInternalJobs({
                keyword: filters.keyword || "",
                location: filters.location || "",
                type: filters.type || ""
            });

            const total = internalJobs.length;
            const page = parseInt(filters.page) || 1;
            const limit = parseInt(filters.limit) || 20;
            const totalPages = Math.ceil(total / limit);
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedJobs = internalJobs.slice(startIndex, endIndex);

            return {
                jobs: paginatedJobs,
                page,
                limit,
                total,
                totalPages
            };
        } catch (fallbackError) {
            // Last resort: return empty result
            return {
                jobs: [],
                page: 1,
                limit: 20,
                total: 0,
                totalPages: 0
            };
        }
    }
};

/**
 * Fetch internal jobs from database
 * @param {object} filters - Filter parameters
 * @returns {Promise<Array>} - Normalized internal jobs
 */
const fetchInternalJobs = async (filters = {}) => {
    try {
        const { keyword = "", location = "", type = "" } = filters;

        // Build query
        const query = { status: { $ne: "closed" } };

        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } }
            ];
        }

        if (location) {
            query.location = { $regex: location, $options: "i" };
        }

        if (type) {
            query.jobType = type;
        }

        // Fetch jobs from database
        const jobs = await Job.find(query)
            .populate({
                path: "postedBy",
                select: "fullname email role"
            })
            .populate({
                path: "profile",
                select: "profileimage companyName companyLogo aboutCompany"
            })
            .lean();

        // Normalize internal jobs
        return jobs.map(normalizeInternalJob);
    } catch (error) {
        console.error("Error fetching internal jobs:", error);
        return [];
    }
};

/**
 * Fetch external jobs from specified provider
 * @param {string} provider - Provider name (adzuna, jsearch, remotive)
 * @param {object} params - Query parameters
 * @returns {Promise<Array>} - Normalized external jobs
 */
const fetchExternalJobs = async (provider, params = {}) => {
    try {
        switch (provider) {
            case "adzuna":
                return await adzunaService.fetchJobs(params);
            case "jsearch":
                return await jsearchService.fetchJobs(params);
            case "remotive":
                return await remotiveService.fetchJobs(params);
            default:
                console.warn(`Unknown provider: ${provider}`);
                return [];
        }
    } catch (error) {
        console.error(`Error fetching jobs from ${provider}:`, error);
        return [];
    }
};

/**
 * Get external job URL by ID
 * @param {string} jobId - Job ID (format: provider_id)
 * @returns {Promise<string|null>} - External URL or null
 */
const getExternalJobUrl = async (jobId) => {
    try {
        // Parse job ID to extract provider and original ID
        const [provider, ...idParts] = jobId.split("_");
        const originalId = idParts.join("_");

        // For external jobs, we need to fetch the job again to get the URL
        // Check individual cache first
        const job = await getCachedData(`job:${jobId}`);
        if (job && job.externalUrl) {
            return job.externalUrl;
        }

        // For now, we'll construct URLs based on provider patterns
        switch (provider) {
            case "adzuna":
                // Adzuna jobs need to be fetched to get redirect URL
                return `https://www.adzuna.com/details/${originalId}`;
            case "jsearch":
                // JSearch jobs need to be fetched to get apply link
                return null;
            case "remotive":
                // Remotive has a predictable URL pattern
                return `https://remotive.com/remote-jobs/${originalId}`;
            default:
                return null;
        }
    } catch (error) {
        console.error("Error getting external job URL:", error);
        return null;
    }
};

export {
    aggregateJobs,
    fetchInternalJobs,
    fetchExternalJobs,
    getExternalJobUrl
};
