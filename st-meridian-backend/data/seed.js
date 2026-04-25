// data/seed.js
// Canonical school data that mirrors the frontend DB object.
// In production this all lives in Firestore; this file is used
// by the seed script (npm run seed) and as a fallback reference.

export const seedStudent = {
  name:   "Aryan Kumar",
  class:  "X-B",
  roll:   14,
  admNo:  "SMA-2024-1014",
  dob:    "12 Aug 2010",
  parent: "Rajesh Kumar",
  phone:  "+91 98765 43210",
  email:  "aryan.k@email.com",
};

export const seedNotices = [
  { id: "n1", title: "Half-Yearly Exam Schedule Released",  date: "18 Apr 2026", type: "exam",    tag: "Exam",    urgent: true,  content: "The Half-Yearly examination schedule for Classes VI–XII has been released. Exams begin 5th May 2026. Students are advised to collect their admit cards from the office by 30th April. Detailed timetable attached below.", by: "Academic Committee"   },
  { id: "n2", title: "Annual Sports Day — 25 April 2026",  date: "16 Apr 2026", type: "event",   tag: "Event",   urgent: false, content: "The Annual Sports Day will be held on Saturday, 25th April 2026 at the main grounds. All students must report by 7:30 AM in their respective house t-shirts. Parents are cordially invited.", by: "Sports Department"    },
  { id: "n3", title: "Fee Payment Deadline Reminder",      date: "14 Apr 2026", type: "urgent",  tag: "Urgent",  urgent: true,  content: "This is a reminder that Q3 tuition and transport fees are due by 30th April 2026. Late payment will attract a fine of ₹50 per day. Parents are requested to submit fees through the portal or at the school cash counter.", by: "Accounts Department"  },
  { id: "n4", title: "Summer Vacation Notice",             date: "10 Apr 2026", type: "holiday", tag: "Holiday", urgent: false, content: "School will remain closed for Summer Vacation from 16th May to 20th June 2026. The new academic session will commence on 22nd June 2026.", by: "Principal's Office"   },
  { id: "n5", title: "Science Exhibition — Entries Open",  date: "08 Apr 2026", type: "event",   tag: "Event",   urgent: false, content: "The Annual Inter-School Science Exhibition will be held on 2nd May 2026. Students of Classes VIII–XII are invited to submit project proposals to their Science teachers by 22nd April 2026.", by: "Science Department"   },
  { id: "n6", title: "Library Books Return Deadline",      date: "05 Apr 2026", type: "general", tag: "General", urgent: false, content: "All students are reminded to return library books borrowed before the winter break. Books must be returned by 25th April 2026 to avoid a fine of ₹5/day.", by: "Library Department"   },
];

export const seedFees = [
  { component: "Tuition Fee",        annual: 22000, paid: 16500, due: 5500, status: "partial" },
  { component: "Transport Fee",      annual: 7200,  paid: 5400,  due: 1800, status: "partial" },
  { component: "Exam Fee",           annual: 1600,  paid: 800,   due: 800,  status: "partial" },
  { component: "Library Fee",        annual: 1200,  paid: 1200,  due: 0,    status: "paid"    },
  { component: "Activity & Sports",  annual: 2000,  paid: 1600,  due: 400,  status: "partial" },
  { component: "Computer Lab Fee",   annual: 3000,  paid: 3000,  due: 0,    status: "paid"    },
  { component: "Building Dev. Fund", annual: 3000,  paid: 3000,  due: 0,    status: "paid"    },
  { component: "Miscellaneous",      annual: 2000,  paid: 0,     due: 0,    status: "na"      },
];

export const seedPaymentHistory = [
  { date: "15 Jan 2026", desc: "Tuition Fee Q2 + Transport", method: "UPI",        amount: 8500,  txn: "UPI202601150045", status: "Confirmed" },
  { date: "10 Oct 2025", desc: "Q1 — All Components",        method: "Net Banking", amount: 14000, txn: "NB202510100112",  status: "Confirmed" },
  { date: "25 Jun 2025", desc: "Registration & Admission",   method: "Card",        amount: 5000,  txn: "CARD202506251",   status: "Confirmed" },
];

export const seedTimetable = [
  { time: "8:00–8:45",   subject: "Mathematics",        teacher: "Mr. P. Sharma",  room: "204"     },
  { time: "8:45–9:30",   subject: "Physics",            teacher: "Mrs. S. Iyer",   room: "Lab-2"   },
  { time: "9:30–10:15",  subject: "English Literature", teacher: "Mr. D. Mehta",   room: "204"     },
  { time: "10:15–10:30", subject: "Break",              teacher: "—",              room: "—"       },
  { time: "10:30–11:15", subject: "Chemistry",          teacher: "Dr. R. Nair",    room: "Lab-1"   },
  { time: "11:15–12:00", subject: "History",            teacher: "Mrs. A. Tiwari", room: "204"     },
  { time: "12:00–12:45", subject: "Computer Science",   teacher: "Mr. V. Singh",   room: "IT Lab"  },
  { time: "12:45–1:30",  subject: "Lunch",              teacher: "—",              room: "—"       },
  { time: "1:30–2:15",   subject: "Physical Education", teacher: "Mr. K. Bose",    room: "Grounds" },
  { time: "2:15–3:00",   subject: "Hindi",              teacher: "Mrs. P. Gupta",  room: "204"     },
];

