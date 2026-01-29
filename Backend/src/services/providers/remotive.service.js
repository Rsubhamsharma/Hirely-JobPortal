import axios from "axios";

/**
 * Remotive Job API Provider
 * Documentation: https://remotive.com/api-documentation
 */

const REMOTIVE_BASE_URL = "https://remotive.com/api/remote-jobs";

/**
 * Fetch jobs from Remotive API
 * @param {object} params - Query parameters
 * @returns {Promise<Array>} - Normalized job array
 */
const fetchJobs = async (params = {}) => {
    try {
        const { keyword = "", limit = 20 } = params;

        // Remotive API is free and doesn't require authentication
        const response = await axios.get(REMOTIVE_BASE_URL, {
            params: {
                search: keyword,
                limit: limit
            },
            timeout: 10000 // 10 second timeout
        });

        if (!response.data || !response.data.jobs) {
            return [];
        }

        // Normalize Remotive jobs to unified schema
        return response.data.jobs.map(job => normalizeJob(job));
    } catch (error) {
        if (error.response?.status === 429) {
            console.error("Remotive API rate limit exceeded");
        } else if (error.code === "ECONNABORTED") {
            console.error("Remotive API timeout");
        } else {
            console.error("Remotive API error:", error.message);
        }
        return [];
    }
};

/**
 * Normalize Remotive job to unified schema
 * @param {object} job - Raw Remotive job object
 * @returns {object} - Normalized job
 */
const normalizeJob = (job) => {
    return {
        id: `remotive_${job.id}`,
        title: job.title || "Untitled Position",
        company: job.company_name || "Company Not Listed",
        location: job.candidate_required_location || "Remote",
        type: mapJobType(job.job_type),
        salary: job.salary || null,
        description: job.description || "No description available",
        applyUrl: `/api/v1/jobs/redirect/remotive_${job.id}`, // Use redirect route
        source: "remotive",
        sourceLogo: job.company_logo || "https://remotive.com/favicon.ico",
        postedAt: job.publication_date ? new Date(job.publication_date) : new Date(),
        status: "active",
        externalUrl: job.url // Store original URL for redirect
    };
};

/**
 * Map Remotive job_type to unified job type
 * @param {string} jobType - Remotive job type
 * @returns {string} - Unified job type
 */
const mapJobType = (jobType) => {
    if (!jobType) return "Full-time";

    const type = jobType.toLowerCase();
    if (type.includes("full")) return "Full-time";
    if (type.includes("part")) return "Part-time";
    if (type.includes("contract")) return "Contract";
    if (type.includes("intern")) return "Internship";

    return "Full-time";
};

export { fetchJobs };
