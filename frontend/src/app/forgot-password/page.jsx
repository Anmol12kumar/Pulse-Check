'use client';
import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

const ForgotPassword = () => {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [devResetLink, setDevResetLink] = useState('');

    const forgotForm = useFormik({
        initialValues: { email: '' },
        validationSchema: Yup.object({
            email: Yup.string().email('Please enter a valid email address').required('Email is required'),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const response = await axios.post(`${apiUrl}/user/forgot-password`, {
                    email: values.email,
                });
                toast.success('Reset link processed! Check your email.');
                setSent(true);
                if (response.data?.resetLink) {
                    setDevResetLink(response.data.resetLink);
                }
            } catch (err) {
                const errMsg = err.response?.data?.error || 'Failed to send reset link';
                toast.error(errMsg);
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100 relative overflow-hidden px-4">
            {/* Animated background glowing orbs */}
            <div className="absolute w-80 h-80 bg-teal-500/20 rounded-full blur-3xl -top-10 -left-10 animate-pulse pointer-events-none"></div>
            <div className="absolute w-96 h-96 bg-purple-600/20 rounded-full blur-3xl top-1/2 -right-10 animate-pulse pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-md bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl shadow-2xl p-8 sm:p-10">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400 mb-2">
                        Pulse Check
                    </Link>
                    <h1 className="text-3xl font-extrabold text-white">Reset Password</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Enter your email address to receive password reset instructions.
                    </p>
                </div>

                {sent ? (
                    <div className="text-center py-4 space-y-4">
                        <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/30 rounded-2xl flex items-center justify-center mx-auto text-teal-400 text-2xl">
                            ✓
                        </div>
                        <h3 className="text-xl font-bold text-white">Check your email</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            If an account exists for <span className="text-teal-400 font-semibold">{forgotForm.values.email}</span>, you will receive password reset instructions valid for 15 minutes.
                        </p>

                        {devResetLink && (
                            <div className="p-3 bg-gray-950/80 border border-gray-800 rounded-xl text-left text-xs">
                                <p className="text-teal-400 font-bold mb-1">Development Reset Link:</p>
                                <a href={devResetLink} className="text-blue-400 break-all underline hover:text-blue-300">
                                    {devResetLink}
                                </a>
                            </div>
                        )}

                        <div className="pt-4">
                            <Link
                                href="/login"
                                className="inline-block text-sm font-semibold text-teal-400 hover:text-teal-300 transition"
                            >
                                ← Back to Sign In
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={forgotForm.handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                                Registered Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="you@example.com"
                                onChange={forgotForm.handleChange}
                                onBlur={forgotForm.handleBlur}
                                value={forgotForm.values.email}
                                className={`w-full px-4 py-3 rounded-xl bg-gray-950/60 border ${
                                    forgotForm.touched.email && forgotForm.errors.email
                                        ? 'border-red-500 focus:ring-red-400'
                                        : 'border-gray-700/80 focus:border-teal-400 focus:ring-teal-400/30'
                                } text-gray-100 placeholder-gray-500 focus:ring-2 focus:outline-none transition duration-200`}
                            />
                            {forgotForm.touched.email && forgotForm.errors.email && (
                                <p className="text-xs text-red-400 mt-1.5 font-medium">{forgotForm.errors.email}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-teal-400 to-blue-500 text-gray-950 font-bold hover:from-teal-300 hover:to-blue-400 active:scale-[0.99] transition duration-200 shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-gray-950" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                    <span>Sending Reset Link...</span>
                                </>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>

                        <div className="text-center pt-2">
                            <Link href="/login" className="text-sm text-gray-400 hover:text-teal-400 transition font-medium">
                                ← Return to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;