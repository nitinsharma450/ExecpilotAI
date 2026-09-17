# ExecPilot AI — Executive Productivity Agent

**AIONOS Agentic AI Factory · Assignment 1**

## 👨‍💻 Candidate

**Nitin Sharma**

**Assignment:** AIONOS — Executive Productivity Agent  
**Track:** Agentic AI Factory — Assignment 1


**GitHub Repository:**  
https://github.com/nitinsharma450/ExecpilotAI

## 🚀 Live Demo

**DEMO:** https://execpilotai-1.onrender.com
## ✨ Key Features

- **Daily Brief** — summarizes important commitments and priorities.
- **My Actions** — shows commitments explicitly owned by Arjun.
- **Waiting on Others** — tracks dependencies owned by other people.
- **Calendar** — displays the supplied executive schedule.
- **Source Evidence** — shows the evidence supporting each task.
- **Grounded Q&A** — ask questions such as:
  - “What did I promise Raghav?”
  - “What needs action today?”
  - “Who owns the Mumbai office lease renewal?”
- **Ownership Guardrail** — unclear ownership is flagged instead of guessed.
- **Evidence Timeline** — task cards provide supporting source history.

---

## 🏗️ Architecture

```text
AIONOS Supplied Data
(Meetings + Emails + Calendars + Voice Notes)
                         │
                         ▼
                Structured JSON Data
                         │
                         ▼
                 FastAPI Backend
              ┌─────────────────────┐
              │ Task processing     │
              │ Deadline resolution │
              │ Status resolution   │
              │ Deduplication       │
              │ Ownership guardrail │
              └──────────┬──────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
        REST API Endpoints      Gemini API
        /api/tasks              Grounded Q&A
        /api/calendar                │
        /api/brief                   │
        /api/chat ◄──────────────────┘
              │
              ▼
          React + Vite
              │
              ▼
      ExecPilot Dashboard
   ┌────────────────────────┐
   │ Daily Brief            │
   │ My Actions             │
   │ Waiting on Others      │
   │ Calendar               │
   │ Source Evidence        │
   │ Ask ExecPilot          │
   └────────────────────────┘
              │
              ▼
        Arjun Malhotra
           VP Sales
```

---

## 🔄 Process Flow

```text
1. Load supplied assignment data
                ↓
2. Structure commitments and evidence
                ↓
3. Resolve deadlines, status and ownership
                ↓
4. Deduplicate repeated commitments
                ↓
5. FastAPI exposes structured information
                ↓
6. React displays the executive dashboard
                ↓
7. User asks natural-language questions
                ↓
8. Gemini answers using grounded evidence
```

Critical workflow state such as ownership, deadlines, status, and evidence remains controlled by structured task logic. Gemini is primarily used for natural-language interaction over that grounded context.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + Vite | Interactive executive dashboard |
| Backend | FastAPI | REST APIs and agent orchestration |
| AI | Gemini API | Grounded natural-language Q&A |
| Data | Structured JSON | Normalized assignment evidence |
| UI | CSS + Lucide React | Lightweight professional interface |
| Deployment | Render | Frontend Static Site + Backend Web Service |
| Version Control | GitHub | Source-code management |

---

## 📡 API Endpoints

The FastAPI backend exposes:

```text
GET  /api/health
GET  /api/tasks
GET  /api/calendar
GET  /api/brief
POST /api/chat
```



## 💻 Run Locally

### 1. Backend

From the project root:

```bash
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

FastAPI runs at:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### 2. Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

---

## 🧠 Grounding & Assumptions

The prototype follows several important grounding rules:

1. **Arjun Malhotra (VP Sales)** is the user of the executive agent.
2. Only the supplied assignment data is treated as factual evidence.
3. Later explicit commitments supersede earlier versions of the same commitment.
4. Completion requires supporting evidence.
5. Ambiguous ownership is surfaced as **unclear** rather than guessed.
6. Repeated references to the same commitment are deduplicated.
7. Gemini receives grounded assignment context and instructions not to invent unsupported information.

