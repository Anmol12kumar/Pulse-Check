'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Please enter a valid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
});

const Login = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const loginForm = useFormik({
        initialValues: {
            email: '',
            password: '',
            remember: false
        },
        validationSchema: LoginSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const result = await axios.post(`${apiUrl}/user/authenticate`, {
                    email: values.email,
                    password: values.password,
                });

                toast.success('Login Successful! Welcome back.');
                if (result.data?.token) {
                    localStorage.setItem('userToken', result.data.token);
                }
                if (result.data?.user) {
                    localStorage.setItem('userProfile', JSON.stringify(result.data.user));
                }
                router.push('/tool');
            } catch (err) {
                const errMsg = err.response?.data?.error || err.message || 'Login failed. Please check your credentials.';
                toast.error(errMsg);
                console.error('Login error:', err);
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
            <div className="absolute w-80 h-80 bg-blue-600/20 rounded-full blur-3xl -bottom-10 left-1/3 animate-pulse pointer-events-none"></div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl shadow-2xl p-8 sm:p-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400 mb-2">
                        Pulse Check
                    </Link>
                    <h1 className="text-3xl font-extrabold text-white">Welcome Back</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Don&apos;t have an account yet?{' '}
                        <Link href="/signup" className="text-teal-400 hover:text-teal-300 font-semibold transition">
                            Sign up here
                        </Link>
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={loginForm.handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="you@example.com"
                            onChange={loginForm.handleChange}
                            onBlur={loginForm.handleBlur}
                            value={loginForm.values.email}
                            className={`w-full px-4 py-3 rounded-xl bg-gray-950/60 border ${
                                loginForm.touched.email && loginForm.errors.email
                                    ? 'border-red-500 focus:ring-red-400'
                                    : 'border-gray-700/80 focus:border-teal-400 focus:ring-teal-400/30'
                            } text-gray-100 placeholder-gray-500 focus:ring-2 focus:outline-none transition duration-200`}
                        />
                        {loginForm.touched.email && loginForm.errors.email && (
                            <p className="text-xs text-red-400 mt-1.5 font-medium">{loginForm.errors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-xs font-medium text-teal-400 hover:text-teal-300 transition"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="••••••••"
                            onChange={loginForm.handleChange}
                            onBlur={loginForm.handleBlur}
                            value={loginForm.values.password}
                            className={`w-full px-4 py-3 rounded-xl bg-gray-950/60 border ${
                                loginForm.touched.password && loginForm.errors.password
                                    ? 'border-red-500 focus:ring-red-400'
                                    : 'border-gray-700/80 focus:border-teal-400 focus:ring-teal-400/30'
                            } text-gray-100 placeholder-gray-500 focus:ring-2 focus:outline-none transition duration-200`}
                        />
                        {loginForm.touched.password && loginForm.errors.password && (
                            <p className="text-xs text-red-400 mt-1.5 font-medium">{loginForm.errors.password}</p>
                        )}
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="remember"
                            name="remember"
                            onChange={loginForm.handleChange}
                            checked={loginForm.values.remember}
                            className="w-4 h-4 rounded bg-gray-950 border-gray-700 text-teal-500 focus:ring-teal-400 focus:ring-offset-gray-900 accent-teal-400"
                        />
                        <label htmlFor="remember" className="ml-2 text-sm text-gray-400 select-none cursor-pointer">
                            Remember me on this device
                        </label>
                    </div>

                    {/* Submit Button */}
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
                                <span>Authenticating...</span>
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;