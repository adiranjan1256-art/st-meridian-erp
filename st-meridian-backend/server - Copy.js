// server.js
// St. Meridian Academy — ERP Portal Backend
// Node.js + Express + Firebase Admin SDK

import "dotenv/config";
import express from "express";
import cors    from "cors";
import helmet  from "helmet";
import morgan  from "morgan";
import rateLimit from "express-rate-limit";

// Route modules
import authRoutes    from "./routes/auth.js";
import studentRoutes from "./routes/student.js";
import feesRoutes    from "./routes/fees.js";
import noticesRoutes from "./routes/notices.js";
import busRoutes     from "./routes/bus.js";
import schoolRoutes  from "./routes/school.js";

const app  = express();
const PORT = process.env.PORT || 3000;

/* ============================================================
   SECURITY & MIDDLEWARE
   ============================================================ */

// Helmet — sensible security headers
app.use(helmet());

// CORS — allow the Live Server (or production domain) to call the API
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5501")
  .split(",")
  .map(s => s.trim());

app.use(cors({
  origin(origin, cb) {
    // Allow server-to-server (no origin) or listed origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin '${origin}' not allowed.`));
  },
  methods:     ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// JSON body parser
app.use(express.json());

// Request logger (dev=colorful, combined=nginx-style for production)
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Global rate-limiter — 120 requests / 15 min per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      120,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: "Too many requests — please try again later." },
}));

/* ============================================================
   ROUTES
   ============================================================ */

// Health-check (no auth required)
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV, ts: new Date().toISOString() });
});

app.use("/api/auth",    authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/fees",    feesRoutes);
app.use("/api/notices", noticesRoutes);
app.use("/api/bus",     busRoutes);
app.use("/api/school",  schoolRoutes);

/* ============================================================
   404 & GLOBAL ERROR HANDLER
   ============================================================ */

app.use((_req, res) => {
  res.status(404).json({ error: "Endpoint not found." });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error." });
});

/* ============================================================
   START
   ============================================================ */

app.listen(PORT, () => {
  console.log(`\n🏫  St. Meridian ERP API running on http://localhost:${PORT}`);
  console.log(`    ENV : ${process.env.NODE_ENV || "development"}`);
  console.log(`    CORS: ${allowedOrigins.join(", ")}\n`);
});

export default app;
