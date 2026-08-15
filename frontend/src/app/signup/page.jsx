'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

const SignupSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be 50 characters or less')
        .required('Full name is required'),
    email: Yup.string()
        .email('Please enter a valid email address')
        .required('Email address is required'),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[0-9]/, 'Password must contain at least one number')
        .matches(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords do not match')
        .required('Please confirm your password'),
    terms: Yup.boolean()
        .oneOf([true], 'You must accept the terms and conditions'),
});

const SignUp = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const signupForm = useFormik({
        initialValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            terms: false,
        },
        validationSchema: SignupSchema,
        onSubmit: async (values, { resetForm }) => {
            setLoading(true);
            try {
                const { confirmPassword, terms, ...userData } = values;
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

                await axios.post(`${apiUrl}/user/add`, userData);

                toast.success('Account created successfully! Please sign in.');
                resetForm();
                router.push('/login');
            } catch (error) {
                const errMsg =
                    error.response?.data?.error ||
                    error.message ||
                    'Account registration failed. Please try again.';
                toast.error(errMsg);
                console.error('Registration error:', error);
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100 relative overflow-hidden px-4 py-12">
            {/* Animated background blobs */}
            <div className="absolute w-80 h-80 bg-teal-500/20 rounded-full blur-3xl -top-10 -left-10 animate-pulse pointer-events-none"></div>
            <div className="absolute w-96 h-96 bg-purple-600/20 rounded-full blur-3xl top-1/2 -right-10 animate-pulse pointer-events-none"></div>
            <div className="absolute w-80 h-80 bg-pink-600/20 rounded-full blur-3xl -bottom-10 left-1/3 animate-pulse pointer-events-none"></div>

            {/* Signup Card */}
            <div className="relative z-10 w-full max-w-md bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl shadow-2xl p-8 sm:p-10">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400 mb-2">
                        Pulse Check
                    </Link>
                    <h1 className="text-3xl font-extrabold text-white">Create Account</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Already have an account?{' '}
                        <Link href="/login" className="text-teal-400 hover:text-teal-300 font-semibold transition">
                            Sign in here
                        </Link>
                    </p>
                </div>

                {/* Social Sign-up option */}
                <button
                    type="button"
                    onClick={() => toast('Google Sign-In is coming soon in the next update!', { icon: 'ℹ️' })}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-gray-950/60 border border-gray-700/80 text-gray-200 font-medium hover:bg-gray-800/80 hover:border-gray-600 transition active:scale-[0.99] mb-6"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                    </svg>
                    <span>Continue with Google</span>
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-gray-800"></div>
                    <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider">or sign up with email</span>
                    <div className="flex-1 h-px bg-gray-800"></div>
                </div>

                {/* Form */}
                <form onSubmit={signupForm.handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            onChange={signupForm.handleChange}
                            onBlur={signupForm.handleBlur}
                            value={signupForm.values.name}
                            className={`w-full px-4 py-3 rounded-xl bg-gray-950/60 border ${
                                signupForm.touched.name && signupForm.errors.name
                                    ? 'border-red-500 focus:ring-red-400'
                                    : 'border-gray-700/80 focus:border-teal-400 focus:ring-teal-400/30'
                            } text-gray-100 placeholder-gray-500 focus:ring-2 focus:outline-none transition duration-200`}
                        />
                        {signupForm.touched.name && signupForm.errors.name && (
                            <p className="text-xs text-red-400 mt-1 font-medium">{signupForm.errors.name}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="you@example.com"
                            onChange={signupForm.handleChange}
                            onBlur={signupForm.handleBlur}
                            value={signupForm.values.email}
                            className={`w-full px-4 py-3 rounded-xl bg-gray-950/60 border ${
                                signupForm.touched.email && signupForm.errors.email
                                    ? 'border-red-500 focus:ring-red-400'
                                    : 'border-gray-700/80 focus:border-teal-400 focus:ring-teal-400/30'
                            } text-gray-100 placeholder-gray-500 focus:ring-2 focus:outline-none transition duration-200`}
                        />
                        {signupForm.touched.email && signupForm.errors.email && (
                            <p className="text-xs text-red-400 mt-1 font-medium">{signupForm.errors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="At least 8 chars (letters, numbers, special)"
                            onChange={signupForm.handleChange}
                            onBlur={signupForm.handleBlur}
                            value={signupForm.values.password}
                            className={`w-full px-4 py-3 rounded-xl bg-gray-950/60 border ${
                                signupForm.touched.password && signupForm.errors.password
                                    ? 'border-red-500 focus:ring-red-400'
                                    : 'border-gray-700/80 focus:border-teal-400 focus:ring-teal-400/30'
                            } text-gray-100 placeholder-gray-500 focus:ring-2 focus:outline-none transition duration-200`}
                        />
                        {signupForm.touched.password && signupForm.errors.password && (
                            <p className="text-xs text-red-400 mt-1 font-medium">{signupForm.errors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="Repeat password"
                            onChange={signupForm.handleChange}
                            onBlur={signupForm.handleBlur}
                            value={signupForm.values.confirmPassword}
                            className={`w-full px-4 py-3 rounded-xl bg-gray-950/60 border ${
                                signupForm.touched.confirmPassword && signupForm.errors.confirmPassword
                                    ? 'border-red-500 focus:ring-red-400'
                                    : 'border-gray-700/80 focus:border-teal-400 focus:ring-teal-400/30'
                            } text-gray-100 placeholder-gray-500 focus:ring-2 focus:outline-none transition duration-200`}
                        />
                        {signupForm.touched.confirmPassword && signupForm.errors.confirmPassword && (
                            <p className="text-xs text-red-400 mt-1 font-medium">{signupForm.errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Terms */}
                    <div>
                        <div className="flex items-start mt-2">
                            <input
                                type="checkbox"
                                id="terms"
                                name="terms"
                                onChange={signupForm.handleChange}
                                onBlur={signupForm.handleBlur}
                                checked={signupForm.values.terms}
                                className="w-4 h-4 mt-0.5 rounded bg-gray-950 border-gray-700 text-teal-500 focus:ring-teal-400 accent-teal-400"
                            />
                            <label htmlFor="terms" className="ml-2 text-xs text-gray-400 select-none cursor-pointer">
                                I agree to the{' '}
                                <span className="text-teal-400 hover:underline">
                                    Terms of Service
                                </span>{' '}
                                and{' '}
                                <span className="text-teal-400 hover:underline">
                                    Privacy Policy
                                </span>
                            </label>
                        </div>
                        {signupForm.touched.terms && signupForm.errors.terms && (
                            <p className="text-xs text-red-400 mt-1 font-medium">{signupForm.errors.terms}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 mt-2 rounded-xl bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-500 text-gray-950 font-bold hover:opacity-95 active:scale-[0.99] transition duration-200 shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-gray-950" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                </svg>
                                <span>Creating Account...</span>
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignUp;