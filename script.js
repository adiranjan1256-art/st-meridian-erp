/* ============================================================
   St. Meridian Academy — ERP Portal
   script.js  (API-connected version)
   ============================================================ */

"use strict";

import {
  getNotices, getBusRoutes, getSchoolInfo,
  getStudentProfile, getTimetable, getResults,
  getAttendance, getFees, getPaymentHistory,
  submitPayment as apiSubmitPayment,
  submitBusApplication, getBusApplications
} from "./api.js";

/* ============================================================
   RUNTIME STATE
   ============================================================ */
const DB = {
  notices:        [],
  fees:           [],
  paymentHistory: [],
  timetable:      [],
  results:        [],
  attendance:     [],
  busRoutes:      [],
  busApplications:[],
  student:        {},
  timeline:       [],
  facilities:     [],
  leadership:     []
};


/* ============================================================
   NAVIGATION
   ============================================================ */

const PAGE_META = {
  dashboard:  { title: "Dashboard",           subtitle: "Academic Year 2025–26"                  },
  fees:       { title: "Fee Payment",         subtitle: "Manage & track your fee payments"        },
  notices:    { title: "Notices & Circulars", subtitle: "Official school announcements"           },
  syllabus:   { title: "Syllabus",            subtitle: "Curriculum & academic progress"          },
  bus:        { title: "Bus Facility",        subtitle: "School transport management"             },
  history:    { title: "About & History",     subtitle: "Our legacy & infrastructure"             },
  results:    { title: "Results & Grades",    subtitle: "Examination results & grades"            },
  attendance: { title: "Attendance",          subtitle: "Daily attendance record"                 }
};

function navigate(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));

  const el = document.getElementById("page-" + page);
  if (el) el.classList.add("active");

  document.querySelectorAll(".nav-item").forEach(n => {
    if ((n.getAttribute("onclick") || "").includes(`'${page}'`)) n.classList.add("active");
  });

  const meta = PAGE_META[page] || {};
  document.getElementById("pageTitle").textContent    = meta.title    || page;
  document.getElementById("pageSubtitle").textContent = meta.subtitle || "";

  closeSidebar();
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("sidebarOverlay").classList.toggle("hidden");
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarOverlay").classList.add("hidden");
}


/* ============================================================
   TOAST
   ============================================================ */

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
}


/* ============================================================
   DASHBOARD
   ============================================================ */

function renderDashboard() {
  const noticesContainer = document.getElementById("dashNotices");
  noticesContainer.innerHTML = "";
  DB.notices.slice(0, 3).forEach(n => {
    noticesContainer.innerHTML += `
      <div class="px-5 py-3 flex items-start gap-3 hover:bg-amber-50/50 cursor-pointer transition" onclick="navigate('notices')">
        <span class="badge mt-0.5 ${n.urgent ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}">${n.tag}</span>
        <div class="min-w-0">
          <p class="text-sm font-medium text-navy-900 truncate">${n.title}</p>
          <p class="text-xs text-gray-400">${n.date}</p>
        </div>
      </div>`;
  });

  const ttContainer = document.getElementById("timetable");
  ttContainer.innerHTML = "";
  DB.timetable.forEach(t => {
    const isBreak = t.subject === "Break" || t.subject === "Lunch";
    ttContainer.innerHTML += `
      <div class="px-5 py-3 flex items-center gap-4 ${isBreak ? "bg-amber-50/60" : "hover:bg-gray-50"}">
        <div class="text-xs text-gray-400 w-24 flex-shrink-0 font-mono">${t.time}</div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium ${isBreak ? "text-amber-600" : "text-navy-900"}">${t.subject}</p>
          ${!isBreak ? `<p class="text-xs text-gray-400">${t.teacher} · Room ${t.room}</p>` : ""}
        </div>
      </div>`;
  });
}


/* ============================================================
   FEES
   ============================================================ */

function renderFees() {
  const feeTable = document.getElementById("feeTable");
  feeTable.innerHTML = "";
  DB.fees.forEach(f => {
    const statusBadge = {
      paid:    `<span class="badge bg-green-100 text-green-600">✓ Paid</span>`,
      partial: `<span class="badge bg-amber-100 text-amber-700">₹${f.due.toLocaleString()} due</span>`,
      na:      `<span class="badge bg-gray-100 text-gray-400">—</span>`
    };
    feeTable.innerHTML += `
      <tr class="fee-row border-b border-gray-100 text-gray-700">
        <td class="px-5 py-3">${f.component}</td>
        <td class="px-5 py-3 text-right">₹${f.annual.toLocaleString()}</td>
        <td class="px-5 py-3 text-right">${statusBadge[f.status]}</td>
      </tr>`;
  });
  _rebuildPaymentHistory();
}

