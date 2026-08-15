const axios = require("axios");

exports.testApi = async (req, res) => {
    let { url, method = "GET", headers = {}, body = null } = req.body;

    if (!url) {
        return res.status(400).json({
            success: false,
            error: "URL is required"
        });
    }

    // Ensure URL has a protocol
    if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
    }

    // Normalize headers if array was sent
    let normalizedHeaders = {};
    if (Array.isArray(headers)) {
        headers.forEach((h) => {
            if (h && h.key && h.key.trim()) {
                normalizedHeaders[h.key.trim()] = h.value || "";
            }
        });
    } else if (typeof headers === "object" && headers !== null) {
        normalizedHeaders = { ...headers };
    }

    const start = Date.now();
    try {
        const response = await axios({
            url,
            method: method.toUpperCase(),
            headers: normalizedHeaders,
            data: body,
            timeout: 15000,
            validateStatus: () => true, // capture all status codes including 4xx, 5xx
        });

        const duration = Date.now() - start;
        const responseData = response.data;
        const dataString = typeof responseData === "object" ? JSON.stringify(responseData) : String(responseData || "");
        const sizeBytes = Buffer.byteLength(dataString, "utf8");

        res.status(200).json({
            success: response.status >= 200 && response.status < 400,
            status: response.status,
            statusText: response.statusText || "OK",
            data: responseData,
            headers: response.headers,
            responseTime: `${duration}ms`,
            durationMs: duration,
            size: `${(sizeBytes / 1024).toFixed(2)} KB`,
            sizeBytes,
        });
    } catch (error) {
        const duration = Date.now() - start;
        res.status(200).json({
            success: false,
            status: error.response?.status || 0,
            statusText: error.code || "Network Error",
            error: error.message,
            data: error.response?.data || null,
            headers: error.response?.headers || {},
            responseTime: `${duration}ms`,
            durationMs: duration,
            size: "0 KB",
            sizeBytes: 0,
        });
    }
};
