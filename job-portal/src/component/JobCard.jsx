import React from "react";

const JobCard = ({ role, company, location, salary, experience }) => {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl transition-all cursor-pointer">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">{role}</h3>
        <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg">
          {experience} Exp
        </span>
      </div>

      <p className="text-gray-600 mt-1 text-md">{company}</p>

      <div className="flex items-center justify-between mt-4 text-sm text-gray-700">
        <span>📍 {location}</span>
        <span>💰 {salary}</span>
      </div>

      <button className="mt-6 w-full py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:opacity-90 transition">
        Apply Now
      </button>
    </div>
  );
};

export default JobCard;
