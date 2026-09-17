from pathlib import Path
import json
import os

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types

ROOT = Path(__file__).resolve().parents[1]
TASKS = json.loads((ROOT / "data/tasks.json").read_text(encoding="utf-8"))
CALENDAR = json.loads((ROOT / "data/calendar.json").read_text(encoding="utf-8"))
FRONTEND_DIST = ROOT / "frontend" / "dist"

app = FastAPI(
    title="ExecPilot AI",
    version="2.0.0",
    description="Evidence-grounded executive productivity agent with Gemini Q&A",
)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class ChatRequest(BaseModel):
    question: str

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "ExecPilot AI",
        "ai_enabled": bool(os.getenv("GEMINI_API_KEY")),
    }

@app.get("/api/tasks")
def tasks():
    return TASKS

@app.get("/api/calendar")
def calendar():
    return CALENDAR

@app.get("/api/brief")
def brief():
    return {
        "executive": "Arjun Malhotra",
        "role": "VP Sales",
        "as_of": "Wednesday, 23 September 2026",
        "summary": {"overdue": 1, "due_today": 2, "completed": 1, "unclear_owner": 1},
        "priorities": [TASKS[0], TASKS[2], TASKS[3], TASKS[4]],
    }

def fallback_answer(q: str):
    """Reliable fallback if Gemini is unavailable."""
    x = q.lower()
    if "raghav" in x or "vendor" in x:
        t = TASKS[0]
        return (
            f"You promised Raghav the updated vendor list. The latest explicit commitment is {t['deadline_label']}. "
            "Raghav followed up Wednesday at 8:45 AM. Status: action required / overdue.",
            t["sources"],
        )
    if "today" in x or "attention" in x or "priority" in x or "action" in x:
        return (
            "Today: (1) send Raghav the vendor list — overdue; (2) attend the confirmed Meridian Logistics call at 3:00 PM; "
            "(3) the expense variance report is due from Divya Wednesday evening; (4) keep the Mumbai lease ownership risk visible — "
            "do not assign an owner without evidence.",
            ["Vendor List email thread", "Call Reschedule email thread", "Expense Variance Report email thread", "Mumbai Office Lease Renewal thread"],
        )
    if "lease" in x or "mumbai" in x or "owner" in x:
        t = TASKS[4]
        return (
            "The Mumbai lease signature is due Friday EOD, but ownership is still unclear. Arjun explicitly said to flag it and not assume. "
            "Divya only said she believes it typically sits with Facilities; that is not a confirmed assignment.",
            t["sources"],
        )
    if "expense" in x or "divya" in x or "variance" in x:
        t = TASKS[3]
        return (
            "The July expense variance report was requested for Wednesday evening. Divya sent it at 6:00 PM and Arjun acknowledged it at 6:10 PM, so this item is completed.",
            t["sources"],
        )
    if "meridian" in x or "priya" in x or "client call" in x:
        t = TASKS[2]
        return (
            "The Meridian Logistics call is confirmed for Wednesday at 3:00 PM. Priya accepted the time and Arjun reconfirmed at 2:00 PM; the calendar matches it.",
            t["sources"],
        )
    if "deck" in x or "neha" in x or "campaign" in x:
        t = TASKS[1]
        return (
            "The Q3 campaign deck review moved from Wednesday to Thursday at 9:30 AM. Neha confirmed the time, and her calendar shows the review with Arjun.",
            t["sources"],
        )
    return (
        "I can answer questions grounded in the supplied data pack about Arjun's commitments, deadlines, calendar, people and open items. "
        "Try: ‘What did I promise Raghav?’, ‘What needs action today?’, or ‘Who owns the Mumbai lease?’",
        [],
    )

def build_context() -> str:
    return json.dumps({"tasks": TASKS, "calendar": CALENDAR}, indent=2, ensure_ascii=False)

def gemini_answer(question: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    client = genai.Client(api_key=api_key)
    system_instruction = """
You are ExecPilot, an Executive Productivity Agent for Arjun Malhotra, VP Sales.
Answer ONLY from the supplied structured evidence. Never invent a person, owner, deadline, completion state, meeting, or commitment.
If the evidence is unclear, explicitly say it is unclear. Later explicit commitments supersede earlier versions of the same commitment.
Keep answers concise, practical, and executive-friendly. Do not claim to send emails or change calendars.
""".strip()

    prompt = f"""SUPPLIED EVIDENCE:\n{build_context()}\n\nUSER QUESTION:\n{question}\n\nAnswer using only the evidence above."""
    response = client.models.generate_content(
        model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.1,
            max_output_tokens=350,
        ),
    )
    return response.text.strip()

@app.post("/api/chat")
def chat(req: ChatRequest):
    fallback, sources = fallback_answer(req.question)
    try:
        answer = gemini_answer(req.question)
        return {"answer": answer, "sources": sources, "grounded": True, "mode": "gemini"}
    except Exception:
        # The demo stays usable if the API key is missing, quota is exhausted,
        # or the external model is temporarily unavailable.
        return {"answer": fallback, "sources": sources, "grounded": True, "mode": "fallback"}

if (FRONTEND_DIST / "assets").exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

@app.get("/{full_path:path}")
def spa(full_path: str):
    candidate = FRONTEND_DIST / full_path
    if full_path and candidate.is_file():
        return FileResponse(candidate)
    return FileResponse(FRONTEND_DIST / "index.html")
