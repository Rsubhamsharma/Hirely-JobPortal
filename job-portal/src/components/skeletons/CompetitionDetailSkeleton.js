import React from 'react';

const CompetitionDetailSkeleton = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Header Skeleton */}
                    <div className="space-y-4">
                        <div className="h-4 w-24 skeleton" />
                        <div className="h-12 w-3/4 skeleton" />
                        <div className="flex gap-4">
                            <div className="h-6 w-32 skeleton rounded-full" />
                            <div className="h-6 w-32 skeleton rounded-full" />
                        </div>
                    </div>

                    {/* Banner Skeleton */}
                    <div className="h-96 w-full skeleton rounded-3xl" />

                    {/* Content Skeleton */}
                    <div className="space-y-6">
                        <div className="h-8 w-48 skeleton" />
                        <div className="space-y-2">
                            <div className="h-4 w-full skeleton" />
                            <div className="h-4 w-full skeleton" />
                            <div className="h-4 w-3/4 skeleton" />
                        </div>
                    </div>
                </div>

                {/* Sidebar Skeleton */}
                <div className="mt-12 lg:mt-0 space-y-8">
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
                        <div className="h-6 w-32 skeleton" />
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <div className="h-4 w-20 skeleton" />
                                <div className="h-4 w-24 skeleton" />
                            </div>
                            <div className="flex justify-between">
                                <div className="h-4 w-20 skeleton" />
                                <div className="h-4 w-24 skeleton" />
                            </div>
                        </div>
                        <div className="h-12 w-full skeleton rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompetitionDetailSkeleton;
