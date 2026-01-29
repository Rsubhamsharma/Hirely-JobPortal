import axios from "axios";

/**
 * JSearch Job API Provider (RapidAPI)
 * Documentation: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
 */

const JSEARCH_BASE_URL = "https://jsearch.p.rapidapi.com/search";

/**
 * Fetch jobs from JSearch API
 * @param {object} params - Query parameters
 * @returns {Promise<Array>} - Normalized job array
 */
const fetchJobs = async (params = {}) => {
    try {
        const { keyword = "", location = "", page = 1, limit = 20 } = params;

        const apiKey = process.env.JSEARCH_API_KEY;

        if (!apiKey) {
            console.warn("JSearch API key not configured");
            return [];
        }

        // Build query string
        let query = keyword;
        if (location) {
            query += ` in ${location}`;
        }

        const response = await axios.get(JSEARCH_BASE_URL, {
            params: {
                query: query,
                page: page.toString(),
                num_pages: "1",
                date_posted: "all"
            },
            headers: {
                "X-RapidAPI-Key": apiKey,
                "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
            },
            timeout: 10000 // 10 second timeout
        });

        if (!response.data || !response.data.data) {
            return [];
        }

        // Limit results to requested limit
        const jobs = response.data.data.slice(0, limit);

        // Normalize JSearch jobs to unified schema
        return jobs.map(job => normalizeJob(job));
    } catch (error) {
        if (error.response?.status === 429) {
            console.error("JSearch API rate limit exceeded");
        } else if (error.code === "ECONNABORTED") {
            console.error("JSearch API timeout");
        } else {
            console.error("JSearch API error:", error.message);
        }
        return [];
    }
};

/**
 * Normalize JSearch job to unified schema
 * @param {object} job - Raw JSearch job object
 * @returns {object} - Normalized job
 */
const normalizeJob = (job) => {
    return {
        id: `jsearch_${job.job_id}`,
        title: job.job_title || "Untitled Position",
        company: job.employer_name || "Company Not Listed",
        location: formatLocation(job),
        type: mapJobType(job.job_employment_type),
        salary: formatSalary(job),
        description: job.job_description || "No description available",
        applyUrl: `/api/v1/jobs/redirect/jsearch_${job.job_id}`, // Use redirect route
        source: "jsearch",
        sourceLogo: job.employer_logo || "https://jsearch.p.rapidapi.com/favicon.ico",
        postedAt: job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc) : new Date(),
        status: "active",
        externalUrl: job.job_apply_link // Store original URL for redirect
    };
};

/**
 * Format location from JSearch job data
 * @param {object} job - JSearch job object
 * @returns {string} - Formatted location
 */
const formatLocation = (job) => {
    if (job.job_city && job.job_state) {
        return `${job.job_city}, ${job.job_state}`;
    }
    if (job.job_city) {
        return job.job_city;
    }
    if (job.job_state) {
        return job.job_state;
    }
    if (job.job_country) {
        return job.job_country;
    }
    return "Remote";
};

/**
 * Map JSearch employment type to unified job type
 * @param {string} employmentType - JSearch employment type
 * @returns {string} - Unified job type
 */
const mapJobType = (employmentType) => {
    if (!employmentType) return "Full-time";

    const type = employmentType.toLowerCase();
    if (type.includes("fulltime") || type.includes("full_time")) return "Full-time";
    if (type.includes("parttime") || type.includes("part_time")) return "Part-time";
    if (type.includes("contract") || type.includes("contractor")) return "Contract";
    if (type.includes("intern")) return "Internship";

    return "Full-time";
};

/**
 * Format salary from JSearch job data
 * @param {object} job - JSearch job object
 * @returns {string|null} - Formatted salary or null
 */
const formatSalary = (job) => {
    const min = job.job_min_salary;
    const max = job.job_max_salary;

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
