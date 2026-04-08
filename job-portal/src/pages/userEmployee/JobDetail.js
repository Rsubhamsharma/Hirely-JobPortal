import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";
import { AI_CONFIG, CACHE_VERSION } from '../../config/aiConfig';
import CompanyLogo from "../../components/CompanyLogo";

const summaryCache = new Map();

const JobDetail = () => {
    const { jobId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const formatSimple = (text) => {
        if (!text) return "";
        let formatted = text.replace(/\r\n/g, '\n');

        // Secondary safety: programmatically remove any lines that look like questions from the overview
        const lines = formatted.split('\n');
        const cleanLines = lines.filter(line => {
            const trimmed = line.trim();
            // Skip lines ending in ? or starting with question words if very short
            if (trimmed.endsWith('?')) return false;
            if (/^(?:why|how|what|can|could|would|are|is|do|does)\s/i.test(trimmed) && trimmed.length < 100) return false;
            return true;
        });

        formatted = cleanLines.join('\n');

        // Simple bullet to span conversion for Role Overview
        formatted = formatted.replace(/^\s*[-•*]\s+/gm, '<span class="text-indigo-500 mr-2">•</span>');
        return formatted.split('\n').join('<br/>');
    };

    const formatBullets = (text, forceBullets = false) => {
        if (!text) return "";

        let formatted = text;

        // 1. Normalize line breaks
        formatted = formatted.replace(/\r\n/g, '\n');

        // 2. Identify and format section headers
        formatted = formatted.replace(/^(\d+\.\s*)?([A-Z][A-Za-z\s&/]{3,}):?\s*$/gm,
            (match, p1, p2) => `<strong class="job-section-header">${p2}</strong>`);

        // 3. Process lines to handle lists properly
        const lines = formatted.split('\n');
        let inList = false;
        let inResponsibilitySection = forceBullets; // If forced, start in responsibility mode
        let result = [];

        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine) {
                if (inList) {
                    result.push('</ul>');
                    inList = false;
                }
                return;
            }

            // Check if this line is a section header (we already wrapped them in <strong>)
            const isHeader = trimmedLine.startsWith('<strong class="job-section-header">');

            if (isHeader) {
                if (inList) {
                    result.push('</ul>');
                    inList = false;
                }

                // If it's a "Responsibilities" header, start auto-bulleting
                if (trimmedLine.toLowerCase().includes('responsibilit')) {
                    inResponsibilitySection = true;
                } else {
                    inResponsibilitySection = false;
                }

                result.push(trimmedLine);
                return;
            }

            // Detect existing markers
            const hasExistingMarker = /^\s*([-•*]|\d+[.)]|[a-z][.)])\s+/.test(line) ||
                (/^\s*[-•*]\s*/.test(line) && trimmedLine.length > 1);

            // It's a bullet if it has a marker OR if we're in a responsibility section
            const isBullet = hasExistingMarker || (inResponsibilitySection && trimmedLine.length > 3);

            if (isBullet) {
                if (!inList) {
                    result.push('<ul class="job-list">');
                    inList = true;
                }
                // Strip existing marker if it exists, otherwise use the whole trimmed line
                const content = hasExistingMarker
                    ? trimmedLine.replace(/^([-•*]|\d+[.)]|[a-z][.)])\s*/, '')
                    : trimmedLine;
                result.push(`<li>${content}</li>`);
            } else {
                if (inList) {
                    result.push('</ul>');
                    inList = false;
                }
                if (trimmedLine.startsWith('<')) {
                    result.push(trimmedLine);
                } else {
                    result.push(`<p>${trimmedLine}</p>`);
                }
            }
        });

        if (inList) result.push('</ul>');

        formatted = result.join('\n');

        // 4. Final Cleanup
        formatted = formatted.replace(/₹\s*\$/g, '$');

        return formatted.trim();
    };

    // --- UI Helpers for Consistent Data Display ---

    const formatSalary = (salary) => {
        if (!salary || salary === "Disclosed on call" || salary === "Competitive") return "Disclosed on call";
        const salaryStr = String(salary);

        // Check if it already has a currency symbol ($, ₹, etc)
        if (salaryStr.match(/[₹$€£]/)) return salaryStr;

        // Otherwise format with Rupee as default
        try {
            const num = parseFloat(salaryStr.replace(/[^0-9.]/g, ''));
            if (isNaN(num)) return salaryStr;
            return `₹${num.toLocaleString()} `;
        } catch (e) {
            return salaryStr;
        }
    };

    const getPostedByText = (job) => {
        if (job.postedBy?.fullname) return job.postedBy.fullname;
        if (job.source && job.source !== "internal") {
            const sourceName = job.source.charAt(0).toUpperCase() + job.source.slice(1);
            return `via ${sourceName} `;
        }
        return "Recruiter";
    };

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [shouldShowSkeleton, setShouldShowSkeleton] = useState(false); // Controls if we actually show the skeleton
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [applying, setApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [aiSummary, setAiSummary] = useState("");  // Brief summary for Role Overview card
    const [aiFullDescription, setAiFullDescription] = useState("");  // Full description for Job Description card
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);
    const [scrapedDescription, setScrapedDescription] = useState(null);
    const [isScraping, setIsScraping] = useState(false);
    const [isAiEnhanced, setIsAiEnhanced] = useState(false);

    // Application form state
    const [applicationForm, setApplicationForm] = useState({
        phone: "",
        coverLetter: "",
        expectedSalary: "",
        experience: "",
        resume: null
    });

    const cleanHTML = useCallback((html) => {
        if (!html) return "";

        // 1. Pre-process block elements to insert custom markers
        // CRITICAL: Replace <li> with a physical bullet so formatBullets can find it
        let processed = html
            .replace(/<li[^>]*>/gi, "<li>- ")
            .replace(/<\/p>/gi, " </p>\n")
            .replace(/<\/div>/gi, " </div>\n")
            .replace(/<\/li>/gi, " </li>\n")
            .replace(/<br\s*\/?>/gi, "<br/>\n");

        // 2. Remove style, class, and id attributes
        let cleaned = processed.replace(/style="[^"]*"/gi, "");
        cleaned = cleaned.replace(/class="[^"]*"/gi, "");
        cleaned = cleaned.replace(/id="[^"]*"/gi, "");

        // 3. Remove all HTML tags
        cleaned = cleaned.replace(/<[^>]+>/g, "");

        // 4. White space collapsing (preserve newlines)
        cleaned = cleaned.replace(/[ \t]+/g, " ");
        cleaned = cleaned.replace(/(\r\n|\n|\r){3,}/g, "\n\n");

        // 5. Trim lines individually
        cleaned = cleaned.split('\n').map(line => line.trim()).filter(line => line).join('\n');

        return cleaned.trim();
    }, []);

    const heuristicSummarize = useCallback((jobData) => {
        if (!jobData) return "";
        const desc = jobData.description || "";
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = desc;
        const text = tempDiv.innerText || tempDiv.textContent || "";
        const lines = text.split(/\n/).map(l => l.trim()).filter(l => l.length > 2);

        // Smarter Skill Extraction
        let detectedSkills = [];
        if (jobData.skills && jobData.skills.length > 0) {
            detectedSkills = jobData.skills;
        } else {
            // Scan for sections like "Requirements", "Skills", "Qualifications"
            let skillLines = [];
            let inSkillSection = false;
            const skillSectionRegex = /(?:skills|requirements|qualifications|experience|stack|technologies|proficiencies)/i;

            for (const line of lines) {
                if (skillSectionRegex.test(line) && line.length < 40) {
                    inSkillSection = true;
                    continue;
                }
                if (inSkillSection) {
                    if (line.length < 5) continue;
                    if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
                        skillLines.push(line.replace(/^[-•*]\s*/, '').trim());
                    } else if (line.length < 50) {
                        skillLines.push(line);
                    }
                    if (skillLines.length >= 6 || (line.length > 100 && skillLines.length > 2)) break;
                }
            }
            detectedSkills = skillLines.length > 0 ? skillLines : ["Technical proficiency in role-related tools", "Relevant professional experience", "Problem-solving and analytical skills"];
        }

        const autoSummary = lines.filter(l => l.length > 50).slice(0, 2).join(". ");

        // Smarter Responsibility Extraction
        let resLines = [];
        let inResSection = false;
        const resSectionRegex = /(?:responsibilities|duties|what you will do|your role|key tasks)/i;
        for (const line of lines) {
            if (resSectionRegex.test(line) && line.length < 40) {
                inResSection = true;
                continue;
            }
            if (inResSection) {
                if (line.length < 5) continue;
                if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
                    resLines.push(line.replace(/^[-•*]\s*/, '').trim());
                }
                if (resLines.length >= 6 || (line.length > 100 && resLines.length > 2)) break;
            }
        }
        if (resLines.length === 0) {
            resLines = lines.filter(l => l.length > 40 && l.length < 150).slice(2, 7);
        }

        const autoResponsibilities = resLines.map(l => `- ${l} `).join("\n");
        const autoSkills = detectedSkills.map(s => `- ${s} `).join("\n");

        return `${jobData.title}

${autoSummary}

Key Responsibilities
${autoResponsibilities}

Required Skills
${autoSkills}

Role Details
    - Location: ${jobData.location || "Remote"}
- Experience: ${jobData.experience || "Not Specified"}
- Salary: ${formatSalary(jobData.salary)} `;
    }, []);

    const fetchAiSummary = useCallback(async (jobData) => {
        if (!jobData) return;

        // Cache key includes version to invalidate when prompt changes
        const cacheKey = `${jobData.id}_${CACHE_VERSION}`;

        // 1. Check persistent memory cache first for instant load
        if (summaryCache.has(cacheKey)) {
            const cached = summaryCache.get(cacheKey);
            if (typeof cached === 'object' && cached.brief) {
                setAiSummary(cached.brief);
                setAiFullDescription(cached.full);
            } else {
                // Legacy cache format - use as both
                setAiSummary(cached);
                setAiFullDescription(cached);
            }
            return;
        }

        if (!AI_CONFIG.activeProvider || !AI_CONFIG.keys[AI_CONFIG.activeProvider]) {
            const fallback = heuristicSummarize(jobData);
            setAiSummary(fallback);
            setAiFullDescription(fallback);
            summaryCache.set(cacheKey, { brief: fallback, full: fallback });
            return;
        }

        setIsGeneratingSummary(true);
        try {
            // Detect if this is a short description (likely from Adzuna or similar)
            const descLength = (jobData.description || '').length;
            const isShortDescription = descLength < 1000;
            const sourceHint = isShortDescription
                ? '\n\nNOTE: This is a SHORT description snippet. Please EXPAND it into a full professional job posting based on the job title and company.'
                : '';

            const prompt = `${AI_CONFIG.recruiterPrompt} \n\n ====================\nINPUT JOB DATA\n ====================\nJOB TITLE: ${jobData.title} \nCOMPANY: ${jobData.company} \nLOCATION: ${jobData.location} \nSOURCE: ${jobData.source || 'unknown'} \nORIGINAL DESCRIPTION: \n${jobData.description}${sourceHint} `;

            if (AI_CONFIG.activeProvider === 'gemini') {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${AI_CONFIG.keys.gemini}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            maxOutputTokens: 4096, // Increased for full comprehensive content
                            temperature: 0.7
                        }
                    })
                });
                const data = await response.json();
                const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (aiText) {
                    // Parse the two sections from AI response
                    const sections = aiText.split('===FULL_DESCRIPTION===');
                    const briefSummary = sections[0] ? sections[0].replace(/===SECTION 1[^=]*===/gi, '').trim() : aiText;
                    const fullDescription = sections[1] ? sections[1].replace(/===SECTION 2[^=]*===/gi, '').trim() : aiText;

                    setAiSummary(briefSummary);
                    setAiFullDescription(fullDescription);

                    // Cache both sections together
                    summaryCache.set(cacheKey, { brief: briefSummary, full: fullDescription });
                } else {
                    const fallback = heuristicSummarize(jobData);
                    setAiSummary(fallback);
                    setAiFullDescription(fallback);
                    summaryCache.set(cacheKey, { brief: fallback, full: fallback });
                }
            } else {
                const fallback = heuristicSummarize(jobData);
                setAiSummary(fallback);
                setAiFullDescription(fallback);
                summaryCache.set(cacheKey, { brief: fallback, full: fallback });
            }
        } catch (err) {
            console.error("AI Summary Error:", err);
            const fallback = heuristicSummarize(jobData);
            setAiSummary(fallback);
            setAiFullDescription(fallback);
            summaryCache.set(cacheKey, { brief: fallback, full: fallback });
        } finally {
            setIsGeneratingSummary(false);
        }
    }, [heuristicSummarize]);

    // Fetch full description from original job URL for external jobs (Adzuna, etc.)
    const fetchScrapedDescription = useCallback(async (jobData) => {
        if (!jobData || !jobData.id) return;

        // Check if this is an external job (adzuna, jsearch, remotive)
        const externalSources = ["adzuna", "jsearch", "remotive"];
        const source = jobData.source || jobData.id.split("_")[0];

        if (!externalSources.includes(source)) {
            // Not an external job, no need to scrape
            return;
        }

        // Only scrape if description is short (likely a snippet)
        if (jobData.description && jobData.description.length > 1000) {
            // Already has substantial content
            return;
        }

        setIsScraping(true);
        try {
            // Fetching full description
            const response = await api.get(`/jobs/scrape/${jobData.id}`);

            if (response.data.success && response.data.data.description) {
                setScrapedDescription(response.data.data.description);
                setIsAiEnhanced(response.data.data.aiEnhanced || !response.data.data.scraped);

                // If the description is already comprehensive (either scraped or backend-AI expanded),
                // we can skip the frontend AI summary generation to save tokens/time
                if (response.data.data.description.length > 800) {
                    setAiFullDescription(response.data.data.description);
                }
            } else {
                // Could not enhance
            }
        } catch (error) {
            // Silently fail - we'll use AI enhancement as fallback
        } finally {
            setIsScraping(false);
        }
    }, []);

    const parseDescriptionSections = useCallback((html) => {
        if (!html) return { summary: "" };
        const cleaned = cleanHTML(html);

        const patterns = {
            responsibilities: /(?:responsibilities|what you'll do|the role|duties|key tasks|job duties|essential functions|about the role)/i,
            requirements: /(?:requirements|qualifications|what you bring|skills|who you are|experience|preferred skills|basic qualifications|what we're looking for)/i,
            benefits: /(?:benefits|perks|what we offer|why join us|compensation|salary|vacation)/i,
            about: /(?:about the company|about us|our company|who we are|foundation|the team)/i
        };

        // Split by traditional tags OR plain text lines that look like headers (CAPS or ending in :)
        const parts = cleaned.split(/(<h[1-6][^>]*>.*?<\/h[1-6]>|<strong[^>]*>.*?<\/strong>|<b[^>]*>.*?<\/b>|^(?:\s*[A-Z\s]{5,}:?\s*$)|(?:\r?\n){2,})/mgi);

        let sectionData = { summary: [] };
        let currentSection = 'summary';

        parts.forEach(part => {
            if (!part || !part.trim()) return;
            let matchedKey = null;

            // Heuristic to check if this part is a header
            const cleanPart = part.replace(/<[^>]*>/g, "").trim();
            for (const [key, pattern] of Object.entries(patterns)) {
                if (pattern.test(cleanPart) && cleanPart.length < 50) {
                    matchedKey = key;
                    break;
                }
            }

            if (matchedKey) {
                currentSection = matchedKey;
                if (!sectionData[currentSection]) sectionData[currentSection] = [];
            } else {
                sectionData[currentSection].push(part);
            }
        });

        const result = {};
        Object.keys(sectionData).forEach(key => {
            const joined = sectionData[key].join("").trim();
            if (joined) {
                // Apply bullet formatting to plain text parts of the joined content
                result[key] = formatBullets(joined);
            }
        });

        // SAFETY: Always include the full raw content as a fallback option
        result.fullContent = formatBullets(cleaned);

        return result;
    }, [cleanHTML]);


    const fetchJobDetails = useCallback(async () => {
        // Don't fetch if jobId is invalid
        if (!jobId || jobId === "undefined") {
            setLoading(false);
            return;
        }

        try {
            const res = await api.get(`/jobs/getjob/${jobId}`);
            if (res.data.success) {
                const jobData = res.data.data;
                setJob(jobData);
                fetchAiSummary(jobData);
                fetchScrapedDescription(jobData); // Fetch full description for external jobs
            }
        } catch (error) {
            console.error("Error fetching job:", error);
            toast.error("Failed to load job details");
        } finally {
            setLoading(false);
        }
    }, [jobId, fetchAiSummary, fetchScrapedDescription]);

    const checkIfApplied = useCallback(async () => {
        try {
            const res = await api.get("/applications/my");
            if (res.data.success) {
                const applied = res.data.data.some(app => app.job?._id === jobId);
                setHasApplied(applied);
            }
        } catch (error) {
            console.error("Error checking application status:", error);
        }
    }, [jobId]);

    useEffect(() => {
        // Delayed skeleton logic: only show skeleton if loading takes more than 500ms
        let timer;
        if (loading) {
            timer = setTimeout(() => {
                setShouldShowSkeleton(true);
            }, 500);
        } else {
            setShouldShowSkeleton(false);
        }
        return () => clearTimeout(timer);
    }, [loading]);

    useEffect(() => {
        // If job data is passed via state, use it immediately
        if (location.state?.jobData) {
            setJob(location.state.jobData);
            fetchAiSummary(location.state.jobData);
            fetchScrapedDescription(location.state.jobData);
            setLoading(false);
        } else {
            fetchJobDetails();
        }

        if (user?.role === "applicant") {
            checkIfApplied();
        }
    }, [fetchJobDetails, checkIfApplied, user?.role, location.state?.jobData, fetchAiSummary, fetchScrapedDescription]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setApplicationForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setApplicationForm(prev => ({ ...prev, resume: e.target.files[0] }));
    };

    const handleApply = async (e) => {
        e.preventDefault();
        setApplying(true);

        try {
            const formData = new FormData();
            formData.append("phone", applicationForm.phone);
            formData.append("coverLetter", applicationForm.coverLetter);
            formData.append("expectedSalary", applicationForm.expectedSalary);
            formData.append("experience", applicationForm.experience);
            if (applicationForm.resume) {
                formData.append("resume", applicationForm.resume);
            }

            const res = await api.post(`/applications/apply/${jobId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.success) {
                toast.success("Application submitted successfully!");
                setShowApplyModal(false);
                setHasApplied(true);
            }
        } catch (error) {
            console.error("Error applying:", error);
            toast.error(error.response?.data?.message || "Failed to submit application");
        } finally {
            setApplying(false);
        }
    };

    // Only show full page skeleton if actually loading AND we've reached the delay threshold
    if (loading && shouldShowSkeleton) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Still loading but haven't hit skeleton threshold? Just wait (render nothing/blank)
    if (loading && !shouldShowSkeleton) {
        return <div className="min-h-screen bg-slate-50 dark:bg-slate-900" />;
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-700 dark:bg-slate-900 transition-colors">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Job not found</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">This job may have been removed or doesn't exist.</p>
                    <Link to="/employee/jobs" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        Browse Jobs
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-700 dark:bg-slate-900 transition-colors">
            <Navbar />

            <div className="max-w-[1440px] mx-auto px-4 py-8">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 mb-6 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Jobs
                </button>

                {/* Job Header */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="flex-1">
                            {/* Company Logo and Info */}
                            <div className="flex items-center gap-4 mb-4">
                                <CompanyLogo
                                    src={job.profile?.companyLogo || job.sourceLogo}
                                    companyName={job.profile?.companyName || job.company}
                                    className="w-16 h-16"
                                />
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${job.status === 'active' || job.source !== 'internal' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {job.status === 'active' || job.source !== 'internal' ? '● Active' : '● Closed'}
                                        </span>
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                            {job.jobType}
                                        </span>
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">{job.title}</h1>
                                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium">{job.profile?.companyName || job.company}</p>
                                </div>
                            </div>
                        </div>

                        {/* Apply Button */}
                        {user?.role === "applicant" && (job.status === "active" || job.source !== "internal") && (
                            <div className="flex-shrink-0">
                                {job.source !== "internal" ? (
                                    <button
                                        onClick={() => {
                                            const url = job.externalUrl || job.applyUrl;
                                            const absoluteUrl = url.startsWith('http') ? url : `http://localhost:8000${url}`;
                                            window.open(absoluteUrl, '_blank');
                                        }}
                                        className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                                    >
                                        Visit Official Site to Apply
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </button>
                                ) : hasApplied ? (
                                    <button
                                        disabled
                                        className="px-8 py-3 bg-green-100 text-green-700 font-semibold rounded-xl cursor-not-allowed"
                                    >
                                        ✓ Applied
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowApplyModal(true)}
                                        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        Apply Now
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Edit Job Button for Recruiters */}
                        {user?.role === "recruiter" && job.postedBy?._id === user?._id && (
                            <div className="flex-shrink-0">
                                <button
                                    onClick={() => {
                                        // Navigate to Jobs page with job data for editing
                                        navigate('/employee/jobs', {
                                            state: {
                                                editMode: true,
                                                jobData: job
                                            }
                                        });
                                    }}
                                    className="px-8 py-3 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-900 transition-all  shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    Edit Job
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Job Meta */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Location</p>
                            <p className="text-slate-700 dark:text-slate-200 font-medium flex items-center gap-2">
                                <span>📍</span> {job.location}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Salary</p>
                            <p className="text-slate-700 dark:text-slate-200 font-medium flex items-center gap-2">
                                <span>💰</span> {formatSalary(job.salary)} {(!String(job.salary).match(/[₹$€£]/) && job.salary) ? '/ year' : ''}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Experience</p>
                            <p className="text-slate-700 dark:text-slate-200 font-medium flex items-center gap-2">
                                <span>📅</span> {job.experience}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Posted By</p>
                            <p className="text-slate-700 dark:text-slate-200 font-medium flex items-center gap-2">
                                <span>👤</span> {getPostedByText(job)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Professional Recruiter Summary Section */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border-2 border-indigo-100 dark:border-indigo-900/50 mb-8 overflow-hidden">
                    <div className="bg-indigo-600 px-8 py-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl backdrop-blur-sm border border-white/30">
                                🎩
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">Recruiter's Role Overview</h2>
                                <p className="text-indigo-100/80 text-xs font-medium uppercase tracking-widest">Premium AI Analysis</p>
                            </div>
                        </div>
                        {isGeneratingSummary ? (
                            <span className="flex items-center gap-2 text-xs font-medium animate-pulse">
                                <span className="w-2 h-2 bg-white rounded-full"></span> Generating details...
                            </span>
                        ) : (
                            <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                ATS-Optimized
                            </span>
                        )}
                    </div>
                    <div className="p-8">
                        {/* Parse AI summary for SHOW MORE marker */}
                        {(() => {
                            const showMoreMarker = "--- SHOW MORE BELOW ---";
                            const parts = aiSummary.split(showMoreMarker);
                            const primaryContent = parts[0] || aiSummary;
                            const secondaryContent = parts[1] || "";

                            return (
                                <>
                                    <div
                                        className="whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-200 leading-relaxed text-sm md:text-base border-l-4 border-indigo-500 pl-6 py-2 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-r-lg"
                                        dangerouslySetInnerHTML={{ __html: formatSimple(primaryContent) }}
                                    />
                                    {secondaryContent && showOriginal && (
                                        <div
                                            className="mt-6 whitespace-pre-wrap font-sans text-slate-600 dark:text-slate-300 leading-relaxed text-sm border-l-4 border-slate-300 dark:border-slate-600 pl-6 py-2 bg-slate-50 dark:bg-slate-900/30 rounded-r-lg"
                                            dangerouslySetInnerHTML={{ __html: formatSimple(secondaryContent) }}
                                        />
                                    )}
                                    {secondaryContent && (
                                        <div className="mt-6 flex justify-center">
                                            <button
                                                onClick={() => setShowOriginal(!showOriginal)}
                                                className="text-xs font-bold bg-white dark:bg-slate-700 px-6 py-2 rounded-full border border-indigo-200 dark:border-indigo-600 shadow-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all flex items-center gap-2"
                                            >
                                                {showOriginal ? 'Show Less' : 'Show More'}
                                            </button>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                    <div className="px-8 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium italic">
                            This summary follows strict recruitment standards to prioritize critical role data.
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
                    {/* Main Content Area - EXTREME WIDTH (10/12 columns) */}
                    <div className="lg:col-span-10 space-y-8">
                        {/* THE MAIN JOB DESCRIPTION - Always visible */}
                        {/* For short descriptions (Adzuna), show AI-expanded content */}
                        {/* For long descriptions, show the original */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 md:p-8 overflow-hidden transition-all hover:shadow-md relative">
                            <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">📄</span>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Full Job Description</h2>
                                </div>
                                {/* Badge for short descriptions - show source */}
                                {(job.description && job.description.length <= 1000) && (
                                    <span className={`px-3 py-1 text-white text-[10px] font-bold uppercase tracking-wider rounded-full ${scrapedDescription
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                        : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                                        }`}>
                                        {isScraping ? 'Loading...' : (isAiEnhanced ? 'AI Professionals Expansion' : (scrapedDescription ? 'Scraped Full Content' : 'AI Summary'))}
                                    </span>
                                )}
                            </div>

                            {/* Content priority: 1. Scraped full description, 2. AI full description for short, 3. Original for long */}
                            {isScraping ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent mr-3"></div>
                                    <span className="text-slate-500">Fetching full description from original source...</span>
                                </div>
                            ) : (
                                <div
                                    className={`job-prose transition-all duration-700 ease-in-out ${!showOriginal ? 'max-h-[500px] overflow-hidden' : 'max-h-[none]'}`}
                                    dangerouslySetInnerHTML={{
                                        __html: formatBullets(
                                            scrapedDescription
                                                ? cleanHTML(scrapedDescription)  // Priority 1: Cleaned scraped content
                                                : (job.description && job.description.length <= 1000)
                                                    ? cleanHTML(aiFullDescription || aiSummary)  // Priority 2: Cleaned AI content
                                                    : cleanHTML(job.description)  // Priority 3: Cleaned Original content
                                        )
                                    }}
                                />
                            )}

                            {/* Inside-card expansion toggle */}
                            <div className={`mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-center ${!showOriginal ? 'absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-slate-800 via-white/90 dark:via-slate-800/90 to-transparent items-end pb-6' : ''}`}>
                                <button
                                    onClick={() => setShowOriginal(!showOriginal)}
                                    className="text-xs font-bold bg-white dark:bg-slate-700 px-6 py-2 rounded-full border border-indigo-200 dark:border-indigo-600 shadow-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all flex items-center gap-2 group pointer-events-auto"
                                >
                                    <span>{showOriginal ? '⬆️' : '⬇️'}</span>
                                    {showOriginal ? 'Collapse Details' : 'Expand All Job Details'}
                                </button>
                            </div>
                        </div>

                        {/* Additional unique responsibilities if they aren't already in the description (internal jobs) */}
                        {job.responsibilities && !job.description.toLowerCase().includes(job.responsibilities.substring(0, 20).toLowerCase()) && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 hover:shadow-md transition-all relative">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                                    <span className="text-2xl">📋</span>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Key Responsibilities</h2>
                                </div>
                                <div
                                    className="job-prose"
                                    dangerouslySetInnerHTML={{ __html: formatBullets(cleanHTML(job.responsibilities), true) }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Sidebar Area - Pushed to the right (2/12 columns) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Summary / Stats Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span>📋</span> Quick Summary
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        📍
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Location</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{job.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                                        💰
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Salary (Yearly)</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">₹{job.salary?.toLocaleString() || "Not Disclosed"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                        📅
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Experience</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{job.experience || "Not specified"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                        �
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Job Type</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{job.jobType}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Skills Section */}
                        {job.skills && job.skills.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span>🛠️</span> Required Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {job.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Company Section */}
                        {(job.companydetails || job.profile?.about) && !parseDescriptionSections(job.description).about && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span>🏢</span> About {job.company}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-6 hover:line-clamp-none transition-all cursor-pointer">
                                    {job.companydetails || job.profile?.about}
                                </p>
                            </div>
                        )}

                        {/* Source Status */}
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800">
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase mb-2">Listing Source</p>
                            <div className="flex items-center gap-3">
                                <img src={job.sourceLogo} alt={job.source} className="w-6 h-6 rounded" />
                                <span className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{job.source}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Apply Modal */}
            {
                showApplyModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Apply to {job.title}</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">{job.company}</p>
                                </div>
                                <button
                                    onClick={() => setShowApplyModal(false)}
                                    className="text-slate-400 hover:text-slate-600 dark:text-slate-300 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handleApply} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={applicationForm.phone}
                                        onChange={handleInputChange}
                                        className="w-full dark:bg-slate-700 p-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="+91 9876543210"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                                        Resume (PDF) *
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                        className="w-full dark:bg-slate-700 p-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                                        Expected Salary (₹/year)
                                    </label>
                                    <input
                                        type="number"
                                        name="expectedSalary"
                                        value={applicationForm.expectedSalary}
                                        onChange={handleInputChange}
                                        className="w-full dark:bg-slate-700 p-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="e.g. 1200000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                                        Years of Experience
                                    </label>
                                    <input
                                        type="text"
                                        name="experience"
                                        value={applicationForm.experience}
                                        onChange={handleInputChange}
                                        className="w-full dark:bg-slate-700 p-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="e.g. 3 years"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                                        Cover Letter
                                    </label>
                                    <textarea
                                        name="coverLetter"
                                        value={applicationForm.coverLetter}
                                        onChange={handleInputChange}
                                        rows="4"
                                        className="w-full dark:bg-slate-700 p-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                        placeholder="Tell us why you're a great fit for this role..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowApplyModal(false)}
                                        className="flex-1 py-3 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-50 dark:bg-slate-700 transition-all "
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={applying}
                                        className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all  disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {applying ? "Submitting..." : "Submit Application"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

export default JobDetail;
