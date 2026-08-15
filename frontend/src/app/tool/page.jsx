'use client';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import toast from 'react-hot-toast';

const METHOD_COLORS = {
    GET: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    POST: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    PUT: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    DELETE: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    PATCH: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    HEAD: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    OPTIONS: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
};

const PRESETS = [
    { label: 'Sample Todos (GET)', method: 'GET', url: 'https://jsonplaceholder.typicode.com/todos/1', body: '' },
    { label: 'Sample Post (POST)', method: 'POST', url: 'https://jsonplaceholder.typicode.com/posts', body: JSON.stringify({ title: 'Test Request', body: 'Pulse Check payload', userId: 1 }, null, 2) },
    { label: 'HTTPBin Headers (GET)', method: 'GET', url: 'https://httpbin.org/headers', body: '' },
    { label: 'Pulse Check Backend (GET)', method: 'GET', url: 'http://localhost:5000', body: '' },
];

const ApiTester = () => {
    const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
    const [method, setMethod] = useState('GET');
    const [body, setBody] = useState('');
    const [headers, setHeaders] = useState([
        { key: 'Content-Type', value: 'application/json', enabled: true },
        { key: 'Accept', value: 'application/json', enabled: true },
    ]);
    const [queryParams, setQueryParams] = useState([{ key: '', value: '', enabled: true }]);
    
    // Auth state
    const [authType, setAuthType] = useState('none'); // 'none' | 'bearer' | 'basic'
    const [bearerToken, setBearerToken] = useState('');
    const [basicAuth, setBasicAuth] = useState({ username: '', password: '' });

    // Mode
    const [useProxy, setUseProxy] = useState(true);

    // Response state
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [responseTab, setResponseTab] = useState('Body'); // 'Body' | 'Headers' | 'Raw'
    const [activeTab, setActiveTab] = useState('Body'); // 'Params' | 'Auth' | 'Headers' | 'Body'

    // History & User state
    const [savedRequests, setSavedRequests] = useState([]);
    const [user, setUser] = useState(null);
    const [copied, setCopied] = useState(false);

    // Load initial user and saved requests from localStorage
    useEffect(() => {
        try {
            const profile = localStorage.getItem('userProfile');
            if (profile) setUser(JSON.parse(profile));

            const stored = localStorage.getItem('savedRequests');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) setSavedRequests(parsed);
            }
        } catch (err) {
            console.error('Failed to load saved state', err);
        }
    }, []);

    // Build URL with query params
    const getFullUrl = useCallback(() => {
        if (!url) return '';
        try {
            // Check if valid full URL
            const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
            queryParams.forEach((param) => {
                if (param.enabled && param.key.trim()) {
                    urlObj.searchParams.set(param.key.trim(), param.value);
                }
            });
            return urlObj.toString();
        } catch (e) {
            return url;
        }
    }, [url, queryParams]);

    // Format active headers for execution
    const buildHeadersObject = useCallback(() => {
        const headerObj = {};
        headers.forEach((h) => {
            if (h.enabled && h.key && h.key.trim()) {
                headerObj[h.key.trim()] = h.value || '';
            }
        });

        // Inject Auth
        if (authType === 'bearer' && bearerToken.trim()) {
            headerObj['Authorization'] = `Bearer ${bearerToken.trim()}`;
        } else if (authType === 'basic' && (basicAuth.username || basicAuth.password)) {
            const credentials = btoa(`${basicAuth.username}:${basicAuth.password}`);
            headerObj['Authorization'] = `Basic ${credentials}`;
        }

        return headerObj;
    }, [headers, authType, bearerToken, basicAuth]);

    // Send the API request
    const sendRequest = async () => {
        if (!url.trim()) {
            toast.error('Please enter an API URL');
            return;
        }

        setLoading(true);
        setResponse(null);

        const targetUrl = getFullUrl();
        const headerObj = buildHeadersObject();

        let parsedBody = null;
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && body.trim()) {
            try {
                parsedBody = JSON.parse(body);
            } catch (err) {
                // If not valid JSON, send as raw text string
                parsedBody = body;
            }
        }

        const startTime = Date.now();

        try {
            if (useProxy) {
                // Send via backend proxy to bypass browser CORS
                const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const res = await axios.post(`${backendUrl}/request/proxy`, {
                    url: targetUrl,
                    method,
                    headers: headerObj,
                    body: parsedBody,
                });

                setResponse(res.data);
            } else {
                // Direct browser request
                const res = await axios({
                    url: targetUrl,
                    method,
                    headers: headerObj,
                    data: parsedBody,
                    validateStatus: () => true,
                });

                const duration = Date.now() - startTime;
                const dataString = typeof res.data === 'object' ? JSON.stringify(res.data) : String(res.data || '');
                const sizeBytes = new Blob([dataString]).size;

                setResponse({
                    success: res.status >= 200 && res.status < 400,
                    status: res.status,
                    statusText: res.statusText || 'OK',
                    data: res.data,
                    headers: res.headers,
                    responseTime: `${duration}ms`,
                    durationMs: duration,
                    size: `${(sizeBytes / 1024).toFixed(2)} KB`,
                });
            }
            toast.success('Request completed');
        } catch (error) {
            const duration = Date.now() - startTime;
            setResponse({
                success: false,
                status: error.response?.status || 0,
                statusText: error.code || 'Network Error',
                error: error.message || 'Failed to complete request',
                data: error.response?.data || null,
                headers: error.response?.headers || {},
                responseTime: `${duration}ms`,
                durationMs: duration,
                size: '0 KB',
            });
            toast.error(error.message || 'Request failed');
        } finally {
            setLoading(false);
        }
    };

    // Keyboard shortcut handler (Ctrl+Enter or Cmd+Enter to send)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                sendRequest();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [url, method, body, headers, authType, bearerToken, basicAuth, useProxy]);

    // Save request to localStorage and optionally database
    const saveRequest = async () => {
        if (!url.trim()) {
            toast.error('Cannot save empty request');
            return;
        }

        const newReq = {
            id: Date.now().toString(),
            url,
            method,
            body,
            headers,
            authType,
            bearerToken,
            savedAt: new Date().toISOString(),
        };

        const updated = [newReq, ...savedRequests.filter((r) => r.url !== url || r.method !== method)].slice(0, 30);
        setSavedRequests(updated);
        localStorage.setItem('savedRequests', JSON.stringify(updated));

        // If user logged in, persist to backend
        try {
            const token = localStorage.getItem('userToken');
            if (token && user) {
                const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                await axios.post(
                    `${backendUrl}/request/add`,
                    {
                        method,
                        url,
                        body: body ? JSON.parse(body) : undefined,
                        headers: buildHeadersObject(),
                        user: user._id,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
        } catch (e) {
            console.log('Backend sync skipped or silent:', e.message);
        }

        toast.success('Request saved to collections!');
    };

    // Load a saved request into workspace
    const loadRequest = (req) => {
        setUrl(req.url || '');
        setMethod(req.method || 'GET');
        setBody(typeof req.body === 'object' ? JSON.stringify(req.body, null, 2) : req.body || '');
        if (Array.isArray(req.headers)) setHeaders(req.headers);
        if (req.authType) setAuthType(req.authType);
        if (req.bearerToken) setBearerToken(req.bearerToken);
        toast('Loaded saved request', { icon: '📂' });
    };

    // Delete single saved request
    const deleteSavedRequest = (id, e) => {
        e.stopPropagation();
        const updated = savedRequests.filter((r) => r.id !== id);
        setSavedRequests(updated);
        localStorage.setItem('savedRequests', JSON.stringify(updated));
        toast.success('Removed from saved list');
    };

    // Clear all saved requests
    const clearAllSaved = () => {
        setSavedRequests([]);
        localStorage.removeItem('savedRequests');
        toast.success('Cleared all saved requests');
    };

    // Prettify JSON Body
    const formatJsonBody = () => {
        if (!body.trim()) return;
        try {
            const parsed = JSON.parse(body);
            setBody(JSON.stringify(parsed, null, 2));
            toast.success('JSON formatted');
        } catch (e) {
            toast.error('Invalid JSON syntax: ' + e.message);
        }
    };

    // Copy response to clipboard
    const copyResponse = () => {
        if (!response) return;
        const text = typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : String(response.data || response.error || '');
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    // Headers helper functions
    const addHeaderRow = () => setHeaders([...headers, { key: '', value: '', enabled: true }]);
    const updateHeader = (index, field, val) => {
        const updated = [...headers];
        updated[index][field] = val;
        setHeaders(updated);
    };
    const removeHeaderRow = (index) => setHeaders(headers.filter((_, i) => i !== index));

    // Query Params helper functions
    const addParamRow = () => setQueryParams([...queryParams, { key: '', value: '', enabled: true }]);
    const updateParam = (index, field, val) => {
        const updated = [...queryParams];
        updated[index][field] = val;
        setQueryParams(updated);
    };
    const removeParamRow = (index) => setQueryParams(queryParams.filter((_, i) => i !== index));

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 font-sans flex flex-col selection:bg-teal-500 selection:text-gray-950">
            {/* Top Navigation */}
            <header className="flex justify-between items-center px-6 py-3.5 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/80 sticky top-0 z-40">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-400 to-blue-500 flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform duration-200">
                            <span className="text-gray-950 font-black text-sm">⚡</span>
                        </div>
                        <span className="text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
                            Pulse Check
                        </span>
                    </Link>

                    {/* Presets quick dropdown / chips */}
                    <div className="hidden lg:flex items-center gap-2">
                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mr-1">Presets:</span>
                        {PRESETS.map((p, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setMethod(p.method);
                                    setUrl(p.url);
                                    setBody(p.body);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 hover:border-teal-500/40 text-xs text-gray-300 hover:text-white transition"
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold">
                    {/* Proxy Mode Switch */}
                    <label className="flex items-center gap-2 cursor-pointer bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-xl hover:border-gray-700 transition">
                        <input
                            type="checkbox"
                            checked={useProxy}
                            onChange={(e) => setUseProxy(e.target.checked)}
                            className="w-3.5 h-3.5 rounded accent-teal-400 cursor-pointer"
                        />
                        <span className="text-gray-300">
                            Proxy Engine <span className="text-teal-400">(No CORS)</span>
                        </span>
                    </label>

                    {user ? (
                        <span className="px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
                            👤 {user.name}
                        </span>
                    ) : (
                        <Link
                            href="/login"
                            className="px-3.5 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white transition"
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            </header>

            {/* Main Workspace Layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 max-w-[1600px] w-full mx-auto">
                {/* Left / Top Section: Request Builder & Response Viewer (8 cols) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Request Input Bar */}
                    <div className="bg-gray-900/80 border border-gray-800/80 rounded-2xl p-4 shadow-xl">
                        <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                            {/* HTTP Method Dropdown */}
                            <select
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                className={`px-4 py-3 rounded-xl font-bold text-sm bg-gray-950 border border-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400 transition cursor-pointer ${
                                    METHOD_COLORS[method] || 'text-white'
                                }`}
                            >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                                <option value="PATCH">PATCH</option>
                                <option value="HEAD">HEAD</option>
                                <option value="OPTIONS">OPTIONS</option>
                            </select>

                            {/* URL Input */}
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="Enter API endpoint URL (e.g. https://api.example.com/v1/users)"
                                    className="w-full h-full px-4 py-3 rounded-xl bg-gray-950/80 border border-gray-800 text-gray-100 placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={sendRequest}
                                    disabled={loading}
                                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-teal-400 to-blue-500 text-gray-950 font-extrabold text-sm hover:from-teal-300 hover:to-blue-400 shadow-lg shadow-teal-500/20 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-gray-950" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                            </svg>
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Send</span>
                                            <span className="hidden sm:inline opacity-70 text-xs">↵</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={saveRequest}
                                    title="Save to Collections"
                                    className="px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-gray-300 hover:text-amber-400 hover:border-amber-500/40 font-bold text-sm transition active:scale-95"
                                >
                                    ★ Save
                                </button>
                            </div>
                        </div>

                        {/* Request Configuration Tabs */}
                        <div className="mt-6 border-b border-gray-800 flex gap-2 sm:gap-6 overflow-x-auto">
                            {['Params', 'Headers', 'Auth', 'Body'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-2.5 px-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition relative ${
                                        activeTab === tab ? 'text-teal-400' : 'text-gray-400 hover:text-gray-200'
                                    }`}
                                >
                                    {tab}
                                    {tab === 'Headers' && (
                                        <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-gray-800 text-teal-400">
                                            {headers.filter((h) => h.enabled && h.key).length}
                                        </span>
                                    )}
                                    {activeTab === tab && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full"></span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content Panels */}
                        <div className="mt-4">
                            {/* PARAMS TAB */}
                            {activeTab === 'Params' && (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Query Parameters</span>
                                        <button
                                            onClick={addParamRow}
                                            className="text-xs text-teal-400 hover:text-teal-300 font-bold"
                                        >
                                            + Add Parameter
                                        </button>
                                    </div>
                                    {queryParams.map((p, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <input
                                                type="checkbox"
                                                checked={p.enabled}
                                                onChange={(e) => updateParam(idx, 'enabled', e.target.checked)}
                                                className="accent-teal-400 rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Key"
                                                value={p.key}
                                                onChange={(e) => updateParam(idx, 'key', e.target.value)}
                                                className="flex-1 px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 text-xs font-mono text-gray-200 focus:outline-none focus:border-teal-400"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Value"
                                                value={p.value}
                                                onChange={(e) => updateParam(idx, 'value', e.target.value)}
                                                className="flex-1 px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 text-xs font-mono text-gray-200 focus:outline-none focus:border-teal-400"
                                            />
                                            <button
                                                onClick={() => removeParamRow(idx)}
                                                className="px-2 py-1 text-gray-500 hover:text-red-400 text-sm font-bold"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* HEADERS TAB */}
                            {activeTab === 'Headers' && (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Request Headers</span>
                                        <button
                                            onClick={addHeaderRow}
                                            className="text-xs text-teal-400 hover:text-teal-300 font-bold"
                                        >
                                            + Add Header
                                        </button>
                                    </div>
                                    {headers.map((h, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <input
                                                type="checkbox"
                                                checked={h.enabled}
                                                onChange={(e) => updateHeader(idx, 'enabled', e.target.checked)}
                                                className="accent-teal-400 rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Header Name"
                                                value={h.key}
                                                onChange={(e) => updateHeader(idx, 'key', e.target.value)}
                                                className="flex-1 px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 text-xs font-mono text-gray-200 focus:outline-none focus:border-teal-400"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Value"
                                                value={h.value}
                                                onChange={(e) => updateHeader(idx, 'value', e.target.value)}
                                                className="flex-1 px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 text-xs font-mono text-gray-200 focus:outline-none focus:border-teal-400"
                                            />
                                            <button
                                                onClick={() => removeHeaderRow(idx)}
                                                className="px-2 py-1 text-gray-500 hover:text-red-400 text-sm font-bold"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* AUTH TAB */}
                            {activeTab === 'Auth' && (
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        {['none', 'bearer', 'basic'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setAuthType(type)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                                                    authType === type
                                                        ? 'bg-teal-500/20 border border-teal-500 text-teal-400'
                                                        : 'bg-gray-950 border border-gray-800 text-gray-400 hover:text-white'
                                                }`}
                                            >
                                                {type === 'none' ? 'No Auth' : type === 'bearer' ? 'Bearer Token' : 'Basic Auth'}
                                            </button>
                                        ))}
                                    </div>

                                    {authType === 'bearer' && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Bearer Token</label>
                                            <textarea
                                                rows={3}
                                                value={bearerToken}
                                                onChange={(e) => setBearerToken(e.target.value)}
                                                placeholder="Paste JWT / Bearer Token here..."
                                                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs font-mono text-gray-200 focus:outline-none focus:border-teal-400 resize-none"
                                            />
                                        </div>
                                    )}

                                    {authType === 'basic' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Username</label>
                                                <input
                                                    type="text"
                                                    value={basicAuth.username}
                                                    onChange={(e) => setBasicAuth({ ...basicAuth, username: e.target.value })}
                                                    placeholder="admin"
                                                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs font-mono text-gray-200 focus:outline-none focus:border-teal-400"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
                                                <input
                                                    type="password"
                                                    value={basicAuth.password}
                                                    onChange={(e) => setBasicAuth({ ...basicAuth, password: e.target.value })}
                                                    placeholder="••••••••"
                                                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs font-mono text-gray-200 focus:outline-none focus:border-teal-400"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {authType === 'none' && (
                                        <p className="text-xs text-gray-500 italic">No authentication headers will be added to this request.</p>
                                    )}
                                </div>
                            )}

                            {/* BODY TAB */}
                            {activeTab === 'Body' && (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">JSON / Raw Payload</span>
                                        <button
                                            onClick={formatJsonBody}
                                            className="text-xs text-teal-400 hover:text-teal-300 font-bold bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/30 transition"
                                        >
                                            ✨ Format JSON
                                        </button>
                                    </div>
                                    <textarea
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        placeholder={`{\n  "key": "value"\n}`}
                                        rows={6}
                                        className="w-full bg-gray-950 border border-gray-800 text-teal-300 font-mono text-xs p-4 rounded-xl resize-y focus:outline-none focus:border-teal-400 transition"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Response Inspector Box */}
                    <div className="bg-gray-900/80 border border-gray-800/80 rounded-2xl p-4 shadow-xl flex-1 flex flex-col min-h-[350px]">
                        {/* Response Top Bar */}
                        <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-gray-800">
                            <div className="flex items-center gap-4">
                                <h3 className="font-extrabold text-sm text-gray-200">Response</h3>

                                {response && (
                                    <div className="flex items-center gap-3 text-xs">
                                        {/* Status Badge */}
                                        <span
                                            className={`px-2.5 py-1 rounded-lg font-mono font-bold ${
                                                response.status >= 200 && response.status < 300
                                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                    : response.status >= 300 && response.status < 400
                                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                    : response.status >= 400 && response.status < 500
                                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                            }`}
                                        >
                                            {response.status} {response.statusText}
                                        </span>

                                        {/* Timing */}
                                        <span className="text-gray-400 font-mono">⏱️ {response.responseTime || '0ms'}</span>

                                        {/* Size */}
                                        {response.size && <span className="text-gray-400 font-mono">📦 {response.size}</span>}
                                    </div>
                                )}
                            </div>

                            {/* Response Sub-tabs & Copy Button */}
                            <div className="flex items-center gap-2">
                                <div className="flex bg-gray-950 rounded-lg p-1 border border-gray-800 text-xs">
                                    {['Body', 'Headers', 'Raw'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setResponseTab(tab)}
                                            className={`px-3 py-1 rounded-md font-semibold transition ${
                                                responseTab === tab ? 'bg-gray-800 text-teal-400' : 'text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                {response && (
                                    <button
                                        onClick={copyResponse}
                                        className="px-3 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-xs font-semibold text-gray-300 hover:text-teal-400 hover:border-teal-500/30 transition"
                                    >
                                        {copied ? '✓ Copied' : '📋 Copy'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Response Content Display */}
                        <div className="flex-1 mt-3 bg-gray-950 rounded-xl p-4 font-mono text-xs overflow-auto max-h-[420px] border border-gray-900">
                            {!response ? (
                                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 py-12">
                                    <span className="text-3xl mb-2">🚀</span>
                                    <p className="font-sans font-medium text-sm">Enter endpoint URL and hit Send to inspect response data</p>
                                    <p className="text-[11px] text-gray-600 mt-1">Shortcut: Press Ctrl + Enter</p>
                                </div>
                            ) : responseTab === 'Body' ? (
                                <pre className="text-teal-300 leading-relaxed break-words whitespace-pre-wrap">
                                    {response.data !== undefined && response.data !== null
                                        ? typeof response.data === 'object'
                                            ? JSON.stringify(response.data, null, 2)
                                            : String(response.data)
                                        : response.error
                                        ? `Error: ${response.error}`
                                        : '// Empty response body'}
                                </pre>
                            ) : responseTab === 'Headers' ? (
                                <div className="space-y-1.5">
                                    {response.headers && Object.keys(response.headers).length > 0 ? (
                                        Object.entries(response.headers).map(([k, v], idx) => (
                                            <div key={idx} className="flex gap-2 border-b border-gray-900 pb-1">
                                                <span className="text-blue-400 font-bold min-w-[140px]">{k}:</span>
                                                <span className="text-gray-300 break-all">{String(v)}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 italic">No response headers captured</p>
                                    )}
                                </div>
                            ) : (
                                <pre className="text-gray-300 leading-relaxed whitespace-pre-wrap break-all">
                                    {JSON.stringify(response, null, 2)}
                                </pre>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Section: Collections / Saved Requests Sidebar (4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-gray-900/80 border border-gray-800/80 rounded-2xl p-5 shadow-xl flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">📁</span>
                                <h3 className="font-extrabold text-sm text-white">Saved Collections</h3>
                            </div>
                            {savedRequests.length > 0 && (
                                <button
                                    onClick={clearAllSaved}
                                    className="text-[11px] text-gray-500 hover:text-rose-400 transition font-semibold"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[580px] space-y-2 pr-1">
                            {savedRequests.length === 0 ? (
                                <div className="text-center py-12 px-4 border border-dashed border-gray-800 rounded-xl">
                                    <span className="text-2xl opacity-40">⭐</span>
                                    <p className="text-xs text-gray-400 mt-2 font-medium">No saved requests yet.</p>
                                    <p className="text-[11px] text-gray-600 mt-1">
                                        Click the <span className="text-amber-400">★ Save</span> button above to pin requests here for quick reuse.
                                    </p>
                                </div>
                            ) : (
                                savedRequests.map((req) => (
                                    <div
                                        key={req.id}
                                        onClick={() => loadRequest(req)}
                                        className="group p-3 rounded-xl bg-gray-950 border border-gray-800/80 hover:border-teal-500/40 hover:bg-gray-900 cursor-pointer transition flex items-center justify-between gap-3 shadow-sm"
                                    >
                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                            <span
                                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                                    METHOD_COLORS[req.method] || 'bg-gray-800 text-gray-300'
                                                }`}
                                            >
                                                {req.method}
                                            </span>
                                            <span className="text-xs font-mono text-gray-300 truncate group-hover:text-white transition">
                                                {req.url}
                                            </span>
                                        </div>

                                        <button
                                            onClick={(e) => deleteSavedRequest(req.id, e)}
                                            className="text-gray-600 hover:text-rose-400 text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition"
                                            title="Delete"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Shortcuts Cheat Sheet Footer */}
                        <div className="mt-6 pt-4 border-t border-gray-800/80">
                            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Shortcuts &amp; Tips</h4>
                            <ul className="text-[11px] text-gray-500 space-y-1 font-mono">
                                <li>
                                    <strong className="text-gray-300">Ctrl + Enter:</strong> Execute request
                                </li>
                                <li>
                                    <strong className="text-gray-300">Proxy Engine:</strong> Bypasses CORS blocks
                                </li>
                                <li>
                                    <strong className="text-gray-300">Auth Token:</strong> Auto-injected to headers
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiTester;