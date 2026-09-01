import { useMemo, useState } from 'react'
import {
  Bell, CalendarDays, CheckCircle2, Clock3, LayoutDashboard, MessageSquare,
  Phone, Settings, Stethoscope, Users, Wifi, WifiOff
} from 'lucide-react'
import { hasSupabase } from './lib/supabase'

const appointments = [
  { time: '09:00', patient: 'Emma Thompson', service: 'Dental Check-up', status: 'Confirmed', phone: '+44 7700 900101' },
  { time: '10:30', patient: 'James Wilson', service: 'Hygiene', status: 'Booked', phone: '+44 7700 900102' },
  { time: '13:00', patient: 'Olivia Brown', service: 'Consultation', status: 'Confirmed', phone: '+44 7700 900103' },
  { time: '15:30', patient: 'Daniel Smith', service: 'Emergency', status: 'Booked', phone: '+44 7700 900104' },
]

const recentActivity = [
  ['AI call completed', 'Emma booked a Dental Check-up', '2 min ago'],
  ['SMS reminder sent', 'James Wilson · 24 hour reminder', '18 min ago'],
  ['Appointment rescheduled', 'Olivia moved to 13:00', '44 min ago'],
  ['Missed call recovered', 'Follow-up SMS sent automatically', '1 hr ago'],
]

const nav = [
  ['Dashboard', LayoutDashboard], ['Appointments', CalendarDays], ['Patients', Users],
  ['Calls', Phone], ['Messages', MessageSquare], ['Notifications', Bell], ['Settings', Settings],
]

export default function App() {
  const [page, setPage] = useState('Dashboard')
  const [mobileNav, setMobileNav] = useState(false)
  const stats = useMemo(() => [
    ['Appointments Today', '4', CalendarDays],
    ['Confirmed', '2', CheckCircle2],
    ['Calls Today', '7', Phone],
    ['Messages Sent', '12', MessageSquare],
  ], [])

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
        <div className="brand"><div className="brand-mark"><Stethoscope size={20}/></div><div><strong>Dental AI</strong><span>Receptionist</span></div></div>
        <nav>{nav.map(([label, Icon]) => <button key={label} className={page===label?'active':''} onClick={()=>{setPage(label);setMobileNav(false)}}><Icon size={18}/>{label}</button>)}</nav>
        <div className="sidebar-foot"><span className="live-dot"/> Demo Mode</div>
      </aside>

      <main>
        <header>
          <button className="menu" onClick={()=>setMobileNav(v=>!v)}>☰</button>
          <div><h1>{page}</h1><p>BrightSmile Dental Demo</p></div>
          <div className="connection">{hasSupabase ? <Wifi size={17}/> : <WifiOff size={17}/>} {hasSupabase ? 'Supabase connected' : 'Sample data mode'}</div>
        </header>

        {page === 'Dashboard' ? <Dashboard stats={stats}/> : <Placeholder page={page}/>} 
      </main>
    </div>
  )
}

function Dashboard({ stats }) {
  return <div className="content">
    <section className="hero">
      <div><span className="eyebrow">AI RECEPTIONIST ONLINE</span><h2>Good morning 👋</h2><p>Sophie is ready to answer calls, book appointments and handle reminders.</p></div>
      <div className="hero-pill"><span className="live-dot"/> Test mode active</div>
    </section>

    <section className="stats-grid">{stats.map(([label,value,Icon])=><article className="stat" key={label}><div className="stat-icon"><Icon size={20}/></div><div><strong>{value}</strong><span>{label}</span></div></article>)}</section>

    <section className="two-col">
      <article className="panel">
        <div className="panel-head"><div><h3>Today's appointments</h3><p>Tuesday · Demo schedule</p></div><button>View calendar</button></div>
        <div className="appointment-list">{appointments.map(a=><div className="appointment" key={a.time}><div className="time"><Clock3 size={16}/>{a.time}</div><div className="patient"><strong>{a.patient}</strong><span>{a.service} · {a.phone}</span></div><span className={`badge ${a.status.toLowerCase()}`}>{a.status}</span></div>)}</div>
      </article>

      <article className="panel">
        <div className="panel-head"><div><h3>Recent automation</h3><p>Calls, reminders and booking actions</p></div></div>
        <div className="activity-list">{recentActivity.map(([title,detail,time])=><div className="activity" key={title+time}><span className="activity-dot"/><div><strong>{title}</strong><span>{detail}</span></div><small>{time}</small></div>)}</div>
      </article>
    </section>

    <section className="panel integrations">
      <div className="panel-head"><div><h3>Integrations</h3><p>Client credentials will be connected here</p></div></div>
      <div className="integration-grid">{['Google Calendar','Twilio','Vapi AI','n8n Automation'].map((x,i)=><div className="integration" key={x}><div><span className="integration-logo">{['G','T','V','n8n'][i]}</span><strong>{x}</strong></div><span className="pending">Sample</span></div>)}</div>
    </section>
  </div>
}

function Placeholder({ page }) {
  const copy = {
    Appointments: 'Calendar view, booking, reschedule and cancellation controls will live here.',
    Patients: 'Patient contact details, appointment history and notes will live here.',
    Calls: 'Inbound/outbound AI call history, summaries and transcripts will live here.',
    Messages: 'SMS and WhatsApp confirmations, reminders and follow-ups will live here.',
    Notifications: 'Missed calls, failed messages and appointment alerts will live here.',
    Settings: 'Clinic details, opening hours, services, AI receptionist and integrations will be configured here.',
  }
  return <div className="content"><section className="panel empty"><h2>{page}</h2><p>{copy[page]}</p><span>UI foundation ready · backend wiring next</span></section></div>
}
