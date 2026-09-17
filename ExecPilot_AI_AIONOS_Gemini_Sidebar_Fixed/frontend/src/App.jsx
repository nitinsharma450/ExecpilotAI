import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, Send, Sparkles, X, ArrowUpRight, ShieldCheck, BriefcaseBusiness, Users, Database, LayoutDashboard } from 'lucide-react';
import './App.css';

const API = import.meta.env.VITE_API_URL || '';

const NAV = [
  ['brief', 'Daily Brief', LayoutDashboard],
  ['actions', 'My Actions', BriefcaseBusiness],
  ['waiting', 'Waiting on Others', Users],
  ['calendar', 'Calendar', CalendarDays],
  ['evidence', 'Source Evidence', Database],
];

function StatCard({ label, value, Icon, tone }) {
  return <div className={`stat ${tone}`}><div className="stat-icon"><Icon size={18}/></div><div><strong>{value}</strong><span>{label}</span></div></div>;
}

function TaskCard({ task, onOpen }) {
  return <button className="task" onClick={() => onOpen(task)}>
    <div className="task-main">
      <div className="task-top"><span className={`status ${task.status}`}>{task.status.replace('_',' ')}</span><span className={`priority ${task.priority}`}>{task.priority} priority</span></div>
      <h3>{task.title}</h3><p>{task.summary}</p>
      <div className="meta"><span>{task.deadline_label}</span><span>•</span><span>{task.sources.length} grounded sources</span></div>
    </div><ArrowUpRight className="task-arrow" size={19}/>
  </button>;
}

