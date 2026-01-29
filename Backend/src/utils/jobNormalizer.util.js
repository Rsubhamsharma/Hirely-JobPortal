/**
 * Utility functions for normalizing internal DB jobs to unified schema
 */

/**
 * Normalize internal DB job to unified schema
 * @param {object} job - Internal job from database
 * @returns {object} - Normalized job
 */
const normalizeInternalJob = (job) => {
    return {
        id: job._id.toString(),
        title: job.title || "Untitled Position",
        company: job.company || "Company Not Listed",
        location: job.location || "Location Not Specified",
        type: job.jobType || "Full-time",
        salary: formatSalary(job.salary),
        description: job.description || "No description available",
        applyUrl: `/api/v1/jobs/apply/${job._id}`, // Internal application route
        source: "internal",
        sourceLogo: job.profile?.companyLogo || "/default-company-logo.png",
        postedAt: job.createdAt || new Date(),
        // Additional internal fields
        postedBy: job.postedBy,
        profile: job.profile,
        status: job.status,
        skills: job.skills || [],
        experience: job.experience || "",
        responsibilities: job.responsibilities || "",
        companydetails: job.companydetails || ""
    };
};

/**
 * Format salary for display
 * @param {number} salary - Salary amount
 * @returns {string|null} - Formatted salary or null
 */
const formatSalary = (salary) => {
    if (!salary || salary === 0) return null;

    if (typeof salary === "string") {
        return salary;
    }

    if (typeof salary === "number") {
        return `$${salary.toLocaleString()}`;
    }

    return null;
};

/**
 * Validate and sanitize job object
 * @param {object} job - Job object
 * @returns {boolean} - Whether job is valid
 */
const isValidJob = (job) => {
    if (!job) return false;
    if (!job.id) return false;
    if (!job.title || job.title.trim() === "") return false;
    if (!job.source) return false;

    return true;
};

/**
 * Remove duplicate jobs based on title and company
 * @param {Array} jobs - Array of jobs
 * @returns {Array} - Deduplicated jobs
 */
const deduplicateJobs = (jobs) => {
    const seen = new Map();
    const deduplicated = [];

    for (const job of jobs) {
        // Create a key based on normalized title and company
        const key = `${job.title.toLowerCase().trim()}_${job.company.toLowerCase().trim()}`;

        if (!seen.has(key)) {
            seen.set(key, true);
            deduplicated.push(job);
        }
    }

    return deduplicated;
};

/**
 * Sort jobs by posted date (newest first)
 * @param {Array} jobs - Array of jobs
 * @returns {Array} - Sorted jobs
 */
const sortJobsByDate = (jobs) => {
    return jobs.sort((a, b) => {
        const dateA = new Date(a.postedAt);
        const dateB = new Date(b.postedAt);
        return dateB - dateA; // Newest first
    });
};

export {
    normalizeInternalJob,
    formatSalary,
    isValidJob,
    deduplicateJobs,
    sortJobsByDate
};
