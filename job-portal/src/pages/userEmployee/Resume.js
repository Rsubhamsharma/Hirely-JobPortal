import React from "react";

function Resume() {
  return (
    <div className="bg-slate-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">My Resume</h2>
        <p className="text-slate-500 mb-8">Manage your CV and portfolio details</p>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            📄
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Upload your Resume</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            Upload your latest resume to apply for jobs and internships seamlessly. Supported formats: PDF, DOCX
          </p>

          <div className="flex justify-center gap-4">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
              Upload New Resume
            </button>
            <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">
              View Current
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Resume;
