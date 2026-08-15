'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const Home = () => {
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        try {
            const token = localStorage.getItem('userToken');
            const profile = localStorage.getItem('userProfile');
            if (token && profile) {
                setUser(JSON.parse(profile));
            }
        } catch (e) {
            console.error('Error reading user session', e);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userProfile');
        setUser(null);
        toast.success('Logged out successfully');
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 font-sans flex flex-col selection:bg-teal-500 selection:text-gray-950">
            {/* Top Navigation */}
            <nav className="flex justify-between items-center px-6 md:px-12 py-4 bg-gray-950/70 backdrop-blur-md border-b border-gray-800/80 sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-400 to-blue-500 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform duration-200">
                        <span className="text-gray-950 font-black text-lg">⚡</span>
                    </div>
                    <span className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
                        Pulse Check
                    </span>
                </Link>

                {/* Right side: Nav links */}
                <div className="flex items-center gap-4 sm:gap-6 text-sm font-semibold">
                    <Link href="/about-us" className="text-gray-400 hover:text-teal-400 transition">
                        About Us
                    </Link>
                    <Link href="/tool" className="text-gray-400 hover:text-teal-400 transition">
                        Workspace
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-3 pl-2 border-l border-gray-800">
                            <span className="text-xs text-gray-400 hidden sm:inline">
                                Hi, <strong className="text-teal-400 font-medium">{user.name}</strong>
                            </span>
                            <button
                                onClick={handleLogout}
                                className="px-3.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800 transition text-xs font-semibold"
                            >
                                Log out
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link
                                href="/login"
                                className="px-4 py-2 rounded-xl text-gray-300 hover:text-white transition hover:bg-gray-900"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/signup"
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-400 to-blue-500 text-gray-950 font-bold hover:opacity-95 shadow-md shadow-teal-500/20 transition active:scale-95"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative flex flex-col items-center justify-center text-center py-24 md:py-32 px-6 overflow-hidden">
                {/* Background glow orbs */}
                <div className="absolute w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl -top-24 pointer-events-none"></div>
                <div className="absolute w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl top-1/2 -z-10 pointer-events-none"></div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-900/90 border border-gray-800 text-teal-400 text-xs font-semibold mb-6 shadow-inner">
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
                    Modern API Testing & Debugging Suite
                </div>

                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight max-w-4xl text-white leading-tight">
                    Test APIs with{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-500">
                        Lightning Speed
                    </span>{' '}
                    &amp; Precision.
                </h1>

                <p className="mt-6 text-base sm:text-lg text-gray-400 max-w-2xl leading-relaxed">
                    Pulse Check gives developers a clean, zero-bloat environment to craft requests, inspect responses, test headers, and streamline REST API workflows.
                </p>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                    <Link
                        href="/tool"
                        className="px-8 py-4 rounded-xl bg-gradient-to-r from-teal-400 to-blue-500 text-gray-950 font-extrabold hover:from-teal-300 hover:to-blue-400 shadow-xl shadow-teal-500/25 transition duration-200 active:scale-95 flex items-center gap-2 text-base"
                    >
                        <span>Launch API Workspace</span>
                        <span>→</span>
                    </Link>
                    <Link
                        href="/about-us"
                        className="px-8 py-4 rounded-xl bg-gray-900/80 border border-gray-800 text-gray-300 font-bold hover:bg-gray-800 hover:text-white transition duration-200 text-base"
                    >
                        Learn More
                    </Link>
                </div>
            </section>

            {/* Feature Cards Grid */}
            <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-6 md:px-12 py-12">
                <div className="group bg-gray-900/60 hover:bg-gray-900/90 border border-gray-800/80 hover:border-teal-500/40 p-8 rounded-3xl transition duration-300 shadow-lg hover:shadow-teal-500/10">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition duration-300">
                        ⚡
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Instant Request Builder</h2>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Compose GET, POST, PUT, DELETE, and PATCH calls with customizable headers, URL parameters, authentication, and raw JSON payloads.
                    </p>
                </div>

                <div className="group bg-gray-900/60 hover:bg-gray-900/90 border border-gray-800/80 hover:border-blue-500/40 p-8 rounded-3xl transition duration-300 shadow-lg hover:shadow-blue-500/10">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition duration-300">
                        📊
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Deep Response Metrics</h2>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Inspect exact HTTP status codes, latency timings (ms), payload size, response headers, and color-coded JSON formatting in real time.
                    </p>
                </div>

                <div className="group bg-gray-900/60 hover:bg-gray-900/90 border border-gray-800/80 hover:border-purple-500/40 p-8 rounded-3xl transition duration-300 shadow-lg hover:shadow-purple-500/10">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition duration-300">
                        🛡️
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">CORS-Free Proxy Engine</h2>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Test any local or public API without running into browser CORS restrictions using our intelligent server proxy mode.
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto py-8 border-t border-gray-900 text-center text-gray-500 text-xs flex flex-col sm:flex-row items-center justify-between px-6 md:px-12 gap-4">
                <div>
                    © {new Date().getFullYear()} Pulse Check. Built for developers worldwide.
                </div>
                <div className="flex gap-6 text-gray-400 font-medium">
                    <Link href="/tool" className="hover:text-teal-400 transition">Tool</Link>
                    <Link href="/about-us" className="hover:text-teal-400 transition">About</Link>
                    <Link href="/login" className="hover:text-teal-400 transition">Account</Link>
                </div>
            </footer>
        </div>
    );
};

export default Home;