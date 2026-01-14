import React from "react";


function Internships() {
  const internships = [
    {
      id: 1,
      role: "Frontend Developer Intern",
      company: "Google",
      location: "Bangalore",
      stipend: "45,000",
      duration: "6 Months",
      posted: "2 days ago"
    },
    {
      id: 2,
      role: "UI/UX Design Intern",
      company: "Microsoft",
      location: "Hyderabad",
      stipend: "40,000",
      duration: "3 Months",
      posted: "1 day ago"
    },
    {
      id: 3,
      role: "Backend Engineering Intern",
      company: "Amazon",
      location: "Remote",
      stipend: "50,000",
      duration: "6 Months",
      posted: "4 days ago"
    }
  ];

  return (
    <div className="flex bg-slate-50 min-h-screen">
      {/* Sidebar Layout reused or we can just make this a full page for now since sidebar is inside UserHome */}
      <div className="flex-1 p-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-6">Internship Opportunities</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((internship) => (
            <div key={internship.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-sm-hover transition-shadow border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{internship.role}</h3>
                  <p className="text-slate-500 font-medium">{internship.company}</p>
                </div>
                <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded font-semibold">
                  {internship.duration}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-slate-600">
                  <span className="mr-2">📍</span> {internship.location}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <span className="mr-2">💰</span> ₹{internship.stipend} / month
                </div>
              </div>

              <button className="w-full mt-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Internships;
