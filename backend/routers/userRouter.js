const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
require("dotenv").config();

const Model = require("../models/userModel.js");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "pulse_secret_key_default";

// Defining a route for adding/registering a user
router.post("/add", async (req, res) => {
    try {
        const { name, email, password, city, role } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required" });
        }

        const existingUser = await Model.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email is already registered" });
        }

        const user = new Model({ name, email, password, city, role });
        const result = await user.save();
        
        const userObj = result.toObject();
        delete userObj.password;
        
        res.status(201).json(userObj);
    } catch (err) {
        console.error("Error creating user:", err);
        if (err.code === 11000) {
            return res.status(400).json({ error: "Email is already registered" });
        }
        if (err.name === "ValidationError") {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: "Failed to create user" });
    }
});

// Get all users
router.get("/getall", async (req, res) => {
    try {
        const result = await Model.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json(result);
    } catch (err) {
        console.error("Error fetching all users:", err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// Get user by ID
router.get("/getbyid/:id", async (req, res) => {
    try {
        const result = await Model.findById(req.params.id).select("-password");
        if (!result) return res.status(404).json({ error: "User not found" });
        res.status(200).json(result);
    } catch (err) {
        console.error("Error fetching user by ID:", err);
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

// Get user by city
router.get("/getbycity/:city", async (req, res) => {
    try {
        const result = await Model.find({ city: req.params.city }).select("-password");
        res.status(200).json(result);
    } catch (err) {
        console.error("Error fetching users by city:", err);
        res.status(500).json({ error: "Failed to fetch users by city" });
    }
});

// Get user by email
router.get("/getbyemail/:email", async (req, res) => {
    try {
        const result = await Model.findOne({ email: req.params.email }).select("-password");
        if (!result) return res.status(404).json({ error: "User not found" });
        res.status(200).json(result);
    } catch (err) {
        console.error("Error fetching user by email:", err);
        res.status(500).json({ error: "Failed to fetch user by email" });
    }
});

// Delete user by ID
router.delete("/delete/:id", async (req, res) => {
    try {
        const result = await Model.findByIdAndDelete(req.params.id).select("-password");
        if (!result) return res.status(404).json({ error: "User not found" });
        res.status(200).json({ message: "User deleted successfully", result });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ error: "Failed to delete user" });
    }
});

// Update user by ID
router.put("/update/:id", async (req, res) => {
    try {
        const updates = { ...req.body };
        // If updating password, hash it properly
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }
        const result = await Model.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");
        if (!result) return res.status(404).json({ error: "User not found" });
        res.status(200).json(result);
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ error: "Failed to update user" });
    }
});

// Authenticate / Login user
router.post("/authenticate", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await Model.findOne({ email });
        if (!user) return res.status(401).json({ error: "Invalid Credentials" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: "Invalid Credentials" });

        const payload = { _id: user._id, name: user.name, email: user.email, role: user.role };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

        res.status(200).json({
            message: "Login successful",
            token,
            user: payload,
        });
    } catch (err) {
        console.error("Authentication error:", err);
        res.status(500).json({ error: "Server error during authentication" });
    }
});

// Forgot password - send reset email
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });

        const user = await Model.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        // Generate a reset token (expires in 15 minutes)
        const resetToken = jwt.sign(
            { _id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: "15m" }
        );

        // Build reset link
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("EMAIL_USER or EMAIL_PASS not configured in .env. Returning reset link for dev/testing.");
            return res.status(200).json({
                message: "Reset link generated (Dev mode: email credentials not configured)",
                resetLink,
            });
        }

        // Configure nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Send email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Pulse Check - Password Reset",
            html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; background: #111827; color: #f3f4f6; border-radius: 12px;">
                    <h2 style="color: #2dd4bf; margin-bottom: 8px;">Pulse Check</h2>
                    <p>Hi <strong>${user.name}</strong>,</p>
                    <p>You requested a password reset. Click the button below to set a new password:</p>
                    <div style="margin: 24px 0;">
                        <a href="${resetLink}" style="display: inline-block; background: linear-gradient(to right, #2dd4bf, #3b82f6); color: #000000; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #9ca3af; font-size: 12px;">This link will expire in 15 minutes. If you did not request this, please ignore this email.</p>
                </div>
            `,
        });

        res.status(200).json({ message: "Reset link sent to your email" });
    } catch (err) {
        console.error("Forgot password error:", err);
        res.status(500).json({ error: "Failed to process forgot password request" });
    }
});

// Reset password with token
router.post("/reset-password/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: "New password is required" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (jwtErr) {
            return res.status(400).json({ error: "Invalid or expired reset token" });
        }

        const user = await Model.findById(decoded._id || decoded.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        user.password = password; // pre-save hook will hash it
        await user.save();

        res.status(200).json({ message: "Password reset successful! You can now log in." });
    } catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ error: "Failed to reset password" });
    }
});

module.exports = router;