function _rebuildPaymentHistory() {
  const ph = document.getElementById("paymentHistory");
  ph.innerHTML = "";
  DB.paymentHistory.forEach(p => {
    const isPending = p.status === "Pending";
    ph.innerHTML += `
      <tr class="border-b border-gray-50 text-gray-700">
        <td class="px-5 py-3 text-gray-400 text-xs">${p.date}</td>
        <td class="px-5 py-3">${p.desc}</td>
        <td class="px-5 py-3 text-xs text-gray-400">${p.method}</td>
        <td class="px-5 py-3 text-right font-semibold text-navy-900">₹${p.amount.toLocaleString()}</td>
        <td class="px-5 py-3 text-right">
          <span class="badge ${isPending ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600"}">${p.status}</span>
        </td>
      </tr>`;
  });
}

async function submitPayment() {
  const payFor  = document.getElementById("payFor").value;
  const amount  = document.getElementById("payAmount").value;
  const ref     = document.getElementById("payRef").value;
  const method  = document.querySelector("input[name='payMethod']:checked");

  if (!payFor || payFor.startsWith("Select") || !amount || !ref || !method) {
    showToast("⚠ Please fill all payment details.");
    return;
  }

  document.getElementById("modalPayDesc").textContent = `${payFor} — ₹${parseFloat(amount).toLocaleString()}`;
  document.getElementById("modalPayRef").textContent  = `Ref: ${ref} · Method: ${method.value.toUpperCase()}`;
  document.getElementById("payModal").classList.add("open");

  try {
    const result = await apiSubmitPayment({
      desc: payFor, amount: parseFloat(amount), method: method.value, txn: ref
    });
    DB.paymentHistory.unshift(result.entry);
    _rebuildPaymentHistory();
  } catch (err) {
    // If not logged in, still show locally
    const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    DB.paymentHistory.unshift({
      date: today, desc: payFor, method: method.value,
      amount: parseFloat(amount), txn: ref, status: "Pending"
    });
    _rebuildPaymentHistory();
  }
}

function closePayModal() {
  document.getElementById("payModal").classList.remove("open");
}


/* ============================================================
   NOTICES
   ============================================================ */

const NOTICE_TYPE_CLASS = {
  exam:    "notice-info",
  event:   "notice-general",
  urgent:  "notice-urgent",
  holiday: "notice-general",
  general: "notice-general"
};

const NOTICE_BADGE_CLASS = {
  exam:    "bg-blue-100 text-blue-700",
  event:   "bg-gold-100 text-gold-700",
  urgent:  "bg-red-100 text-red-600",
  holiday: "bg-green-100 text-green-700",
  general: "bg-gray-100 text-gray-600"
};

function renderNotices(notices) {
  const container = document.getElementById("noticeList");
  if (!container) return;
  container.innerHTML = "";
  notices.forEach(n => {
    const borderClass = NOTICE_TYPE_CLASS[n.type] || "notice-general";
    const badgeClass  = NOTICE_BADGE_CLASS[n.type]  || "bg-gray-100 text-gray-600";
    container.innerHTML += `
      <div class="bg-white rounded-xl border border-amber-100 p-5 ${borderClass}">
        <div class="flex items-start justify-between gap-3 mb-2">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="badge ${badgeClass}">${n.tag}</span>
            ${n.urgent ? `<span class="badge bg-red-100 text-red-500">Urgent</span>` : ""}
          </div>
          <span class="text-xs text-gray-400 flex-shrink-0">${n.date}</span>
        </div>
        <h3 class="font-display font-bold text-navy-900 mb-1">${n.title}</h3>
        <p class="text-sm text-gray-600 leading-relaxed">${n.content}</p>
        <p class="text-xs text-gray-400 mt-3">— ${n.by}</p>
      </div>`;
  });
}

function filterNotices() {
  const type = document.getElementById("noticeFilter")?.value || "all";
  if (type === "all") return renderNotices(DB.notices);
  renderNotices(DB.notices.filter(n => n.type === type));
}


/* ============================================================
   SYLLABUS (static — not personalised per student)
   ============================================================ */