export const seedResults = [
  { subject: "Mathematics",        max: 100, scored: 98, grade: "A+", remarks: "Outstanding"   },
  { subject: "Physics",            max: 70,  scored: 65, grade: "A+", remarks: "Excellent"     },
  { subject: "Chemistry",          max: 70,  scored: 61, grade: "A",  remarks: "Very Good"     },
  { subject: "Biology",            max: 70,  scored: 58, grade: "A",  remarks: "Very Good"     },
  { subject: "English",            max: 80,  scored: 73, grade: "A+", remarks: "Excellent"     },
  { subject: "Hindi",              max: 80,  scored: 68, grade: "A",  remarks: "Very Good"     },
  { subject: "Computer Science",   max: 70,  scored: 70, grade: "A+", remarks: "Perfect Score!"},
  { subject: "Physical Education", max: 50,  scored: 47, grade: "A+", remarks: "Outstanding"  },
];

export const seedAttendance = [
  { subject: "Mathematics",      total: 80, present: 74, pct: 92.5 },
  { subject: "Physics",          total: 60, present: 55, pct: 91.7 },
  { subject: "Chemistry",        total: 60, present: 52, pct: 86.7 },
  { subject: "Biology",          total: 60, present: 51, pct: 85.0 },
  { subject: "English",          total: 70, present: 63, pct: 90.0 },
  { subject: "Hindi",            total: 60, present: 48, pct: 80.0 },
  { subject: "Computer Science", total: 55, present: 48, pct: 87.3 },
];

export const seedBusRoutes = [
  { no: "B-01", name: "City Centre via MG Road",    stops: ["Station Road","MG Road Crossing","Central Park","Market Square"],       time: "7:00 AM – 7:40 AM", bus: "UP 80 BX 1234", capacity: 45, fee: 1800, available: true  },
  { no: "B-02", name: "Greenfield / Oakwood Area",  stops: ["Greenfield Park Gate","Oakwood Society","Sector 3 Main","DPS Chowk"],   time: "7:10 AM – 7:50 AM", bus: "UP 80 BX 5678", capacity: 40, fee: 1600, available: true  },
  { no: "B-03", name: "Riverside Colony",           stops: ["River Bridge","Indira Colony","Old Power House","Sector 1"],             time: "6:55 AM – 7:45 AM", bus: "UP 80 BX 9012", capacity: 50, fee: 2000, available: false },
  { no: "B-04", name: "Sector 7–12 Express",        stops: ["Sector 7","Sector 9 Park","Sector 11 Gate","Sector 12 Main"],           time: "7:20 AM – 7:55 AM", bus: "UP 80 BX 3456", capacity: 42, fee: 1500, available: true  },
  { no: "B-05", name: "Palm Heights / Avenue Road", stops: ["Palm Heights Entrance","Avenue Cross","Lal Chowk","Canal Road"],         time: "7:05 AM – 7:45 AM", bus: "UP 80 BX 7890", capacity: 38, fee: 1750, available: true  },
];

export const seedTimeline = [
  { year: "1952", title: "Foundation",              desc: "St. Meridian Academy was founded by Dr. Albert D'Souza with 3 classrooms and 48 students on the banks of the Mira River." },
  { year: "1965", title: "CBSE Affiliation",        desc: "The school received official CBSE affiliation and expanded to include Classes I–X. The iconic red-brick main building was constructed." },
  { year: "1978", title: "Senior Secondary Wing",   desc: "Classes XI–XII were introduced offering Science and Commerce streams. The first XII batch appeared in Board examinations in 1980." },
  { year: "1992", title: "Science Block & Library", desc: "A dedicated Science block and a library holding over 20,000 volumes was inaugurated by the Governor." },
  { year: "2005", title: "Digital Transformation", desc: "Computer labs, projector-enabled classrooms and an early intranet network were established." },
  { year: "2015", title: "Smart Campus Initiative",desc: "Full WiFi campus, smart boards, biometric attendance and a modern sports complex were commissioned." },
  { year: "2022", title: "Platinum Jubilee",        desc: "The school celebrated its 70th anniversary with a new 3-storey STEM block, 400-seat auditorium, and indoor sports hall." },
  { year: "2025", title: "ERP & Digital Portal",   desc: "A comprehensive digital ERP system was launched connecting students, parents, staff and administration." },
];

export const seedFacilities = [
  { icon: "🏫", name: "Smart Classrooms",  desc: "40 fully digitised classrooms with interactive boards" },
  { icon: "🔬", name: "Science Labs",      desc: "Physics, Chemistry, Biology, Geography labs"           },
  { icon: "💻", name: "Computer Labs",     desc: "3 labs with 180 high-spec workstations"                },
  { icon: "📚", name: "Central Library",   desc: "25,000+ volumes + digital e-library access"            },
  { icon: "🏊", name: "Swimming Pool",     desc: "Olympic-size heated indoor pool"                       },
  { icon: "🎭", name: "Auditorium",        desc: "400-seat fully air-conditioned auditorium"             },
  { icon: "⚽", name: "Sports Complex",    desc: "Football, Basketball, Badminton, Cricket"              },
  { icon: "🎨", name: "Art & Music Rooms", desc: "Dedicated creative arts spaces with instruments"       },
];

export const seedLeadership = [
  { name: "Mrs. Sunita Verma",  role: "Principal",         exp: "32 years in Education", badge: "🎓" },
  { name: "Mr. Arun Kapoor",    role: "Vice Principal",    exp: "24 years in Education", badge: "📚" },
  { name: "Mrs. Priya Nair",    role: "Head of Academics", exp: "20 years in Education", badge: "⚗️" },
  { name: "Mr. Suresh Mehta",   role: "Dean of Students",  exp: "18 years in Education", badge: "🏆" },
  { name: "Mrs. Kavita Tiwari", role: "Head of Sports",    exp: "15 years in Education", badge: "⚽" },
  { name: "Mr. Ravi Sharma",    role: "Finance Controller",exp: "12 years in Admin",      badge: "💼" },
];
