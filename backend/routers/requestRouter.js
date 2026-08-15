const express = require("express");
const router = express.Router();
const Request = require("../models/requestModel");
const jwt = require("jsonwebtoken");
const { testApi } = require("../controllers/apicontroller");

const JWT_SECRET = process.env.JWT_SECRET || "pulse_secret_key_default";

// Optional authentication middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    if (!token) return res.status(401).json({ error: "No token provided" });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
};

// Route to proxy / test external API calls (bypasses browser CORS)
router.post("/proxy", testApi);
router.post("/test-api", testApi);

// Save a new request
router.post("/add", async (req, res) => {
    try {
        const doc = new Request(req.body);
        const result = await doc.save();
        res.status(201).json(result);
    } catch (err) {
        console.error("Error saving request:", err);
        res.status(500).json({ error: err.message || "Failed to save request" });
    }
});

// Get all requests
router.get("/getall", async (req, res) => {
    try {
        const result = await Request.find().sort({ createdAt: -1 });
        res.status(200).json(result);
    } catch (err) {
        console.error("Error fetching requests:", err);
        res.status(500).json({ error: err.message || "Failed to fetch requests" });
    }
});

// Get request by ID
router.get("/getbyid/:id", async (req, res) => {
    try {
        const result = await Request.findById(req.params.id);
        if (!result) return res.status(404).json({ error: "Request not found" });
        res.status(200).json(result);
    } catch (err) {
        console.error("Error fetching request by ID:", err);
        res.status(500).json({ error: err.message || "Failed to fetch request" });
    }
});

// Delete request by ID
router.delete("/delete/:id", async (req, res) => {
    try {
        const result = await Request.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ error: "Request not found" });
        res.status(200).json({ message: "Request deleted successfully", result });
    } catch (err) {
        console.error("Error deleting request:", err);
        res.status(500).json({ error: err.message || "Failed to delete request" });
    }
});

// Update request by ID
router.put("/update/:id", async (req, res) => {
    try {
        const result = await Request.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!result) return res.status(404).json({ error: "Request not found" });
        res.status(200).json(result);
    } catch (err) {
        console.error("Error updating request:", err);
        res.status(500).json({ error: err.message || "Failed to update request" });
    }
});

// Get requests by user ID
router.get("/getbyuser/:userId", async (req, res) => {
    try {
        const result = await Request.find({ user: req.params.userId }).sort({ createdAt: -1 });
        res.status(200).json(result);
    } catch (err) {
        console.error("Error fetching requests for user:", err);
        res.status(500).json({ error: err.message || "Failed to fetch user requests" });
    }
});

module.exports = router;