import { Link } from "react-router-dom";

function Home() {
  const stats = [
    { label: "Active Jobs", value: "2,500+" },
    { label: "Companies", value: "850+" },
    { label: "Candidates", value: "15k+" },
  ];
  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-32 overflow-hidden">
        {/* Abstract shapes/blobs */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-8 leading-tight">
            Find Your <span className="text-blue-400">Dream Career</span> <br className="hidden md:block" />
            With World Class Companies
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-slate-300 mb-10 leading-relaxed">
            Connect with top employers and discover opportunities that match your skills.
            Your next big career move starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/employee/jobs"
              className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1"
            >
              Browse Jobs
            </Link>
            <Link
              to="/signup"
              className="px-8 py-4 bg-transparent border-2 border-slate-500 text-white font-bold rounded-lg hover:bg-slate-800 hover:border-slate-400 transition-all"
            >
              Join as Recruiter
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>

            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose Us?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">We provide the best tools and services to help you land your dream job.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: "🚀", title: "Fast Growing", desc: "Thousands of new jobs added daily from top companies worldwide." },
              { icon: "🛡️", title: "Verified Jobs", desc: "We verify every employer to ensure safe and legitimate opportunities." },
              { icon: "🤝", title: "Easy Apply", desc: "Apply to multiple jobs with just one click using your profile." }
            ].map((feature, i) => (
              <div key={i} className="group">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-slate-900 sm:mx-6 lg:mx-12 rounded-3xl mb-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to start your journey?</h2>
          <p className="text-slate-400 mb-10 text-lg">Join thousands of professionals who have found their dream companies.</p>
          <Link
            to="/signup"
            className="inline-block px-10 py-4 bg-white text-slate-900 font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Create Your Account
          </Link>
        </div>
      </section>

    </div>

  )
}


export default Home;
