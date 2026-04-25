// routes/notices.js
// GET  /api/notices          → all notices (newest first), optional ?type= filter
// GET  /api/notices/:id      → single notice detail
// POST /api/notices          → create notice (admin only — checks custom claim)

import { Router } from "express";
import { db } from "../config/firebase.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// ── GET /api/notices ─────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    let query = db.collection("notices");

    // Optional filter: /api/notices?type=exam
    const { type } = req.query;
    if (type) query = query.where("type", "==", type);

    const snap    = await query.get();
    const notices = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Sort by date descending (client-side — avoids composite index requirement)
    notices.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ notices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/notices/:id ─────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const snap = await db.collection("notices").doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error: "Notice not found." });
    res.json({ notice: { id: snap.id, ...snap.data() } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/notices (admin only) ───────────────────────────────────
// Body: { title, date, type, tag, urgent, content, by }
router.post("/", requireAuth, async (req, res) => {
  // Require admin custom claim
  if (!req.user.admin) {
    return res.status(403).json({ error: "Admin access required." });
  }
  try {
    const { title, date, type, tag, urgent, content, by } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "title and content are required." });
    }

    const notice = {
      title,
      date:      date || new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      type:      type || "general",
      tag:       tag  || "General",
      urgent:    Boolean(urgent),
      content,
      by:        by || "Administration",
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("notices").add(notice);
    res.status(201).json({ message: "Notice created.", id: docRef.id, notice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
