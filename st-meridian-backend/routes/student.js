// routes/student.js
// GET /api/student              → profile of the authenticated user
// GET /api/student/timetable    → today's timetable
// GET /api/student/results      → exam results
// GET /api/student/attendance   → subject-wise attendance

import { Router } from "express";
import { db } from "../config/firebase.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Helper — get the student doc that belongs to this Firebase user.
// We store the admNo on the user's Firestore profile at /users/{uid}.
async function getAdmNo(uid) {
  const snap = await db.collection("users").doc(uid).get();
  if (!snap.exists) throw Object.assign(new Error("User profile not found."), { status: 404 });
  return snap.data().admNo;
}

// ── GET /api/student ────────────────────────────────────────────────
router.get("/", requireAuth, async (req, res) => {
  try {
    const admNo = await getAdmNo(req.user.uid);
    const snap  = await db.collection("students").doc(admNo).get();
    if (!snap.exists) return res.status(404).json({ error: "Student not found." });
    res.json({ student: snap.data() });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// ── GET /api/student/timetable ──────────────────────────────────────
router.get("/timetable", requireAuth, async (req, res) => {
  try {
    const admNo = await getAdmNo(req.user.uid);
    const snap  = await db.collection("students").doc(admNo).collection("timetable").get();
    const rows  = snap.docs.map(d => d.data());
    res.json({ timetable: rows });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// ── GET /api/student/results ────────────────────────────────────────
router.get("/results", requireAuth, async (req, res) => {
  try {
    const admNo = await getAdmNo(req.user.uid);
    const snap  = await db.collection("students").doc(admNo).collection("results").get();
    res.json({ results: snap.docs.map(d => d.data()) });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// ── GET /api/student/attendance ─────────────────────────────────────
router.get("/attendance", requireAuth, async (req, res) => {
  try {
    const admNo = await getAdmNo(req.user.uid);
    const snap  = await db.collection("students").doc(admNo).collection("attendance").get();
    res.json({ attendance: snap.docs.map(d => d.data()) });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

export default router;
