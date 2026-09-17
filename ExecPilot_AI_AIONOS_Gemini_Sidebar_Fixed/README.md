# ExecPilot AI — Executive Productivity Agent

> **AIONOS Agentic AI Factory · Assignment 1**  
> A professional, evidence-grounded executive copilot that converts fragmented meetings, emails, calendars and voice notes into a clear daily action brief.

**Live Demo:** https://execpilotai-1.onrender.com

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

Create a Gemini API key in Google AI Studio. 

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

**Candidate:** Nitin Sharma  
**Assignment:** AIONOS — Executive Productivity Agent\

### Production architecture

`React → FastAPI → Gemini API`

During Render deployment, React is built with Vite. FastAPI serves the production frontend and exposes the API endpoints, so the recruiter receives one public URL.


## Functional navigation
All five sidebar sections are implemented in React: Daily Brief, My Actions, Waiting on Others, Calendar, and Source Evidence. Task/evidence cards open a detailed evidence timeline modal.
