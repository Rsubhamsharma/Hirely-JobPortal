import axios from "axios";
import * as cheerio from "cheerio";

/**
 * Scrape full job description from external job URLs
 * This fetches the original job page and extracts the full description
 */

// Cache scraped descriptions to avoid repeated requests
const descriptionCache = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

/**
 * Fetch and extract full job description from external URL
 * @param {string} url - The original job posting URL
 * @returns {Promise<string|null>} - Full job description or null if failed
 */
const scrapeJobDescription = async (url) => {
    if (!url) return null;

    // Check cache first
    const cached = descriptionCache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.description;
    }

    try {


        // Fetch the page with a browser-like user agent
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1"
            },
            timeout: 15000, // 15 second timeout
            maxRedirects: 5
        });

        const html = response.data;
        const $ = cheerio.load(html);
        let description = "";

        // Remove script, style, nav, header, footer elements
        // BUT keep script tags of type application/ld+json for extraction
        const jsonLdScripts = $('script[type="application/ld+json"]');
        $("script:not([type='application/ld+json']), style, nav, header, footer, noscript, iframe, .cookie-banner, .popup").remove();

        // 1. Try to find the description in Structured Data (JSON-LD)
        // This is often the most reliable way for JS-heavy sites
        jsonLdScripts.each((i, el) => {
            try {
                const data = JSON.parse($(el).html());
                // Handle both single objects and arrays of "@graph"
                const findDescription = (obj) => {
                    if (!obj) return null;

                    // Direct JobPosting check
                    if (obj["@type"] === "JobPosting" && obj.description) {
                        return obj.description;
                    }

                    if (obj.description && typeof obj.description === 'string' && obj.description.length > 200) return obj.description;

                    if (Array.isArray(obj)) {
                        for (const item of obj) {
                            const found = findDescription(item);
                            if (found) return found;
                        }
                    }
                    if (typeof obj === 'object') {
                        if (obj["@graph"]) return findDescription(obj["@graph"]);
                        for (const key in obj) {
                            if (typeof obj[key] === 'object') {
                                const found = findDescription(obj[key]);
                                if (found) return found;
                            }
                        }
                    }
                    return null;
                };

                const foundDescription = findDescription(data);
                if (foundDescription) {
                    description = foundDescription;
                }
            } catch (e) {
                // Ignore parse errors
            }
        });

        if (!description || description.length < 200) {
            // Common selectors for job descriptions across job boards
            const descriptionSelectors = [
                // Talent500 specific
                ".jd-text",
                ".job-description-content",
                ".jd-content",
                ".job-posting-description",

                // T-Mobile / Enterprise job boards
                ".job-description",
                ".job-details",
                "[data-automation='jobDescription']",
                "[data-testid='jobDescription']",
                ".job-content",
                "#job-description",
                "#jobDescription",
                ".description-content",
                ".job-posting-content",

                // LinkedIn
                ".description__text",
                ".show-more-less-html",

                // Indeed / Workday
                "#jobDescriptionText",
                ".jobsearch-jobDescriptionText",
                ".job-body",

                // Greenhouse / Lever
                ".content",
                ".section-wrapper",
                "[class*='job-description']",
                "[class*='jobDescription']",

                // Generic fallbacks
                "article",
                "main",
                ".main-content",
                ".content-wrapper",
                "[role='main']"
            ];

            // Try each selector until we find substantial content
            for (const selector of descriptionSelectors) {
                const element = $(selector);
                if (element.length > 0) {
                    // Get the text content, preserving some structure
                    const text = element.text().trim();

                    // Only use if it has substantial content (more than 200 chars)
                    if (text.length > 200 && text.length > description.length) {
                        // Get HTML to preserve structure
                        description = element.html() || text;
                    }
                }
            }
        }

        // If still no description, try to get the body text
        if (!description || description.length < 200) {
            const bodyText = $("body").text().trim();
            if (bodyText.length > 500) {
                // Extract a reasonable portion
                description = bodyText;
            }
        }

        // Clean up the description
        description = cleanDescription(description);

        if (description && description.length > 100) {
            // Cache the result
            descriptionCache.set(url, {
                description,
                timestamp: Date.now()
            });


            return description;
        }


        return null;

    } catch (error) {

        return null;
    }
};

/**
 * Clean up scraped HTML description
 */
const cleanDescription = (html) => {
    if (!html) return "";

    // Remove excessive whitespace
    let text = html
        .replace(/\s+/g, " ")  // Multiple spaces to single
        .replace(/\n\s*\n/g, "\n")  // Multiple newlines to single
        .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, "<br/>")  // Double <br> to single
        .trim();

    // Remove common noise patterns
    const noisePatterns = [
        /cookie\s*(policy|notice|consent)/gi,
        /privacy\s*policy/gi,
        /accept\s*cookies/gi,
        /sign\s*in\s*to\s*apply/gi,
        /create\s*an\s*account/gi,
        /already\s*have\s*an\s*account/gi
    ];

    for (const pattern of noisePatterns) {
        text = text.replace(pattern, "");
    }

    return text;
};

/**
 * Clear the description cache
 */
const clearCache = () => {
    descriptionCache.clear();

};

export { scrapeJobDescription, clearCache };
