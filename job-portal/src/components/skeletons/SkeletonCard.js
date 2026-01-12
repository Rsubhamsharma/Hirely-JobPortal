import React from 'react';

const SkeletonCard = () => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div className="h-4 w-24 skeleton" />
                <div className="h-6 w-20 skeleton rounded-full" />
            </div>

            <div className="space-y-2">
                <div className="h-6 w-3/4 skeleton" />
                <div className="h-4 w-full skeleton" />
            </div>

            <div className="flex gap-4 mt-2">
                <div className="h-4 w-20 skeleton" />
                <div className="h-4 w-20 skeleton" />
            </div>

            <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                <div className="h-4 w-24 skeleton" />
                <div className="h-10 w-28 skeleton rounded-xl" />
            </div>
        </div>
    );
};

export default SkeletonCard;
