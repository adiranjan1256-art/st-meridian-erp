// api.js  (frontend — place alongside index.html)
// ─────────────────────────────────────────────────────────────
// Thin wrapper around fetch() that:
//   1. Prepends the backend base URL
//   2. Attaches the Firebase ID token on authenticated requests
//   3. Throws on non-2xx responses with the server's error message
// ─────────────────────────────────────────────────────────────

import { auth } from "./firebase.js";
import { getIdToken } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ── Change this to your deployed backend URL in production ──
const BASE_URL = "http://localhost:3000";

/**
 * Core fetch wrapper.
 * @param {string} path     – e.g. "/api/notices"
 * @param {object} options  – standard fetch options (method, body, …)
 * @param {boolean} auth    – whether to attach Bearer token (default true)
 */
async function apiFetch(path, options = {}, requiresAuth = true) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };

  if (requiresAuth) {
    const user = auth.currentUser;
    if (!user) throw new Error("Not signed in.");
    const token = await getIdToken(user, /* forceRefresh */ false);
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  const data = await res.json().catch(() => ({ error: res.statusText }));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

/* ============================================================
   PUBLIC (no auth required)
   ============================================================ */

/** All notices, optional type filter */
export function getNotices(type = null) {
  const q = type ? `?type=${encodeURIComponent(type)}` : "";
  return apiFetch(`/api/notices${q}`, {}, false);
}

/** Single notice */
export function getNotice(id) {
  return apiFetch(`/api/notices/${id}`, {}, false);
}

/** All bus routes */
export function getBusRoutes() {
  return apiFetch("/api/bus/routes", {}, false);
}

/** School info (timeline + facilities + leadership) */
export function getSchoolInfo() {
  return apiFetch("/api/school/info", {}, false);
}

/* ============================================================
   AUTHENTICATED
   ============================================================ */

/** Logged-in student's profile */
export function getStudentProfile() {
  return apiFetch("/api/student");
}

/** Today's timetable */
export function getTimetable() {
  return apiFetch("/api/student/timetable");
}

/** Exam results */
export function getResults() {
  return apiFetch("/api/student/results");
}

/** Subject-wise attendance */
export function getAttendance() {
  return apiFetch("/api/student/attendance");
}

/** Fee structure */
export function getFees() {
  return apiFetch("/api/fees");
}

/** Payment history */
export function getPaymentHistory() {
  return apiFetch("/api/fees/history");
}

/**
 * Submit a new payment.
 * @param {{ desc, amount, method, txn }} payload
 */
export function submitPayment(payload) {
  return apiFetch("/api/fees/payment", {
    method: "POST",
    body:   JSON.stringify(payload),
  });
}

/**
 * Submit a bus application.
 * @param {{ studentName, studentClass, route, stop, contact, type, notes }} payload
 */
export function submitBusApplication(payload) {
  return apiFetch("/api/bus/applications", {
    method: "POST",
    body:   JSON.stringify(payload),
  });
}

/** Bus applications for the logged-in student */
export function getBusApplications() {
  return apiFetch("/api/bus/applications");
}

/**
 * Register a new account (links Firebase UID to a student admNo).
 * @param {{ email, password, admNo, name }} payload
 */
export async function registerAccount(payload) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body:   JSON.stringify(payload),
  }, false);
}
