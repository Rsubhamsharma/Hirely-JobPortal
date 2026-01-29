import React, { useState } from 'react';

const CompanyLogo = ({ src, companyName, className = "w-12 h-12" }) => {
    const [error, setError] = useState(false);
    const firstLetter = (companyName || 'C')[0].toUpperCase();

    // Generate a consistent color based on company name
    const getPlaceholderColor = (name) => {
        const colors = [
            'from-indigo-500 to-purple-600',
            'from-blue-500 to-cyan-600',
            'from-emerald-500 to-teal-600',
            'from-rose-500 to-orange-600',
            'from-amber-500 to-orange-600',
            'from-violet-500 to-fuchsia-600'
        ];
        const index = name ? name.length % colors.length : 0;
        return colors[index];
    };

    if (!src || error) {
        return (
            <div className={`${className} rounded-lg bg-gradient-to-br ${getPlaceholderColor(companyName)} flex items-center justify-center border-2 border-white/20 shadow-sm`}>
                <span className="text-white font-bold text-xl">
                    {firstLetter}
                </span>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={companyName}
            className={`${className} rounded-lg object-contain bg-white border-2 border-slate-200 dark:border-slate-700 shadow-sm transition-all`}
            onError={() => setError(true)}
        />
    );
};

export default CompanyLogo;
