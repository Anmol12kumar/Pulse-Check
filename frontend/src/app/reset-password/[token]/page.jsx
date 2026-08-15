'use client';
import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const ResetSchema = Yup.object({
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[a-z]/, 'Must contain a lowercase letter')
        .matches(/[A-Z]/, 'Must contain an uppercase letter')
        .matches(/[0-9]/, 'Must contain a number')
        .required('New password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Please confirm your new password'),
});

const ResetPassword = () => {
    const { token } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const resetForm = useFormik({
        initialValues: { password: '', confirmPassword: '' },
        validationSchema: ResetSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const response = await axios.post(`${apiUrl}/user/reset-password/${token}`, {
                    password: values.password,
                });
                toast.success(response.data?.message || 'Password reset successful! Please log in.');
                router.push('/login');
            } catch (err) {
                const errMsg = err.response?.data?.error || 'Invalid or expired reset token';
                toast.error(errMsg);
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100 relative overflow-hidden px-4">
            {/* Animated background blobs */}
            <div className="absolute w-80 h-80 bg-teal-500/20 rounded-full blur-3xl -top-10 -left-10 animate-pulse pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl opacity-30 animate-pulse pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-md bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl shadow-2xl p-8 sm:p-10">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400 mb-2">
                        Pulse Check
                    </Link>
                    <h1 className="text-3xl font-extrabold text-white">Create New Password</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Enter your new secure password below.
                    </p>
                </div>

                <form onSubmit={resetForm.handleSubmit} className="space-y-5">
                    {/* New Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="••••••••"
                            onChange={resetForm.handleChange}
                            onBlur={resetForm.handleBlur}
                            value={resetForm.values.password}
                            className={`w-full px-4 py-3 rounded-xl bg-gray-950/60 border ${
                                resetForm.touched.password && resetForm.errors.password
                                    ? 'border-red-500 focus:ring-red-400'
                                    : 'border-gray-700/80 focus:border-teal-400 focus:ring-teal-400/30'
                            } text-gray-100 placeholder-gray-500 focus:ring-2 focus:outline-none transition duration-200`}
                        />
                        {resetForm.touched.password && resetForm.errors.password && (
                            <p className="text-xs text-red-400 mt-1.5 font-medium">{resetForm.errors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1.5">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="••••••••"
                            onChange={resetForm.handleChange}
                            onBlur={resetForm.handleBlur}
                            value={resetForm.values.confirmPassword}
                            className={`w-full px-4 py-3 rounded-xl bg-gray-950/60 border ${
                                resetForm.touched.confirmPassword && resetForm.errors.confirmPassword
                                    ? 'border-red-500 focus:ring-red-400'
                                    : 'border-gray-700/80 focus:border-teal-400 focus:ring-teal-400/30'
                            } text-gray-100 placeholder-gray-500 focus:ring-2 focus:outline-none transition duration-200`}
                        />
                        {resetForm.touched.confirmPassword && resetForm.errors.confirmPassword && (
                            <p className="text-xs text-red-400 mt-1.5 font-medium">{resetForm.errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Reset Button */}
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
                                <span>Updating Password...</span>
                            </>
                        ) : (
                            'Set New Password'
                        )}
                    </button>

                    <div className="text-center pt-2">
                        <Link href="/login" className="text-sm text-gray-400 hover:text-teal-400 transition font-medium">
                            ← Cancel and Return to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
