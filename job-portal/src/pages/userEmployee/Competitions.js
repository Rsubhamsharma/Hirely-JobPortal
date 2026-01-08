import React from "react";

function Competitions() {
  const competitions = [
    {
      id: 1,
      title: "CodeHack 2026",
      organizer: "TechCorp",
      date: "Aug 15, 2026",
      prize: "₹1,00,000",
      status: "Upcoming"
    },
    {
      id: 2,
      title: "Designathon",
      organizer: "Creative Minds",
      date: "Jul 20, 2026",
      prize: "₹50,000",
      status: "Live"
    }
  ];

  return (
    <div className="flex bg-slate-50 min-h-screen p-8">
      <div className="max-w-6xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-slate-800 mb-6">Competitions</h2>

        <div className="space-y-4">
          {competitions.map((comp) => (
            <div key={comp.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-slate-900">{comp.title}</h3>
                  {comp.status === "Live" && (
                    <span className="animate-pulse bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      ● Live
                    </span>
                  )}
                </div>
                <p className="text-slate-500">Organized by {comp.organizer}</p>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Date</p>
                  <p className="font-medium text-slate-700">{comp.date}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Prize Pool</p>
                  <p className="font-bold text-green-600">{comp.prize}</p>
                </div>
              </div>

              <button className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
                Register
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Competitions;