const syllabusData = {
  X: {
    I: [
      { subject: "Mathematics", icon: "📐", topics: ["Real Numbers","Polynomials","Pair of Linear Equations","Quadratic Equations","AP & Sequences","Triangles (Similarity)"], completion: 100 },
      { subject: "Physics",     icon: "⚛️", topics: ["Light — Reflection & Refraction","Human Eye & Colourful World","Electricity basics"], completion: 100 },
      { subject: "Chemistry",   icon: "🧪", topics: ["Chemical Reactions & Equations","Acids, Bases & Salts","Metals and Non-metals"], completion: 100 },
      { subject: "Biology",     icon: "🌿", topics: ["Life Processes","Control & Coordination","How do Organisms Reproduce?"], completion: 100 },
      { subject: "English",     icon: "📖", topics: ["First Flight — Ch 1–6","Footprints without Feet — Ch 1–5","Grammar & Writing Skills"], completion: 100 },
      { subject: "Hindi",       icon: "🖊️", topics: ["Kshitij — Ch 1–8","Kritika — Ch 1–3","Grammar & Composition"], completion: 100 }
    ],
    II: [
      { subject: "Mathematics", icon: "📐", topics: ["Trigonometry","Circles","Constructions","Areas related to Circles","Surface Areas & Volumes","Statistics & Probability"], completion: 65 },
      { subject: "Physics",     icon: "⚛️", topics: ["Magnetic Effects of Electric Current","Sources of Energy"], completion: 55 },
      { subject: "Chemistry",   icon: "🧪", topics: ["Carbon & its Compounds","Classification of Elements — Periodic Table"], completion: 60 },
      { subject: "Biology",     icon: "🌿", topics: ["Heredity & Evolution","Our Environment","Sustainable Management"], completion: 50 },
      { subject: "English",     icon: "📖", topics: ["First Flight — Ch 7–11","Footprints — Ch 6–10","Letter & Essay Writing"], completion: 70 },
      { subject: "Hindi",       icon: "🖊️", topics: ["Kshitij — Ch 9–17","Kritika — Ch 4–5","Formal Hindi Writing"], completion: 60 }
    ]
  }
};

function renderSyllabus() {
  const termSelect  = document.getElementById("syllabusTerm");
  const classSelect = document.getElementById("syllabusClass");
  const container   = document.getElementById("syllabusCards");
  if (!container) return;

  const cls  = (classSelect?.value  || "X").replace("Class ", "");
  const term = (termSelect?.value   || "Term I").replace("Term ", "");
  const data = syllabusData[cls]?.[term === "I" ? "I" : "II"] || syllabusData["X"]["II"];

  container.innerHTML = "";
  data.forEach(s => {
    const topicsHtml = s.topics.map(t => `<li class="text-xs text-gray-500">• ${t}</li>`).join("");
    container.innerHTML += `
      <div class="bg-white rounded-xl border border-amber-100 p-5">
        <div class="flex items-center gap-3 mb-3">
          <span class="text-2xl">${s.icon}</span>
          <div class="flex-1">
            <p class="font-display font-bold text-navy-900">${s.subject}</p>
            <div class="progress-bar mt-1">
              <div class="progress-fill" style="width:${s.completion}%"></div>
            </div>
          </div>
          <span class="text-sm font-bold text-gold-600">${s.completion}%</span>
        </div>
        <ul class="space-y-1">${topicsHtml}</ul>
      </div>`;
  });
}


/* ============================================================
   BUS
   ============================================================ */

function renderBus() {
  const container = document.getElementById("busRoutes");
  if (!container) return;
  container.innerHTML = "";
  DB.busRoutes.forEach(r => {
    const stopsHtml = r.stops.map(s => `<span class="badge bg-navy-100 text-navy-600">${s}</span>`).join("");
    container.innerHTML += `
      <div class="card-hover bg-white rounded-xl border border-amber-100 p-5">
        <div class="flex items-start justify-between gap-3 mb-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="font-display font-bold text-navy-900">${r.no}</span>
              <span class="font-medium text-gray-700">${r.name}</span>
            </div>
            <p class="text-xs text-gray-400">${r.time} · ${r.bus}</p>
          </div>
          <div class="text-right flex-shrink-0">
            <p class="font-bold text-navy-900">₹${r.fee.toLocaleString()}<span class="text-xs font-normal text-gray-400">/yr</span></p>
            <span class="badge ${r.available ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}">${r.available ? "Available" : "Full"}</span>
          </div>
        </div>
        <div class="flex flex-wrap gap-1.5">${stopsHtml}</div>
      </div>`;
  });
}

