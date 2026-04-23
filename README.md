## InternPilot (Demo App)

InternPilot is a **demo-ready** full-stack web app for a 5–6 minute school presentation.

- **Upload a resume PDF** (editable text preview + manual paste fallback)
- **Analyze a job posting** (URL fetch or paste + “Load Demo Scenario”)
- **Match experience to the role**
- **Generate** tailored resume bullets + **1 main cover letter** + **2 alternate tones**
- **Refinement** questions (2–3)
- **Save** into a simple application tracker (Draft → Offer)

### Tech stack
- Next.js (App Router) + TypeScript
- Tailwind + shadcn/ui
- Prisma 7 + SQLite (driver adapter)
- OpenAI API (`gpt-4o-mini`) with **mock fallback**
- `pdf-parse` for PDF text extraction

---

## Setup

### 1) Install dependencies

```bash
cd internpilot
npm install
```

### 2) Configure environment

Copy `.env.example` → `.env` (or just edit `.env`):

- **Database**: already points to local SQLite
- **OpenAI (optional)**: set `OPENAI_API_KEY` if you want real AI

```bash
# internpilot/.env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY=""
```

### 3) Create DB + seed demo data

```bash
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

### 4) Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Reliability Notes (for demo)

- **No authentication**: single demo user stored in SQLite.
- **No exports**: text-only outputs (fast + simple).
- **AI is only called on button clicks** (no loops, no surprise costs).
- **Mock fallback**: if `OPENAI_API_KEY` is missing or the API fails, endpoints automatically return realistic mock results so the demo never breaks.

---

## Exact 5-minute demo walkthrough

### 0:00–0:30 — Landing + what it does
- Go to `/`
- Click **Start demo flow**

### 0:30–1:30 — Load Demo Scenario (instant setup)
- On **New Application**, click **Load Demo Scenario**
- Point out:
  - seeded UGA MIS student profile
  - seeded BlackRock-style posting
  - manual edit boxes (demo-safe)

### 1:30–2:30 — Analyze + Match (button-driven)
- Click **Analyze Posting**
- Click **Match Resume**
- Mention:
  - never invents experience
  - highlights transferable skills + gaps constructively
  - mock fallback if no API key

### 2:30–3:30 — Generate outputs
- (Optional) answer 1–2 refinement questions
- Click **Generate Outputs**
- Show:
  - tailored resume bullets
  - main cover letter

### 3:30–4:30 — Save + Results tabs
- Click **Save to Tracker**
- On the Results page:
  - open **Resume Bullets**
  - open **Cover Letter** (3 versions)
  - open **Match Analysis** and click **Refresh Match Analysis**

### 4:30–5:00 — Tracker + status update
- Go to `/tracker`
- Change status (Draft → Applied → Interview) to show it’s persisted

---

## Key pages
- `/` Landing
- `/dashboard` Dashboard
- `/applications/new` Demo flow stepper
- `/applications/[id]` Results (tabs)
- `/experience` Experience Bank
- `/tracker` Application Tracker

