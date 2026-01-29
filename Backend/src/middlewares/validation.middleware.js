import Joi from "joi";
import { ApiError } from "../utils/ApiError.js";

/**
 * Validation schemas
 */
const jobQuerySchema = Joi.object({
    keyword: Joi.string().trim().max(100).optional().allow(""),
    location: Joi.string().trim().max(100).optional().allow(""),
    type: Joi.string()
        .valid("Full-time", "Part-time", "Contract", "Internship")
        .optional()
        .allow(""),
    source: Joi.string()
        .valid("internal", "adzuna", "jsearch", "remotive", "external")
        .optional()
        .allow(""),
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(100).optional().default(20)
});

/**
 * Middleware to validate job query parameters
 */
const validateJobQuery = (req, res, next) => {
    const { error, value } = jobQuerySchema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        const errors = error.details.map(detail => detail.message).join(", ");
        throw new ApiError(400, `Validation error: ${errors}`);
    }

    // Assign validated values to req.query properties (can't replace the whole object)
    Object.keys(value).forEach(key => {
        req.query[key] = value[key];
    });

    next();
};

/**
 * Middleware to validate job ID parameter
 */
const validateJobId = (req, res, next) => {
    const { jobId } = req.params;

    if (!jobId || jobId.trim() === "") {
        throw new ApiError(400, "Job ID is required");
    }

    // Sanitize job ID
    req.params.jobId = jobId.trim();
    next();
};

export { validateJobQuery, validateJobId };