async function submitBusApp() {
  const name    = document.getElementById("busName")?.value  || DB.student.name || "";
  const cls     = document.getElementById("busClass")?.value    || DB.student.class || "";
  const route   = document.getElementById("busRoute")?.value;
  const stop    = document.getElementById("busStop")?.value;
  const contact = document.getElementById("busContact")?.value;
  const type    = document.querySelector("input[name='appType']:checked");

  if (!route || route.startsWith("Select") || !stop || !contact || !type) {
    showToast("⚠ Please fill all required fields.");
    return;
  }

  const app = {
    studentName: name, studentClass: cls,
    route, stop, contact, type: type.value, notes: ""
  };

  try {
    await submitBusApplication(app);
    showToast("✅ Bus application submitted successfully!");
  } catch {
    showToast("✅ Application saved locally.");
  }

  DB.busApplications.push({
    ...app,
    date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    status: "Under Review"
  });
  renderBusApps();
  document.getElementById("busAppSection").style.display = "block";
  document.getElementById("busStop").value    = "";
  document.getElementById("busContact").value = "";
}

function renderBusApps() {
  const list = document.getElementById("busAppList");
  if (!list) return;
  list.innerHTML = "";
  DB.busApplications.forEach(a => {
    const label = a.type === "new" ? "New Application" : "Change Route";
    list.innerHTML += `
      <div class="px-5 py-4 hover:bg-amber-50/40">
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-sm font-semibold text-navy-900">${a.route}</p>
            <p class="text-xs text-gray-500 mt-0.5">Stop: ${a.stop} · Contact: ${a.contact}</p>
            <p class="text-xs text-gray-400 mt-0.5">Applied: ${a.date} · Type: ${label}</p>
          </div>
          <span class="badge bg-yellow-100 text-yellow-600">${a.status}</span>
        </div>
      </div>`;
  });
}


/* ============================================================
   HISTORY / ABOUT
   ============================================================ */

function renderHistory() {
  const fac = document.getElementById("facilitiesList");
  if (fac) {
    fac.innerHTML = "";
    DB.facilities.forEach(f => {
      fac.innerHTML += `
        <div class="flex items-center gap-3">
          <span class="text-xl w-8">${f.icon}</span>
          <div>
            <p class="text-sm font-semibold text-navy-900">${f.name}</p>
            <p class="text-xs text-gray-400">${f.desc}</p>
          </div>
        </div>`;
    });
  }

  const tl = document.getElementById("timeline");
  if (tl) {
    tl.innerHTML = "";
    DB.timeline.forEach((t, i) => {
      tl.innerHTML += `
        <div class="flex gap-4">
          <div class="flex flex-col items-center">
            <div class="timeline-dot"></div>
            ${i < DB.timeline.length - 1 ? `<div class="w-0.5 flex-1 bg-gold-200 mt-1"></div>` : ""}
          </div>
          <div class="pb-5 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-display font-bold text-gold-600 text-lg">${t.year}</span>
              <span class="font-bold text-navy-900 text-sm">${t.title}</span>
            </div>
            <p class="text-sm text-gray-600 leading-relaxed">${t.desc}</p>
          </div>
        </div>`;
    });
  }

  const lead = document.getElementById("leadership");
  if (lead) {
    lead.innerHTML = "";
    DB.leadership.forEach(l => {
      lead.innerHTML += `
        <div class="card-hover bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex items-start gap-4">
          <div class="w-11 h-11 bg-navy-800 rounded-xl flex items-center justify-center text-xl flex-shrink-0">${l.badge}</div>
          <div>
            <p class="font-semibold text-navy-900 text-sm">${l.name}</p>
            <p class="text-xs text-gold-600 font-medium">${l.role}</p>
            <p class="text-xs text-gray-400 mt-0.5">${l.exp}</p>
          </div>
        </div>`;
    });
  }
}


/* ============================================================
   RESULTS
   ============================================================ */

function renderResults() {
  const tbody = document.getElementById("resultsTable");
  if (!tbody) return;
  tbody.innerHTML = "";
  const gradeColors = { "A+": "text-green-600", "A": "text-blue-600", "B+": "text-amber-600" };
  DB.results.forEach(r => {
    const pct   = ((r.scored / r.max) * 100).toFixed(0);
    const color = gradeColors[r.grade] || "text-navy-600";
    tbody.innerHTML += `
      <tr class="fee-row border-b border-gray-100">
        <td class="px-5 py-3 font-medium text-navy-900">${r.subject}</td>
        <td class="px-5 py-3 text-right text-gray-500">${r.max}</td>
        <td class="px-5 py-3 text-right font-bold text-navy-900">
          ${r.scored} <span class="text-xs text-gray-400 font-normal">(${pct}%)</span>
        </td>
        <td class="px-5 py-3 text-right font-bold ${color}">${r.grade}</td>
        <td class="px-5 py-3 text-right text-xs text-gray-500">${r.remarks}</td>
      </tr>`;
  });
}


