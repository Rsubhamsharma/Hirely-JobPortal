/**
 * AI Configuration for Job Summarization
 *
 * To use real AI summarization:
 * 1. Get an API key from Google AI Studio (https://aistudio.google.com/) or OpenAI.
 * 2. Add it to the configuration below.
 */

export const CACHE_VERSION = 'v8'; // Increment for absolute question exclusion

export const AI_CONFIG = {
   // Set to 'gemini' or 'openai' or null to use local heuristic
   activeProvider: 'gemini',

   // Your API keys go here
   keys: {
      gemini: process.env.REACT_APP_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "",
      openai: process.env.REACT_APP_OPENAI_API_KEY || process.env.OPENAI_API_KEY || ""
   },

   // IMPORTANT: This prompt generates TWO sections separated by ===FULL_DESCRIPTION===
   // Section 1: Brief summary for "Recruiter's Role Overview" card (3-4 bullet sections)
   // Section 2: FULL comprehensive description for "Full Job Description" card
   recruiterPrompt: `
You are a senior technical recruiter. Generate TWO DISTINCT sections for a job posting.

CRITICAL: The input may be a SHORT SNIPPET. You MUST generate COMPLETE content regardless.
CRITICAL 2: Section 1 (BRIEF OVERVIEW) MUST NOT, UNDER ANY CIRCUMSTANCES, INCLUDE ANY QUESTIONS. 
NO screening questions, NO interview questions, NO "How to Apply" questions. 
If the input has questions, STRIP THEM OUT from Section 1. Section 1 is ONLY for the Job Narrative.

===SECTION 1: BRIEF OVERVIEW (for summary card)===
Write a CONCISE summary with these subsections:
- Position Title (1 line)
- Key Responsibilities (3-4 bullet points, brief, extracted from description)  
- Required Skills (3-4 SPECIFIC technical skills extracted from description. Avoid generic phrases.)
- Role Details (location, experience, salary if known)

Keep this section SHORT (under 300 words). Use dash bullets (-).

===FULL_DESCRIPTION===

===SECTION 2: COMPREHENSIVE JOB DESCRIPTION (for main job card)===
Create a DETAILED, PROFESSIONAL job posting like you'd see on LinkedIn or Indeed:

ABOUT THE COMPANY
Write 2-3 sentences about the type of company and industry based on the company name.

ABOUT THE ROLE
Write 3-5 sentences describing:
- What this role does day-to-day
- The impact and importance of this position  
- Team structure and work environment
- Growth opportunities

KEY RESPONSIBILITIES
Extrapolate and expand on the provided input to create 8-10 detailed bullet points using action verbs.

REQUIRED QUALIFICATIONS
Extract and expand on specific requirements from the input:
- Technical skills with specific tools/technologies mentioned
- Education and years of experience
- Soft skills

PREFERRED QUALIFICATIONS  
3-4 nice-to-have skills or experience

WHAT WE OFFER
4-5 benefits and perks (standard industry benefits)

COMPENSATION
State salary if provided, otherwise "Competitive salary based on experience"

HOW TO APPLY
Brief call-to-action

---
FORMATTING RULES:
- Each bullet starts with a dash (-) on a NEW LINE
- Section headers on their own line, ALL CAPS
- No markdown code blocks or emojis
- Professional, direct language
- CRITICAL: Extract FACTUAL technical skills mentioned in the description for the REQUIRED SKILLS sections.

REMEMBER: The FULL_DESCRIPTION section should be 600-800 words.
`
};
