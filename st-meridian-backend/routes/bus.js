// routes/bus.js
// GET  /api/bus/routes               → all bus routes
// GET  /api/bus/applications         → this student's bus applications
// POST /api/bus/applications         → submit a new application

import { Router } from "express";
import { db } from "../config/firebase.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

async function getAdmNo(uid) {
  const snap = await db.collection("users").doc(uid).get();
  if (!snap.exists) throw Object.assign(new Error("User profile not found."), { status: 404 });
  return snap.data().admNo;
}

// ── GET /api/bus/routes ──────────────────────────────────────────────
router.get("/routes", async (_req, res) => {
  try {
    const snap   = await db.collection("busRoutes").get();
    const routes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ routes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/bus/applications ────────────────────────────────────────
router.get("/applications", requireAuth, async (req, res) => {
  try {
    const admNo = await getAdmNo(req.user.uid);
    const snap  = await db
      .collection("students").doc(admNo)
      .collection("busApplications")
      .orderBy("createdAt", "desc")
      .get();
    res.json({ applications: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
  } catch (err) {
    // Fallback — no composite index
    try {
      const admNo = await getAdmNo(req.user.uid);
      const snap2 = await db.collection("students").doc(admNo).collection("busApplications").get();
      res.json({ applications: snap2.docs.map(d => ({ id: d.id, ...d.data() })) });
    } catch (err2) {
      res.status(500).json({ error: err2.message });
    }
  }
});

// ── POST /api/bus/applications ───────────────────────────────────────
// Body: { studentName, class, route, stop, contact, type, notes }
router.post("/applications", requireAuth, async (req, res) => {
  try {
    const { studentName, studentClass, route, stop, contact, type, notes } = req.body;

    if (!route || !stop || !contact || !type) {
      return res.status(400).json({ error: "route, stop, contact, and type are required." });
    }
    if (!["new", "change"].includes(type)) {
      return res.status(400).json({ error: "type must be 'new' or 'change'." });
    }

    const admNo = await getAdmNo(req.user.uid);
    const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

    const application = {
      studentName:  studentName || "",
      studentClass: studentClass || "",
      route,
      stop,
      contact,
      type,
      notes:     notes || "",
      date:      today,
      status:    "Under Review",
      createdAt: new Date().toISOString(),
      uid:       req.user.uid,
    };

    const docRef = await db
      .collection("students").doc(admNo)
      .collection("busApplications")
      .add(application);

    res.status(201).json({ message: "Application submitted.", id: docRef.id, application });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

export default router;