/* ============================================================
   ATTENDANCE
   ============================================================ */

function renderAttendance() {
  const list = document.getElementById("attendanceList");
  if (!list) return;
  list.innerHTML = "";
  DB.attendance.forEach(a => {
    const barColor  = a.pct >= 90 ? "bg-green-500" : a.pct >= 75 ? "bg-gold-500" : "bg-red-400";
    const textColor = a.pct >= 90 ? "text-green-600" : a.pct >= 75 ? "text-gold-600" : "text-red-500";
    const warning   = a.pct < 75 ? `<p class="text-xs text-red-500 mt-1">⚠ Below 75% — attendance warning</p>` : "";
    list.innerHTML += `
      <div>
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-medium text-navy-900">${a.subject}</span>
          <span class="text-xs font-bold ${textColor}">${a.pct}% · ${a.present}/${a.total} days</span>
        </div>
        <div class="progress-bar">
          <div class="${barColor} h-full rounded-full transition-all" style="width:${a.pct}%"></div>
        </div>
        ${warning}
      </div>`;
  });
}


/* ============================================================
   EXPOSE GLOBALS (called from HTML onclick attributes)
   ============================================================ */

window.navigate      = navigate;
window.toggleSidebar = toggleSidebar;
window.closeSidebar  = closeSidebar;
window.showToast     = showToast;
window.submitPayment = submitPayment;
window.closePayModal = closePayModal;
window.submitBusApp  = submitBusApp;
window.filterNotices = filterNotices;
window.renderSyllabus = renderSyllabus;

/* ============================================================
   INITIALISE — fetch all data then render
   ============================================================ */

window.addEventListener("DOMContentLoaded", async () => {
  // Wire up Sign Out button
  document.querySelector(".sidebar .border-t button")?.addEventListener("click", async () => {
    const { auth } = await import("./firebase.js");
    const { signOut } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
    await signOut(auth);
    showToast("✅ Signed out successfully.");
  });

  try {
    // Public data — no login needed
    const [noticesData, busData, schoolData] = await Promise.all([
      getNotices(),
      getBusRoutes(),
      getSchoolInfo()
    ]);

    DB.notices    = noticesData.notices    || [];
    DB.busRoutes  = busData.routes         || [];
    DB.timeline   = schoolData.timeline    || [];
    DB.facilities = schoolData.facilities  || [];
    DB.leadership = schoolData.leadership  || [];

    renderNotices(DB.notices);
    renderBus();
    renderHistory();

  } catch (err) {
    console.warn("Public data fetch failed:", err.message);
    showToast("⚠ Could not load some data. Is the backend running?");
  }

  // Render syllabus (static)
  renderSyllabus();

  // Navigate to dashboard
  navigate("dashboard");

  // Try to load student data if logged in (handled by auth state in login.js)
  // Student data is loaded by loadStudentData() called from login.js
});


/* ============================================================
   LOAD STUDENT DATA (called from login.js after sign-in)
   ============================================================ */

export async function loadStudentData() {
  try {
    const [profile, ttData, resData, attData, feesData, histData] = await Promise.all([
      getStudentProfile(),
      getTimetable(),
      getResults(),
      getAttendance(),
      getFees(),
      getPaymentHistory()
    ]);

    DB.student        = profile.student        || {};
    DB.timetable      = ttData.timetable       || [];
    DB.results        = resData.results        || [];
    DB.attendance     = attData.attendance     || [];
    DB.fees           = feesData.fees          || [];
    DB.paymentHistory = histData.history       || [];

    // Update student info in sidebar if elements exist
    const nameEl = document.getElementById("studentName");
    const clsEl  = document.getElementById("studentClass");
    if (nameEl) nameEl.textContent = DB.student.name  || "";
    if (clsEl)  clsEl.textContent  = DB.student.class || "";

    renderDashboard();
    renderFees();
    renderResults();
    renderAttendance();

    showToast(`✅ Welcome back, ${DB.student.name || "Student"}!`);
  } catch (err) {
    console.warn("Student data fetch failed:", err.message);
  }
}
