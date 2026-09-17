# ExecPilot AI — Executive Productivity Agent

> **AIONOS Agentic AI Factory · Assignment 1**  
> A professional, evidence-grounded executive copilot that converts fragmented meetings, emails, calendars and voice notes into a clear daily action brief.

**Live Demo:** `ADD_YOUR_RENDER_URL_HERE`

> AI Q&A uses the Gemini API through the FastAPI backend. The API key is stored only as a server-side environment variable and is never exposed to React or committed to GitHub.  
**Demo Video:** `ADD_YOUR_GOOGLE_DRIVE_URL_HERE`

## Why this solution

Executive commitments change across channels. ExecPilot does more than summarize: it resolves the latest explicit commitment, separates the executive's actions from items waiting on others, detects deadlines and completion, deduplicates repeated actions, and deliberately leaves ownership unresolved when the evidence is ambiguous.

### Key capabilities

- **Daily Action Brief** — priority view of what needs attention.
- **Commitment Tracking** — follows changing commitments across sources.
- **My Actions vs Waiting** — distinguishes Arjun's work from dependencies.
- **Deadline Intelligence** — identifies due, overdue and completed items.
- **Cross-source Deduplication** — one action, even when mentioned repeatedly.
- **Uncertainty Guardrail** — flags unclear ownership instead of hallucinating.
- **Grounded Q&A** — answers questions with the evidence sources used.
- **Evidence Timeline** — click any action to inspect how the conclusion was reached.

## Reviewer demo path

Try these questions in **Ask ExecPilot**:

```text
What did I promise Raghav?
What needs action today?
Who owns the Mumbai lease?
```

The third question demonstrates an important safety behavior: the agent does **not** assign the Mumbai lease to Facilities because the supplied evidence never confirms that ownership.

## Architecture

```text
Meeting Transcript ─┐
Email Threads ───────┤
Calendar ────────────┼──> Normalized Evidence
Voice Notes ─────────┘           │
                                 ▼
                      Commitment Reasoning
                    ┌────────────────────────┐
                    │ deadline resolution    │
                    │ status resolution      │
                    │ deduplication          │
                    │ ownership guardrail    │
                    └────────────┬───────────┘
                                 ▼
                         FastAPI REST API
                                 │
                                 ▼
                         React Dashboard
                     Daily Brief + Grounded Q&A
```

## Technology

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + Vite | Responsive executive dashboard |
| Backend | FastAPI | Agent APIs, grounding and secure Gemini calls |
| AI | Gemini API | Grounded natural-language Q&A |
| Data | Structured JSON | Normalized assignment evidence |
| Deployment | Render + Render | Single-service reproducible deployment |
| UI | CSS + Lucide React | Lightweight professional interface |

## Run locally

### Render — recommended

```bash
uvicorn backend.main:app --reload
```

Open `http://localhost:8000`.

### Development mode

Backend:

```bash
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

Frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.


## Gemini API setup

Create a Gemini API key in Google AI Studio. **Do not put the real key in React, source code, `.env.example`, or GitHub.**

For local development on Windows PowerShell:

```powershell
$env:GEMINI_API_KEY="YOUR_REAL_KEY"
uvicorn backend.main:app --reload
```

For Render, open your Web Service → **Environment** and add:

```text
GEMINI_API_KEY = your real key
GEMINI_MODEL   = gemini-2.5-flash
```

The React browser never receives the secret. React calls `/api/chat`; FastAPI reads the environment variable and calls Gemini server-side. If Gemini is unavailable, the backend returns a grounded deterministic fallback so the demo still works.

## Deploy to Render

1. Push this repository to GitHub.
2. In Render choose **New → Web Service** and connect the repository.
3. Render detects the included `render.yaml` / Renderfile configuration.
4. Deploy the service.
5. Copy the public Render URL and replace `ADD_YOUR_RENDER_URL_HERE` at the top of this README.

The Render image builds React first, then packages the production `dist` files with FastAPI. The deployed application therefore uses **one public URL** for both the React UI and `/api/*` endpoints.

## API endpoints

```text
GET  /api/health
GET  /api/tasks
GET  /api/calendar
GET  /api/brief
POST /api/chat
```

FastAPI interactive documentation is available at `/docs`.

## Grounding & assumptions

- Arjun Malhotra (VP Sales) is the agent's user.
- Only the supplied assignment data is treated as factual evidence.
- Later explicit commitments supersede earlier versions of the same commitment.
- Completion requires explicit supporting evidence.
- Ambiguous ownership is surfaced as ambiguous rather than guessed.
- The Q&A layer uses Gemini when `GEMINI_API_KEY` is configured. A deterministic grounded fallback keeps the demo usable if the external API is temporarily unavailable.

## AI tools used

AI assistance was used for solution architecture, implementation support, UI refinement, reasoning validation and documentation. At runtime, Gemini powers natural-language Q&A, but it receives only the normalized assignment evidence and strict grounding instructions. Deterministic task/status logic remains the source of truth for critical workflow state.

## Production roadmap

Enterprise connectors for Gmail/Calendar/Teams, structured LLM extraction, persistent source lineage, confidence scoring, role-based access, audit logs, notifications, and human approval before any outbound action.

---

**Candidate:** Nitin Sharma  
**Assignment:** AIONOS — Executive Productivity Agent


---

## Deploy on Render — No Docker

This repository is configured for a native Render Web Service. Docker is not used.

### Render settings

- **Runtime:** Python
- **Build command:** `cd frontend && npm install && npm run build && cd .. && pip install -r requirements.txt`
- **Start command:** `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

### Environment variables

Add these in **Render → Service → Environment**:

```text
GEMINI_API_KEY=your_actual_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

Never commit the real `GEMINI_API_KEY` to GitHub.

### Local development

Backend:

```bash
python -m venv venv
# Windows
venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

Frontend (second terminal):

```bash
cd frontend
npm install
npm run dev
```

The React development server normally runs at `http://localhost:5173` and FastAPI at `http://localhost:8000`.

### Production architecture

`React → FastAPI → Gemini API`

During Render deployment, React is built with Vite. FastAPI serves the production frontend and exposes the API endpoints, so the recruiter receives one public URL.


## Functional navigation
All five sidebar sections are implemented in React: Daily Brief, My Actions, Waiting on Others, Calendar, and Source Evidence. Task/evidence cards open a detailed evidence timeline modal.
