import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * MobileBackButton - Minimal back button for mobile only
 * Completely hidden on desktop, doesn't affect layout
 */
const MobileBackButton = () => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(-1)}
            className="md:hidden fixed top-16 left-4 z-40 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            aria-label="Go back"
        >
            <svg
                className="w-5 h-5 text-slate-700 dark:text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                />
            </svg>
        </button>
    );
};

export default MobileBackButton;
