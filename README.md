# St. Meridian Academy — ERP Portal Backend

A production-ready Node.js + Express backend that serves the St. Meridian ERP Portal frontend, backed by **Firebase Authentication** and **Firestore**.

---

## Project Structure

```
st-meridian-backend/
├── server.js                  ← Express entry point
├── package.json
├── .env.example               ← Copy to .env and fill in values
├── config/
│   └── firebase.js            ← Firebase Admin SDK init
├── middleware/
│   └── auth.js                ← Bearer token verification
├── routes/
│   ├── auth.js                ← /api/auth/*
│   ├── student.js             ← /api/student/*
│   ├── fees.js                ← /api/fees/*
│   ├── notices.js             ← /api/notices/*
│   ├── bus.js                 ← /api/bus/*
│   └── school.js              ← /api/school/*
├── data/
│   └── seed.js                ← All initial school data
├── scripts/
│   └── seedFirestore.js       ← One-time DB population script
└── frontend-files/
    ├── firebase.js            ← Updated frontend firebase config
    └── api.js                 ← Frontend fetch wrapper (replaces DB object)
```

---

## Quick Start

### 1 — Prerequisites

- Node.js 18 or later
- A Firebase project with **Authentication** and **Firestore** enabled

### 2 — Install dependencies

```bash
cd st-meridian-backend
npm install
```

### 3 — Firebase service account key

1. Go to **Firebase Console → Project Settings → Service accounts**
2. Click **Generate new private key** → download the JSON file
3. Copy `.env.example` to `.env` and fill in the three Firebase values from that JSON:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR KEY...\n-----END PRIVATE KEY-----\n"
PORT=3000
CORS_ORIGINS=http://localhost:5501,http://localhost:5500
```

> **Never commit `.env` to Git.** The `.gitignore` below handles this.

### 4 — Seed the database (one time only)

```bash
node scripts/seedFirestore.js
```

This populates:
- `/notices` — 6 school notices
- `/busRoutes` — 5 routes
- `/timeline`, `/facilities`, `/leadership`
- `/students/SMA-2024-1014` + sub-collections (fees, timetable, results, attendance, paymentHistory)

### 5 — Start the server

```bash
# Development (auto-restarts on file changes — Node 18+)
npm run dev

# Production
npm start
```

You should see:
```
🏫  St. Meridian ERP API running on http://localhost:3000
```

---

## API Reference

All responses are JSON. Authenticated endpoints require:
```
Authorization: Bearer <Firebase ID Token>
```

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | ❌ | Server status |

### Auth

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| POST | `/api/auth/register` | ❌ | `{ email, password, admNo, name }` | Create account + link to student |
| GET | `/api/auth/me` | ✅ | — | Current user info |

### Student

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/student` | ✅ | Profile (name, class, roll, etc.) |
| GET | `/api/student/timetable` | ✅ | Today's timetable |
| GET | `/api/student/results` | ✅ | Exam results |
| GET | `/api/student/attendance` | ✅ | Subject-wise attendance |

### Fees

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| GET | `/api/fees` | ✅ | — | Fee structure |
| GET | `/api/fees/history` | ✅ | — | Payment history |
| POST | `/api/fees/payment` | ✅ | `{ desc, amount, method, txn }` | Submit payment |

### Notices

| Method | Path | Auth | Query | Description |
|--------|------|------|-------|-------------|
| GET | `/api/notices` | ❌ | `?type=exam\|event\|urgent\|holiday\|general` | All notices |
| GET | `/api/notices/:id` | ❌ | — | Single notice |
| POST | `/api/notices` | ✅ Admin | `{ title, content, type, ... }` | Create notice |

### Bus

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/bus/routes` | ❌ | All bus routes |
| GET | `/api/bus/applications` | ✅ | Student's applications |
| POST | `/api/bus/applications` | ✅ | `{ route, stop, contact, type }` → Submit application |

### School Info

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/school/info` | ❌ | Timeline + facilities + leadership |
| GET | `/api/school/timeline` | ❌ | History timeline |
| GET | `/api/school/facilities` | ❌ | School facilities |
| GET | `/api/school/leadership` | ❌ | Staff leadership |

---

## Connecting the Frontend

1. Copy `frontend-files/firebase.js` → your HTML project folder, fill in your Firebase config values.
2. Copy `frontend-files/api.js` → same folder.
3. In `script.js`, replace the hardcoded `DB` fetches with the imported API functions. Example:

```js
// OLD (script.js)
renderNotices(DB.notices);

// NEW (script.js) — at the top add:
import { getNotices } from "./api.js";

// Then in DOMContentLoaded:
const { notices } = await getNotices();
renderNotices(notices);
```

4. In `login.js`, change the import:
```js
import { auth } from "./firebase.js"; // ← no change needed
```

---

## Firestore Data Model

```
/notices/{id}
/busRoutes/{routeNo}
/timeline/{year}
/facilities/{index}
/leadership/{index}

/students/{admNo}
    /fees/{index}
    /paymentHistory/{docId}
    /timetable/{index}
    /results/{index}
    /attendance/{index}
    /busApplications/{docId}

/users/{uid}         ← links Firebase UID → admNo
```

---

## Deployment (Railway / Render / Fly.io)

1. Push this folder to a GitHub repository.
2. Connect the repo to Railway / Render.
3. Set the environment variables from `.env` in the platform's dashboard.
4. Set `CORS_ORIGINS` to your production frontend URL.
5. The platform will run `npm start` automatically.

---

## .gitignore

Create this file in the project root:

```
node_modules/
.env
*.log
```

---

## Security Notes

- **Never** expose your service account key or `.env` file.
- The `/api/notices` POST endpoint checks for `req.user.admin` (a Firebase custom claim). Set it via Admin SDK: `auth.setCustomUserClaims(uid, { admin: true })`.
- Rate limiting is set to 120 requests / 15 min per IP — adjust in `server.js` for production.
