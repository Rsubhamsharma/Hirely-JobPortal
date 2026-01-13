import React from 'react';
import Navbar from '../components/Navbar';

function About() {
    return (
        <>

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
                    <div className="max-w-6xl mx-auto px-4">
                        <h1 className="text-5xl font-bold mb-4">About JobPortal</h1>
                        <p className="text-xl text-blue-100">Connecting talent with opportunity</p>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 py-16">
                    {/* Mission Section */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Mission</h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            At JobPortal, we're on a mission to revolutionize the way people find jobs and companies discover talent.
                            We believe that everyone deserves access to meaningful career opportunities, and every company deserves
                            to find the perfect candidate. Our platform bridges this gap with cutting-edge technology and a
                            user-first approach.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">For Job Seekers</h3>
                            <p className="text-slate-600">
                                Access thousands of job listings, apply with one click, and track your applications in real-time.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">For Recruiters</h3>
                            <p className="text-slate-600">
                                Post jobs, manage applications, and connect with qualified candidates through our messaging system.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">Competitions</h3>
                            <p className="text-slate-600">
                                Participate in coding challenges and competitions to showcase your skills and win prizes.
                            </p>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-12 text-white mb-12">
                        <div className="grid md:grid-cols-4 gap-8 text-center">
                            <div>
                                <div className="text-4xl font-bold mb-2">10K+</div>
                                <div className="text-blue-100">Active Jobs</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold mb-2">50K+</div>
                                <div className="text-blue-100">Job Seekers</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold mb-2">5K+</div>
                                <div className="text-blue-100">Companies</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold mb-2">95%</div>
                                <div className="text-blue-100">Success Rate</div>
                            </div>
                        </div>
                    </div>

                    {/* Values Section */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Values</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <span className="text-2xl">🎯</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Innovation</h3>
                                    <p className="text-slate-600">We constantly evolve to provide the best job search experience.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <span className="text-2xl">🤝</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Trust</h3>
                                    <p className="text-slate-600">Building lasting relationships through transparency and integrity.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <span className="text-2xl">⚡</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Speed</h3>
                                    <p className="text-slate-600">Fast, efficient processes to get you hired quicker.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <span className="text-2xl">🌟</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Excellence</h3>
                                    <p className="text-slate-600">Committed to delivering exceptional quality in everything we do.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default About;