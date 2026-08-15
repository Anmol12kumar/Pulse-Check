'use client';
import React from 'react';
import Link from 'next/link';

const About = () => {
    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 font-sans flex flex-col selection:bg-teal-500 selection:text-gray-950">
            {/* Navigation */}
            <nav className="flex justify-between items-center px-6 md:px-12 py-4 bg-gray-950/70 backdrop-blur-md border-b border-gray-800/80 sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-400 to-blue-500 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform duration-200">
                        <span className="text-gray-950 font-black text-lg">⚡</span>
                    </div>
                    <span className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
                        Pulse Check
                    </span>
                </Link>

                <div className="flex items-center gap-4 sm:gap-6 text-sm font-semibold">
                    <Link href="/" className="text-gray-400 hover:text-teal-400 transition">
                        Home
                    </Link>
                    <Link href="/tool" className="text-gray-400 hover:text-teal-400 transition">
                        Workspace
                    </Link>
                    <Link
                        href="/login"
                        className="px-4 py-2 rounded-xl text-gray-300 hover:text-white transition hover:bg-gray-900"
                    >
                        Sign In
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative flex flex-col items-center justify-center text-center py-20 px-6 overflow-hidden">
                <div className="absolute w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl -top-24 pointer-events-none"></div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-900/90 border border-gray-800 text-teal-400 text-xs font-semibold mb-6 shadow-inner">
                    About Pulse Check
                </div>

                <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-3xl text-white leading-tight">
                    Empowering Developers with{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-500">
                        Frictionless API Testing
                    </span>
                </h1>

                <p className="mt-6 text-base sm:text-lg text-gray-400 max-w-2xl leading-relaxed">
                    Pulse Check was engineered to provide developers with a blazingly fast, aesthetically pleasing, and ultra-reliable suite for testing RESTful services and APIs.
                </p>
            </section>

            {/* Pillars / Features */}
            <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-6 md:px-12 py-8">
                <div className="bg-gray-900/60 border border-gray-800/80 p-8 rounded-3xl shadow-lg">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center text-2xl mb-6">
                        💡
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Simplicity First</h2>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        No cluttered panels or bloated enterprise setup. Just configure your endpoint, send your payload, and inspect crisp results instantly.
                    </p>
                </div>

                <div className="bg-gray-900/60 border border-gray-800/80 p-8 rounded-3xl shadow-lg">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-2xl mb-6">
                        ⚡
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Maximum Performance</h2>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Accurate microsecond timing calculations, payload metrics, and CORS-free backend proxying guarantee you get dependable responses every time.
                    </p>
                </div>

                <div className="bg-gray-900/60 border border-gray-800/80 p-8 rounded-3xl shadow-lg">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-2xl mb-6">
                        🔒
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Secure & Private</h2>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Save requests locally or securely sync with your account with industry standard bcrypt hashing and JWT token authentication.
                    </p>
                </div>
            </section>

            {/* Call to Action */}
            <section className="text-center py-16 px-6">
                <div className="max-w-3xl mx-auto bg-gradient-to-r from-teal-900/30 via-gray-900 to-blue-900/30 border border-gray-800 rounded-3xl p-10">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                        Ready to elevate your API development?
                    </h3>
                    <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                        Jump right into the workspace and test your first endpoint in seconds.
                    </p>
                    <Link
                        href="/tool"
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-teal-400 to-blue-500 text-gray-950 font-bold hover:from-teal-300 hover:to-blue-400 transition shadow-lg shadow-teal-500/20"
                    >
                        <span>Open Workspace</span>
                        <span>→</span>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto py-8 border-t border-gray-900 text-center text-gray-500 text-xs px-6">
                © {new Date().getFullYear()} Pulse Check. Built with MERN + Next.js + Tailwind CSS
            </footer>
        </div>
    );
};

export default About;