function EmptyState({ children }) {
  return <div className="empty-state"><CheckCircle2 size={28}/><h3>Nothing pending here</h3><p>{children}</p></div>
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activePage, setActivePage] = useState('brief');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([{ type:'bot', text:'Good morning, Arjun. I can answer questions about your commitments, deadlines and open items using only the supplied evidence.' }]);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/tasks`).then(r=>r.json()),
      fetch(`${API}/api/calendar`).then(r=>r.json())
    ]).then(([t,c])=>{ setTasks(t); setCalendar(c); })
      .catch(()=>{ setTasks([]); setCalendar([]); });
  }, []);

  async function ask(text = question) {
    const q=text.trim(); if(!q || loading) return;
    setMessages(m=>[...m,{type:'user',text:q}]); setQuestion(''); setLoading(true);
    try {
      const r=await fetch(`${API}/api/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q})});
      const data=await r.json();
      setMessages(m=>[...m,{type:'bot',text:data.answer,sources:data.sources}]);
    } catch {
      setMessages(m=>[...m,{type:'bot',text:'I could not reach the agent service. Please try again.'}]);
    } finally { setLoading(false); }
  }

  const myActions = useMemo(()=>tasks.filter(t=>t.owner==='Arjun Malhotra' && t.status!=='completed'),[tasks]);
  const waiting = useMemo(()=>tasks.filter(t=>t.ownership==='waiting' || (t.owner && t.owner!=='Arjun Malhotra')),[tasks]);
  const visibleTasks = useMemo(()=>tasks.filter(t=>['vendor-list','meridian-call','expense-report','mumbai-lease'].includes(t.id)),[tasks]);

  const stats=[
    ['Overdue',tasks.filter(t=>t.status==='overdue').length,AlertTriangle,'danger'],
    ['Due / Confirmed',tasks.filter(t=>['overdue','confirmed'].includes(t.status)).length,Clock3,'warning'],
    ['Completed',tasks.filter(t=>t.status==='completed').length,CheckCircle2,'success'],
    ['Unclear Owner',tasks.filter(t=>t.ownership==='unclear').length,AlertTriangle,'neutral']
  ];

  function pageHeader(kicker, title, subtitle) {
    return <header className="page-header"><div><p className="eyebrow">{kicker}</p><h1>{title}</h1><p>{subtitle}</p></div><div className="grounded"><span></span> Grounded in supplied data</div></header>
  }

  function DailyBrief() {
    return <>
      {pageHeader('EXECUTIVE BRIEF · WED 23 SEP 2026','Good morning, Arjun.','Your priorities are resolved across meetings, email, calendar and voice notes.')}
      <section className="stats">{stats.map(([l,v,I,t])=><StatCard key={l} label={l} value={v} Icon={I} tone={t}/>)}</section>
      <div className="insight"><Sparkles size={18}/><div><b>Executive insight</b><span>Your highest-risk open item is the vendor list commitment to Raghav. The Mumbai lease also needs ownership confirmation before Friday EOD.</span></div></div>
      <div className="layout">
        <section><div className="section-title"><div><p>PRIORITY QUEUE</p><h2>Today's Action Brief</h2></div><span>{visibleTasks.length} items</span></div><div className="task-list">{visibleTasks.map(t=><TaskCard key={t.id} task={t} onOpen={setSelected}/>)}</div></section>
        <section className="right">
          <div className="panel"><div className="section-title compact"><div><p>SCHEDULE</p><h2><CalendarDays size={17}/> Upcoming</h2></div></div>{calendar.slice(3,7).map((item,i)=><div className="event" key={i}><div>{item.date}</div><b>{item.event}</b><span>{item.time}</span></div>)}</div>
          <Chat />
        </section>
      </div>
    </>;
  }

  function Chat() {
    return <div className="panel chat-panel"><div className="section-title compact"><div><p>GROUNDED Q&A</p><h2><Sparkles size={17}/> Ask ExecPilot</h2></div></div>
      <div className="chips"><button onClick={()=>ask('What did I promise Raghav?')}>Promise to Raghav?</button><button onClick={()=>ask('What needs action today?')}>Action today?</button><button onClick={()=>ask('Who owns the Mumbai office lease renewal?')}>Mumbai owner?</button></div>
      <div className="messages">{messages.slice(-5).map((m,i)=><div key={i} className={`message ${m.type}`}>{m.text}{m.sources?.length>0&&<small>Sources: {m.sources.join(' · ')}</small>}</div>)}{loading&&<div className="message bot">Reasoning over grounded evidence…</div>}</div>
      <form className="ask" onSubmit={e=>{e.preventDefault();ask();}}><input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ask about commitments, deadlines or ownership…"/><button aria-label="Send"><Send size={17}/></button></form>
    </div>;
  }

  function TaskPage({ mode }) {
    const isActions=mode==='actions';
    const list=isActions?myActions:waiting;
    return <>
      {pageHeader(isActions?'EXECUTIVE COMMITMENTS':'DEPENDENCY TRACKER',isActions?'My Actions':'Waiting on Others',isActions?'Commitments explicitly owned by Arjun, with the latest grounded deadline.':'Items owned by other people that Arjun is waiting to receive or review.')}
      <div className="page-grid">
        <section className="panel large-panel"><div className="section-title"><div><p>{isActions?'OWNED BY ARJUN':'EXTERNAL DEPENDENCIES'}</p><h2>{isActions?'Open commitments':'Delegated / waiting items'}</h2></div><span>{list.length} items</span></div>
        <div className="task-list">{list.length?list.map(t=><TaskCard key={t.id} task={t} onOpen={setSelected}/>):<EmptyState>No items match this view.</EmptyState>}</div></section>
        <section className="panel explainer"><ShieldCheck size={22}/><h3>{isActions?'Ownership rule':'Waiting rule'}</h3><p>{isActions?'Only commitments explicitly owned by Arjun appear here. The agent does not convert other people’s tasks into Arjun’s actions.':'A task appears here when another person has an explicit commitment. Completion evidence remains visible so Arjun can see what was received.'}</p></section>
      </div>
    </>;
  }

  function CalendarPage() {
    return <>
      {pageHeader('WEEK OF 21–25 SEP 2026','Calendar','Arjun’s supplied calendar, presented as supporting evidence for commitments and confirmed events.')}
      <section className="panel large-panel"><div className="section-title"><div><p>ARJUN MALHOTRA</p><h2>Weekly schedule</h2></div><span>{calendar.length} events</span></div>
      <div className="calendar-list">{calendar.map((item,i)=><div className="calendar-row" key={i}><div className="calendar-date">{item.date}</div><div><b>{item.event}</b><span>{item.time}</span></div></div>)}</div></section>
    </>;
  }

  function EvidencePage() {
    return <>
      {pageHeader('AUDITABLE REASONING','Source Evidence','Inspect exactly which supplied sources support each task. Click a card for the full evidence timeline.')}
      <section className="evidence-grid">{tasks.map(t=><button key={t.id} className="evidence-card" onClick={()=>setSelected(t)}>
        <div className="evidence-head"><span className={`status ${t.status}`}>{t.status}</span><ArrowUpRight size={18}/></div>
        <h3>{t.title}</h3><p>{t.summary}</p>
        <div className="source-stack">{t.sources.map((s,i)=><span key={i}><Database size={14}/>{s}</span>)}</div>
      </button>)}</section>
    </>;
  }

  return <div className="app">
    <aside>
      <div className="brand"><div className="brand-mark"><Sparkles size={19}/></div><div>ExecPilot <span>AI</span><small>Executive Intelligence</small></div></div>
      <nav>{NAV.map(([id,label,Icon])=><button key={id} className={activePage===id?'active':''} onClick={()=>setActivePage(id)}><Icon size={17}/><span>{label}</span></button>)}</nav>
      <div className="aside-note"><ShieldCheck size={16}/><div><b>Evidence-first agent</b><span>No unsupported facts</span></div></div>
      <div className="profile"><div className="avatar">AM</div><div><b>Arjun Malhotra</b><small>VP Sales</small></div></div>
    </aside>

    <main>
      {activePage==='brief'&&<DailyBrief/>}
      {activePage==='actions'&&<TaskPage mode="actions"/>}
      {activePage==='waiting'&&<TaskPage mode="waiting"/>}
      {activePage==='calendar'&&<CalendarPage/>}
      {activePage==='evidence'&&<EvidencePage/>}
    </main>

    {selected&&<div className="modal-backdrop" onClick={()=>setSelected(null)}><div className="modal" onClick={e=>e.stopPropagation()}>
      <button className="close" onClick={()=>setSelected(null)}><X size={19}/></button>
      <p className="eyebrow">EVIDENCE TRACE</p><h2>{selected.title}</h2><p className="modal-summary">{selected.summary}</p>
      <div className="modal-meta"><span><b>Owner</b>{selected.owner||'Unclear / unconfirmed'}</span><span><b>Deadline</b>{selected.deadline_label}</span><span><b>Status</b>{selected.status}</span></div>
      <h3>Reasoning timeline</h3><div className="timeline">{selected.timeline.map((x,i)=><div key={i}><span>{i+1}</span><p>{x}</p></div>)}</div>
      <h3>Grounded sources</h3><div className="source-stack">{selected.sources.map((s,i)=><span key={i}><Database size={14}/>{s}</span>)}</div>
    </div></div>}
  </div>;
}
