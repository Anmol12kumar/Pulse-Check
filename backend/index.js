require('dotenv').config();
const cors = require("cors");
const express = require("express");
const { connectMongo } = require("./connection");
const UserRouter = require("./routers/userRouter");
const RequestRouter = require("./routers/requestRouter");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow frontend development access
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
  })
);

// Middleware to parse JSON and URL-encoded request bodies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/user", UserRouter);
app.use("/request", RequestRouter);

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Pulse Check Backend API is running smoothly 🚀",
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

if (process.env.NODE_ENV !== "test") {
  connectMongo().catch((err) => {
    console.error('MongoDB unavailable. App is running without a database connection.', err.message || err);
  });

  app.listen(PORT, () => {
    console.log(`Pulse Check server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;