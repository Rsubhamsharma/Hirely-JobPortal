import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * AI Service for Job Description Expansion & Summarization
 * Uses Google Gemini API to expand brief snippets into full postings
 */

/**
 * Expand a job snippet into a full, professional job description
 * @param {object} jobData - Basic job info (title, company, description, etc.)
 * @returns {Promise<string>} - Expanded job description
 */
export const generateFullDescription = async (jobData) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return jobData.description;
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: "v1" });
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
You are a senior technical recruiter. Generate a COMPLETE, PROFESSIONAL, and COMPREHENSIVE job description based on the provided input.

CRITICAL: The input is a SHORT SNIPPET (often truncated with ...). You MUST expand it into a full professional job posting like you'd see on LinkedIn or Indeed. Use logical reasoning based on the job title and company name to fill in common responsibilities and requirements if they are missing from the snippet.

INPUT DATA:
- JOB TITLE: ${jobData.title}
- COMPANY: ${jobData.company}
- LOCATION: ${jobData.location || "Remote"}
- SNIPPET: ${jobData.description}

STRUCTURE TO FOLLOW:
1. ABOUT THE COMPANY: Write 2-3 professional sentences about the company/industry.
2. ABOUT THE ROLE: Write a detailed paragraph about the day-to-day impact.
3. KEY RESPONSIBILITIES: List 8-10 detailed bullet points using action verbs.
4. REQUIRED QUALIFICATIONS: Extract and expand on specific requirements (technical skills, experience).
5. PREFERRED QUALIFICATIONS: NICE-to-have skills.
6. WHAT WE OFFER: Standard industry benefits.
7. COMPENSATION: "Competitive salary based on experience" unless specified.

CRITICAL INSTRUCTIONS:
- The output MUST be at least 600 words long.
- Do NOT repeat technical headers from the snippet like "Position Title:", "Function:", or "Job Description:".
- Do NOT include the snippet's ellipsis (...).
- Broaden the scope of responsibilities and requirements based on the Job Title if the snippet is too sparse.
- Ensure the formatting is consistent with section headers in ALL CAPS.

FORMATTING RULES:
- Use ALL CAPS for section headers.
- Each bullet starts with a dash (-) on a new line.
- Do NOT use markdown code blocks (e.g. \`\`\`).
- Ensure the tone is professional, direct, and encouraging.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        if (!text || text.length < 200) {
            return jobData.description;
        }

        // Clean up any AI artifacts (like markdown triple backticks)
        text = text.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();

        return text;
    } catch (error) {
        // Silently fail to original description if needed
        return jobData.description; // Return original if AI fails
    }
};
