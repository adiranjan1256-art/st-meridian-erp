// routes/auth.js
// POST /api/auth/register   → create a new Firebase user + Firestore /users/{uid} doc
// GET  /api/auth/me         → return the decoded token claims (quick health-check)

import { Router } from "express";
import { auth, db } from "../config/firebase.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// ── POST /api/auth/register ──────────────────────────────────────────
// Creates the Firebase Auth account AND links it to a student profile.
// Body: { email, password, admNo, name }
//
// In a real school deployment an admin would create accounts or students
// would use invite tokens. This endpoint is left open for initial setup.
router.post("/register", async (req, res) => {
  const { email, password, admNo, name } = req.body;

  if (!email || !password || !admNo) {
    return res.status(400).json({ error: "email, password, and admNo are required." });
  }

  try {
    // 1. Verify the admNo exists in /students
    const studentSnap = await db.collection("students").doc(admNo).get();
    if (!studentSnap.exists) {
      return res.status(404).json({ error: `No student found with admNo '${admNo}'. Contact the school office.` });
    }

    // 2. Create Firebase Auth user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name || studentSnap.data().name,
    });

    // 3. Write /users/{uid} linking this Firebase UID to the admNo
    await db.collection("users").doc(userRecord.uid).set({
      uid:       userRecord.uid,
      email,
      admNo,
      name:      name || studentSnap.data().name,
      role:      "student",
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      message: "Account created successfully. Please sign in from the portal.",
      uid:     userRecord.uid,
    });
  } catch (err) {
    // Firebase Auth already has this email
    if (err.code === "auth/email-already-exists") {
      return res.status(409).json({ error: "An account with this email already exists." });
    }
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────
router.get("/me", requireAuth, async (req, res) => {
  try {
    const snap = await db.collection("users").doc(req.user.uid).get();
    res.json({ user: { uid: req.user.uid, email: req.user.email, ...(snap.exists ? snap.data() : {}) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
