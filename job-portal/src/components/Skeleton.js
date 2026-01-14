import React from 'react';

// Base Skeleton component
export const Skeleton = ({ className = '', width, height }) => {
    return (
        <div
            className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] rounded ${className}`}
            style={{
                width: width || '100%',
                height: height || '100%',
                animation: 'shimmer 1.5s infinite'
            }}
        />
    );
};

// Job Card Skeleton
export const JobCardSkeleton = () => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <div className="space-y-2 mb-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex gap-3">
                <Skeleton className="h-10 flex-1 rounded-lg" />
                <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
        </div>
    );
};

// Competition Card Skeleton
export const CompetitionCardSkeleton = () => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <Skeleton className="h-6 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="h-8 w-20 rounded-full" />
            </div>
            <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-28" />
                </div>
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
        </div>
    );
};

// Application Card Skeleton
export const ApplicationCardSkeleton = () => {
    return (
        <div className="p-6 border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-24 rounded-lg" />
                    <Skeleton className="h-10 w-24 rounded-lg" />
                </div>
            </div>
        </div>
    );
};

// Profile Skeleton
export const ProfileSkeleton = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <div className="flex items-center gap-6 mb-8">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <div className="flex-1">
                            <Skeleton className="h-8 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <Skeleton className="h-5 w-24 mb-2" />
                            <Skeleton className="h-10 w-full rounded-lg" />
                        </div>
                        <div>
                            <Skeleton className="h-5 w-24 mb-2" />
                            <Skeleton className="h-10 w-full rounded-lg" />
                        </div>
                        <div>
                            <Skeleton className="h-5 w-24 mb-2" />
                            <Skeleton className="h-32 w-full rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Table Skeleton
export const TableSkeleton = ({ rows = 5 }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
                <Skeleton className="h-6 w-48" />
            </div>
            <div className="divide-y divide-slate-100">
                {[...Array(rows)].map((_, i) => (
                    <div key={i} className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                            <Skeleton className="h-10 w-24 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Stats Card Skeleton
export const StatsCardSkeleton = () => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-4 w-20" />
        </div>
    );
};

// Add shimmer animation to global styles
const style = document.createElement('style');
style.textContent = `
    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
`;
document.head.appendChild(style);

export default Skeleton;
