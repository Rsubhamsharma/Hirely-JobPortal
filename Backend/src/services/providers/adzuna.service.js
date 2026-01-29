import axios from "axios";

/**
 * Adzuna Job API Provider
 * Documentation: https://developer.adzuna.com/
 */

const ADZUNA_BASE_URL = "https://api.adzuna.com/v1/api/jobs";

/**
 * Fetch jobs from Adzuna API
 * @param {object} params - Query parameters
 * @returns {Promise<Array>} - Normalized job array
 */
const fetchJobs = async (params = {}) => {
    try {
        let { keyword = "", location = "us", page = 1, limit = 20 } = params;

        // Ensure location is a valid country code for Adzuna
        // Adzuna requires a country code (e.g., 'in', 'us', 'gb').
        // If the location is a full name or 'all', we might need a mapping, 
        // but for now we'll just ensure it's not breaking.
        if (!location || location.toLowerCase() === "all" || location.toLowerCase() === "any") {
            location = "in"; // default to India as per user context
        } else if (location.length > 2) {
            // If user enters "India" or "Mumbia", Adzuna might fail without 2-letter code
            // So we use "in" and let the 'what' query handle the city/state
            keyword = `${keyword} ${location}`.trim();
            location = "in";
        }

        const appId = process.env.ADZUNA_APP_ID;
        const apiKey = process.env.ADZUNA_API_KEY;

        if (!appId || !apiKey) {
            console.warn("Adzuna API credentials not configured");
            return [];
        }

        // Adzuna uses 1-based pagination
        const url = `${ADZUNA_BASE_URL}/${location}/search/${page}`;

        const response = await axios.get(url, {
            params: {
                app_id: appId,
                app_key: apiKey,
                results_per_page: limit,
                what: keyword
            },
            timeout: 10000 // 10 second timeout
        });

        if (!response.data || !response.data.results) {
            return [];
        }

        // Normalize Adzuna jobs to unified schema
        const normalizedJobs = response.data.results.map(job => normalizeJob(job));
        return normalizedJobs;
    } catch (error) {
        if (error.response?.status === 429) {
            console.error("❌ Adzuna API rate limit exceeded");
        } else if (error.code === "ECONNABORTED") {
            console.error("❌ Adzuna API timeout");
        } else {
            console.error("❌ Adzuna API error:", error.message);
        }
        return [];
    }
};

/**
 * Normalize Adzuna job to unified schema
 * @param {object} job - Raw Adzuna job object
 * @returns {object} - Normalized job
 */
const normalizeJob = (job) => {
    return {
        id: `adzuna_${job.id}`,
        title: job.title || "Untitled Position",
        company: job.company?.display_name || "Company Not Listed",
        location: job.location?.display_name || "Location Not Specified",
        type: mapJobType(job.contract_time),
        salary: formatSalary(job.salary_min, job.salary_max),
        description: job.description || "No description available",
        applyUrl: `/api/v1/jobs/redirect/adzuna_${job.id}`, // Use redirect route
        source: "adzuna",
        sourceLogo: "https://www.adzuna.com/favicon.ico",
        postedAt: job.created ? new Date(job.created) : new Date(),
        status: "active",
        externalUrl: job.redirect_url // Store original URL for redirect
    };
};

/**
 * Map Adzuna contract_time to unified job type
 * @param {string} contractTime - Adzuna contract time
 * @returns {string} - Unified job type
 */
const mapJobType = (contractTime) => {
    if (!contractTime) return "Full-time";

    const type = contractTime.toLowerCase();
    if (type.includes("full")) return "Full-time";
    if (type.includes("part")) return "Part-time";
    if (type.includes("contract")) return "Contract";
    if (type.includes("intern")) return "Internship";

    return "Full-time";
};

/**
 * Format salary range
 * @param {number} min - Minimum salary
 * @param {number} max - Maximum salary
 * @returns {string|null} - Formatted salary or null
 */
const formatSalary = (min, max) => {
    if (!min && !max) return null;

    if (min && max) {
        return `$${Math.round(min).toLocaleString()} - $${Math.round(max).toLocaleString()}`;
    }

    if (min) {
        return `From $${Math.round(min).toLocaleString()}`;
    }

    if (max) {
        return `Up to $${Math.round(max).toLocaleString()}`;
    }

    return null;
};

export { fetchJobs };
